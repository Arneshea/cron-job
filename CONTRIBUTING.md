# Contributing

## Local setup

See the Quick Start section in [README.md](README.md) — clone, copy
`.env.example` to `.env`, `npm install`, run migrations, seed, `npm run dev`.

## Branching & commits

- Branch per feature: `feat/alert-history`, `fix/ping-dedup`, etc.
- Never push straight to `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Keep commits small and reviewable — one logical change per commit.

## Before opening a PR

```bash
npm run lint
npm run build
```

Both must pass cleanly. Describe **what changed and why** in the PR body,
not just what changed — the reviewer's speed is capped by how fast they
can reconstruct your intent.

## Database changes

Schema changes go through Prisma migrations, committed to git:

```bash
npx prisma migrate dev --name describe_your_change
```

Never edit the database schema directly in production.
