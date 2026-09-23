# Trello

A Trello-style project management app — organisations, boards, sections, and issues with drag-and-drop and real-time collaboration. Built as a Bun monorepo and deployed to Kubernetes with ArgoCD.

Live at: **https://trello.adarshanatia.xyz**

## Features

- **Auth** — magic link (email) + OAuth (Google, GitHub) via Better Auth, cookie-based sessions, route guards on protected pages
- **Organisations** — create/delete (admin only), invite members by email with a debounced account check, email invitations via Resend, accept pending invitations, ADMIN/MEMBER roles
- **Boards** — create/delete (admin only), kanban sections, drag-and-drop issues (fractional indexing for stable ordering)
- **Realtime** — WebSocket presence with live avatars and profile pictures, instant sync of issue moves and board updates across clients
- **UI** — React 19 SPA, Tailwind CSS v4, shadcn/ui components, TanStack Query for data fetching/caching, lucide icons

## Tech Stack

| Layer      | Tech                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Frontend   | React 19, react-router, TanStack Query, react-dnd, Tailwind v4, shadcn/ui |
| Backend    | Express (Bun runtime), Better Auth                                   |
| Realtime   | `ws` WebSocket server with Better Auth session validation             |
| Database   | PostgreSQL (Neon) + Prisma ORM                                        |
| Email      | Resend (magic links + org invitations)                                |
| Monorepo   | Bun workspaces + Turborepo                                            |
| Deploy     | Docker, GitHub Actions, Kubernetes (GKE), ArgoCD, sealed-secrets      |

## Repository Structure

```
apps/
  frontend/     React SPA (served on :5173)
  backend/      Express API (served on :3000)
  websocket/    WS server for presence + realtime (served on :8080)
packages/
  db/           Prisma schema + generated client
  auth/         Better Auth server config + React client
  ui/           Shared UI stubs
k8s/            Kubernetes manifests (ArgoCD watches this path)
docker/         Dockerfiles per app
.github/        CD workflows (build images, bump manifests)
```

## Local Development

Prerequisites: [Bun](https://bun.sh) >= 1.3 and a PostgreSQL database (e.g. a free [Neon](https://neon.tech) project).

1. Install dependencies:

   ```sh
   bun install
   ```

2. Create a `.env` in the repo root (all apps read it via `dotenv`):

   ```env
   DATABASE_URL="postgresql://..."          # Postgres connection string
   BETTER_AUTH_SECRET="<random 32+ chars>"  # openssl rand -hex 32
   BACKEND_PORT=3000
   FRONTEND_URL="http://localhost:5173"     # CORS + Better Auth trusted origins
   BACKEND_URL="http://localhost:3000"      # Better Auth baseURL
   WS_PORT=8080

   RESEND_API_KEY="re_..."                  # optional; magic links log to console without it
   MAIL_FROM="Trello <noreply@yourdomain>"

   GOOGLE_CLIENT_ID=                        # optional; sign-in buttons error until filled
   GOOGLE_CLIENT_SECRET=
   GITHUB_CLIENT_ID=
   GITHUB_CLIENT_SECRET=
   ```

3. Generate the Prisma client and run migrations:

   ```sh
   bun run db:generate
   bun run db:migrate
   ```

4. Start the three apps (in separate terminals or via turbo):

   ```sh
   bun run start:web        # http://localhost:5173
   bun run start:backend    # http://localhost:3000
   bun run start:websocket  # ws://localhost:8080
   ```

   Or all at once: `bun run dev`

Note: after editing `.env`, restart the processes — `bun --hot` reloads code, not env files.

### Type checks / lint / build

```sh
bun run check-types
bun run lint
bun run build
```

## OAuth Provider Setup

Both providers are optional — the auth server only registers a provider when both its credentials are present. Callback URL pattern: `<BACKEND_URL>/api/auth/callback/<provider>`.

**Google** (console.cloud.google.com → APIs & Services → Credentials):

- Redirect URI: `http://localhost:3000/api/auth/callback/google` (dev) and `https://trello.adarshanatia.xyz/api/auth/callback/google` (prod) — both can live on one client
- JavaScript origin: your frontend URL

**GitHub** (github.com → Settings → Developer settings → OAuth Apps):

- Callback URL: `http://localhost:3000/api/auth/callback/github` — GitHub allows only **one** callback per app, so create a second app for prod: `https://trello.adarshanatia.xyz/api/auth/callback/github`

## Deployment

Pushes to `main` deploy automatically:

1. **GitHub Actions** (`cd_backend.yml`, `cd_frontend.yml`, `cd_ws.yml`) build each app's Docker image, push it to Docker Hub tagged with the commit SHA, and commit the new image tag into `k8s/*.yml`
2. **ArgoCD** watches the `k8s/` path on `main` (auto-sync + self-heal + prune) and applies the manifests to the GKE cluster
3. **Ingress** (nginx + cert-manager/Let's Encrypt) routes `trello.adarshanatia.xyz`: `/api` → backend, `/ws` → websocket, `/` → frontend

Secrets live in the `trello-secrets` SealedSecret (encrypted with the cluster's sealed-secrets controller via `kubeseal`). To add or rotate a secret:

```sh
kubectl create secret generic trello-secrets --dry-run=client -o yaml \
  --from-literal=KEY=value | \
  kubeseal --controller-name=sealed-secrets-controller \
           --controller-namespace=sealed-secrets -o yaml >> k8s/sealed-secret.yml
```

Commit and push — ArgoCD applies it, then `kubectl rollout restart deployment/<app>` picks up new env vars.

> Changes to `k8s/` must go through git; manual `kubectl apply`/`edit` is reverted by ArgoCD's self-heal.
