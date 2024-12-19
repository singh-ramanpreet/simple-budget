FROM node:22-bookworm-slim

WORKDIR /app

COPY lib ./lib
COPY drizzle.config.ts .

RUN corepack enable pnpm && pnpm init && pnpm add drizzle-orm drizzle-kit @libsql/client dotenv 

CMD ["pnpm", "drizzle-kit", "push"]
