# Julius Grimm Portfolio 2026

<p align="center">
  <img src="./public/jg_logo.png" alt="Julius Grimm Logo" width="120" height="120" />
</p>

<p align="center"><strong>Founder on accident. Engineer by design.</strong></p>

<p align="center">
  <a href="https://juliusgrimm.dev">Website</a> ·
  <a href="https://github.com/Levo-Studio/juliusgrimm-portfolio-2026">Source</a> ·
  <a href="https://github.com/justthatrandomcoder">GitHub</a> ·
  <a href="https://instagram.com/julius_gr_">Instagram</a> ·
  <a href="https://linkedin.com/in/julius-grimm">LinkedIn</a>
</p>

<p align="center">
  <code>next.js</code>
  <code>typescript</code>
  <code>tailwind v4</code>
  <code>drizzle</code>
  <code>postgresql</code>
  <code>gsap</code>
</p>

Built with Next.js, PostgreSQL, and a very healthy amount of unnecessary precision.

This is my personal portfolio plus case-study system.  
It is open source because:
- I like open source.
- Good portfolio code should not live behind a black box.
- Publicly overengineering things is part of the brand now.

## What This Repo Is

- Editorial black/green design system matching my Figma references
- Dynamic project + case study pages from PostgreSQL
- Custom animations (hero code cloud, reveal flows, card interactions)
- Secure admin panel for managing projects and case studies

## Stack

- Next.js App Router
- React + TypeScript (`strict`)
- Tailwind CSS v4
- PostgreSQL + Drizzle ORM
- GSAP
- Vitest + React Testing Library + Playwright

## Core Features

- Homepage sections:
  - Hero
  - About
  - Projects
  - Tech Stack / Survival Kit
  - Contact
  - Other Info
- Case study pages with rich typography + accents
- Admin panel:
  - Dashboard overview
  - Edit existing case studies
  - Add Orbitaly seed case study
  - Visibility toggles
  - Session management
  - Password update
- Footer:
  - Dynamic current year
  - Last touched date from latest GitHub commit

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

## Environment

Use only one env variable:

```bash
DATABASE_URL=
```

See [.env.example](./.env.example).

## Local Setup

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Quality Checks

```bash
pnpm test
pnpm test:e2e
pnpm audit
pnpm build
```

## Notes

- No secrets are committed.
- First successful admin signup becomes the only admin account.
- Title images can be managed per case study from the admin edit view.

## License

MIT © Julius Grimm (2026)

