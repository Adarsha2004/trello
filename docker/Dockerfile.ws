FROM oven/bun:1

WORKDIR /app

COPY ./packages ./packages
COPY ./bun.lock ./bun.lock

COPY ./package.json ./package.json
COPY ./turbo.json ./turbo.json

COPY ./apps/websocket ./apps/websocket

RUN bun install
RUN DATABASE_URL=postgresql://user:pass@localhost:5432/db bun run db:generate

EXPOSE 8080

CMD ["bun","run","start:websocket"]