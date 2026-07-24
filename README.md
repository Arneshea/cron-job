# CronWatch

> A heartbeat monitor for your scheduled jobs — know the instant a cron job, backup, or nightly sync stops checking in.

**Live demo →** _add your deployed URL here after deploying_
**Demo login →** `demo@demo.com` / `demo1234`

## Features

- Register jobs with a cron schedule and a grace period, get a unique ping URL back
- Jobs call that URL when they finish — CronWatch tracks every check-in
- A background checker re-evaluates every job on a timer and flags overdue ones as **Missed**
- Webhook alerts (Slack/Discord-compatible) fire once, the moment a job goes missing
- Check-in history timeline per job
- Pause/resume, edit, and delete jobs from the dashboard
- Email + password auth with hashed passwords, server-side authorization on every route

## Tech Stack

Next.js (App Router) · TypeScript (strict) · PostgreSQL (Prisma) · Tailwind CSS · Auth.js · Zod · Vercel

## Quick Start

```bash
git clone <your-repo-url> && cd cronwatch
cp .env.example .env       # then fill in DATABASE_URL and AUTH_SECRET
npm install                # also runs `prisma generate` via postinstall
npm run db:migrate         # creates tables
npm run db:seed            # adds the demo user + sample jobs
npm run dev                # http://localhost:3000
```

You'll need a Postgres database. The fastest free option is
[Neon](https://neon.tech) or [Supabase](https://supabase.com) — create a
project, copy the connection string into `DATABASE_URL`.

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Session signing secret — generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Base URL of the deployed app, used to build ping URLs |
| `CRON_SECRET` | Bearer token that authorizes calls to `/api/cron/check` (set this in Vercel too) |

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the data model, the
auth/authorization approach, and how the dead-man's-switch scheduling
logic actually works. One diagram beats a page of prose, but the short
version: a job's cron schedule + last ping time determine whether it's
Healthy, Late, or Missed, and a background job re-checks that on a timer.

## Trying it out locally without a real cron job

Once you've registered a job, copy its ping URL from the job detail page
and hit it manually:

```bash
curl https://your-app.vercel.app/api/ping/<your-job-token>
```

To see the "missed" path, register a job with a short schedule (e.g.
"Every 5 minutes") and a short grace period, then just... don't ping it.
Trigger the checker manually:

```bash
curl -H "Authorization: Bearer <your CRON_SECRET>" \
  https://your-app.vercel.app/api/cron/check
```

## Testing

This version ships without an automated test suite — see the Roadmap
below. The core scheduling logic (`src/lib/scheduling.ts`) is a pure
function and is the highest-value place to add Vitest coverage first.

## Roadmap

- [x] Auth, job CRUD, ping ingestion, background checker, webhook alerts
- [ ] Vitest coverage for the scheduling engine (happy path, boundary at
      the grace window, invalid cron expressions)
- [ ] Explicit "missed" events logged to the timeline, not just inferred
- [ ] Real email alerts (currently webhook-only)
- [ ] Per-job alert history / audit log

## Screenshots

_Add screenshots of the dashboard, job detail page, and empty state here
before submitting — `docs/screenshots/` is set up for them._

## Credit

Built as a submission for the Digital Heroes Full Stack Developer trial task.

## License

MIT — see [LICENSE](LICENSE).
