# Simple Budget

A small, opinionated self-hosted budgeting app built with Next.js, Drizzle ORM, Tailwind CSS and React.

![Screen Recording GIF](doc/images/ScreenRecording2025-11-22.gif)

## Summary

Simple Budget is a minimal personal finance web app that demonstrates a modern full-stack Next.js
setup including authentication, database migrations with Drizzle, and a responsive UI built with
Tailwind CSS and Radix UI primitives. The project is intended as a starter / reference for small
projects where you want a simple but complete budgeting experience.

## Features

- Sign up / Sign in flows (auth handled with `better-auth` integration)
- Create, edit and list buckets (budget categories)
- Add, edit and filter transactions
- Simple charts and visualizations (Recharts)
- Session management and profile settings
- Database migrations and studio via `drizzle-kit`

## Tech Stack

- Framework: `Next.js`
- Styling: `Tailwind CSS`
- ORM / Migrations: `drizzle-orm` + `drizzle-kit`
- Auth: `better-auth` (project-specific integration)
- Language: `TypeScript`

## Deployment

The app can be deployed to any platform that supports docker compose.
`Makefile` provides commands to build, run, stop and migrate database.
Example deployment on a server:

For first time setup, create a `.env` file with production settings (see `.env.sample` for reference). And run migrations:

```bash
make migrate-production
```

Then run:

```bash
git clone
cd simple-budget
# Edit .env file with your settings
make build-production
make up-production
```

Follow the Sign Up link to create the first user.

## Local Development

Use VS Code with Dev Containers. Reopen the project folder in the container to get started.

Install dependencies:

```bash
pnpm install
```

Create the database file locally

```bash
pnpm db:push
```

Run the development server:

```bash
pnpm dev
```

Build for production to test the production build:

```bash
pnpm build
pnpm start
```

Lint and format:

```bash
pnpm lint
pnpm format
```

## Database

This project uses `drizzle-kit` for migrations. Available npm scripts in `package.json`:

- `pnpm db:push` — push schema to the database
- `pnpm db:generate` — generate migration files
- `pnpm db:migrate` — run migrations
- `pnpm db:studio` — open Drizzle Studio

Configure your database connection via environment variables (see `.env.sample`).

## Environment

Create a `.env` (or set env vars) with values required by the app, for example:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/simple_budget
NEXTAUTH_URL=http://localhost:3000
```

Adjust keys to match the project's `lib/auth` and `drizzle.config.ts` expectations.

See `.env.sample` for reference.

---
