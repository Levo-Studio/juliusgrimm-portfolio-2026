# Julius Grimm Portfolio 2026

![Julius Grimm Logo](./public/jg_logo.png)

Founder on accident. Engineer by design.

Built with Next.js, PostgreSQL, Tailwind, and a suspicious amount of spacing decisions.

Open sourced because I like open source and because hiding portfolio code felt boring.
Readable on purpose. Overengineered only where emotionally necessary.

## Overview
A personal portfolio and case-study system with an editorial black/green design language, dynamic project pages, and a secure admin panel.

## Tech Stack
- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS v4
- PostgreSQL + Drizzle ORM
- Server-side GitHub API fetch for "Last touched"
- Vitest + React Testing Library + Playwright

## Features
- Pixel-faithful homepage and case-study layout based on Figma references
- Reusable section architecture (label/content split)
- Dynamic project list and project detail routes from PostgreSQL
- Admin panel (`/admin`) for editing/hiding projects and revoking sessions
- Audit logs for auth and project actions
- Security headers, CSRF validation, rate-limited login path, HttpOnly session cookies
- Impressum page with up-to-date German legal wording (`§ 5 DDG`)

## Design System
- Background: `#000000`
- Main text: `#FFFFFF`
- Green: `#5BE38B`
- Orange: `#E3AD5B`
- Red: `#E35B5B`
- Blue: `#5B76E3`
- Fonts: `Inria Sans` + `Instrument Serif` (via `next/font`)

## Project Structure
```txt
src/
  app/
  components/
  hooks/
  lib/
  server/
  tests/
  types/
scripts/
drizzle/
```

## Environment Variables
Copy `.env.example` to `.env.local`:

```bash
DATABASE_URL=
```

First visit to `/admin`:
- The first successful login creates the single admin account automatically.
- After that, only that account can log in.

## Database
Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Development
```bash
pnpm install
pnpm dev
```

Run tests:

```bash
pnpm test
pnpm test:e2e
```

Before release:

```bash
pnpm audit
pnpm build
```

## License
MIT License, 2026 Julius Grimm. See [LICENSE](./LICENSE).
