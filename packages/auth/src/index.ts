import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { toNodeHandler } from "better-auth/node";
import { prisma } from "@repo/db/client";

export { toNodeHandler };

const trustedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BACKEND_URL ?? "http://localhost:3000",
  trustedOrigins,
  advanced: {
    useSecureCookies: process.env.PROD === "true",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Dev: log the link. Prod: swap for Resend/SMTP.
        if (process.env.RESEND_API_KEY) {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.MAIL_FROM ?? "Trello <onboarding@resend.dev>",
              to: email,
              subject: "Sign in to Trello",
              text: `Click to sign in:\n${url}`,
            }),
          });
          if (!res.ok) {
            console.error(
              `[magic-link] Resend error ${res.status}:`,
              await res.text(),
            );
            // Fall back to logging the link so sign-in still works in dev.
            console.log(`[magic-link] ${email}: ${url}`);
          }
        } else {
          console.log(`[magic-link] ${email}: ${url}`);
        }
      },
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Magic-link (and other) signups may arrive without a name —
          // derive one from the email's local part (e.g. "adarsha@x.com" → "adarsha").
          if (!user.name || user.name.trim() === "") {
            const localPart = user.email.split("@")[0] ?? "";
            const name = localPart
              .split(/[._-]+/)
              .filter(Boolean)
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");
            return { data: { ...user, name: name || user.email } };
          }
          return { data: user };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
