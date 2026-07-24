# CronWatch — Case Study

## Problem

Scheduled jobs — nightly backups, hourly syncs, weekly reports — usually
run silently in the background. When one of them quietly fails (a server
restart, a misconfigured cron entry, a silent code error), nobody notices
until something downstream breaks days later, and by then the damage is
already done. Most teams find out about a failed job from a customer
complaint, not from monitoring.

CronWatch solves this with the "dead man's switch" pattern: instead of
polling jobs to check if they're alive, jobs report *in* to CronWatch
every time they finish successfully. If a check-in doesn't arrive when
expected, CronWatch already knows — and can say so immediately.

## Approach

**Data model.** Three tables: `User`, `Job`, `Ping`. A job stores a cron
expression, a grace-period tolerance in minutes, and a unique unguessable
token that doubles as its ping URL's authentication. Every check-in is
logged as an immutable `Ping` row, which also powers the check-in history
timeline on each job's page.

**The scheduling engine.** The core logic lives in one pure function:
given a job's cron expression and the last time it checked in, compute
the next expected run and compare it against "now." Inside the grace
window → Late. Past it → Missed. This same function is called from three
places — job creation, ping ingestion, and the background checker — so
all three always agree on a job's state.

**Auth & authorization.** Email/password auth with bcrypt-hashed
passwords and JWT sessions. Route protection happens in two layers:
`proxy.ts` (Next.js 16's renamed middleware convention) redirects
unauthenticated users away from the dashboard before a page even renders,
and every API route additionally checks `job.userId === session.user.id`
at the row level — never trusting a URL parameter alone.

**The background checker.** A separate API route, `/api/cron/check`,
runs on its own clock rather than being triggered by any user action. It
re-evaluates every job's status and fires a webhook alert exactly once,
on the transition into Missed — not on every subsequent check, which
would spam the webhook for the duration of an outage.

**Design.** Rather than a generic dark-mode dashboard template, the UI
leans into the product's own metaphor: an "ECG strip" for check-in
history, a pulse-line brand mark, and a signal-amber accent standing in
for "heartbeat" against ink-navy surfaces.

## Result

- Live app: cron-job-murex-sigma.vercel.app
- Source: https://github.com/Arneshea/cron-job
- A user can register a job, get a ping URL, and see live status
  (Healthy / Late / Missed) update as check-ins arrive or stop arriving
- Webhook alerting fires automatically on the Missed transition
- Row-level authorization confirmed by testing with two separate accounts

**What I'd build next:** an explicit `StatusChange` log so the timeline
can show a distinct "missed" marker rather than inferring a miss from an
absence of ticks; real email alerts alongside webhooks; and automated
tests for the scheduling engine's boundary conditions.

## What I learned

Most of the real learning happened at the edges, not in the CRUD:

- **Free-tier infrastructure has real constraints that shape the
  architecture.** Vercel's Hobby plan only runs cron jobs once a day, not
  on the 5-minute schedule the product ideally wants. Rather than pretend
  this away, I adjusted the schedule and documented the trade-off — with
  a note on using an external scheduler (like cron-job.org) as a
  workaround for demoing the tighter cadence.
- **Framework churn is real and worth watching for.** Mid-build, Next.js
  16 deprecated the `middleware.ts` convention in favor of `proxy.ts` —
  on some versions the old file is silently ignored, which would have
  meant my auth protection quietly stopped running without a hard error.
  Catching and fixing that taught me to actually read deprecation
  warnings in build logs rather than treating them as noise.
- **Type-safety in third-party libraries isn't always forgiving.** A
  `zod` `.refine()` call using a dynamic error-message function passed
  local type-checking assumptions but failed the production build against
  the installed library version — a reminder that `npm run build` locally
  catches things `npm run dev` doesn't.
- **Managed Postgres has its own lifecycle.** Neon's free tier scales to
  zero when idle, so a "the database is unreachable" error isn't always a
  bug — sometimes it's just a cold start, and the fix is retrying, not
  rewriting code.