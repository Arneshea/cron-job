# Architecture

## Data model

```
User 1 ── * Job 1 ── * Ping
```

- **User** — an account. Owns zero or more jobs.
- **Job** — a scheduled task being monitored. Stores the cron `schedule`,
  a `graceMinutes` tolerance window, a unique unguessable `pingToken`
  (used as the auth mechanism for the public ping endpoint), and derived
  state: `status`, `lastPingAt`, `nextExpectedAt`.
- **Ping** — an immutable log row created every time a job checks in.
  Kept even after a job's status changes, so the check-in history timeline
  has something to render.

## Auth & authorization

Auth.js (NextAuth v5) with the Credentials provider: email + password,
hashed with bcrypt (cost factor 12), stored server-side only. Sessions are
JWT-based and enforced two ways:

1. **`middleware.ts`** redirects unauthenticated requests away from
   `/dashboard` and `/jobs` before they ever reach a page.
2. **Row-level checks in every API route and server component** —
   `job.userId !== session.user.id` is checked explicitly on every read,
   update, and delete. A logged-in user typing another user's job id into
   the URL gets a 404, not someone else's data.

The one endpoint that's deliberately *not* behind session auth is
`/api/ping/[token]` — it's called by headless scripts and cron jobs, not
browsers. The unguessable `pingToken` embedded in the URL is the auth
mechanism there, similar to how services like healthchecks.io work.

## The dead man's switch (core logic)

Everything lives in `src/lib/scheduling.ts`. Given a job's cron
expression and the last time it checked in (or its creation time, if it
never has), `evaluateSchedule()`:

1. Uses `cron-parser` to compute the next scheduled run after that
   reference time.
2. Compares "now" against that expected time:
   - Before it → **HEALTHY**
   - Past it, but within `graceMinutes` → **LATE**
   - Past it *and* past the grace window → **MISSED**

This same function is called from three places, and always agrees:
- When a job is created (seeds its first `nextExpectedAt`)
- When a ping arrives (re-anchors the schedule from the new check-in)
- When the background checker runs (re-evaluates every job against "now")

## Background checker

`/api/cron/check` is a plain API route with no UI — it's invoked on a
timer by Vercel Cron (see `vercel.json`, every 5 minutes) rather than by
any user action. It re-evaluates every unpaused job's status and fires a
webhook alert exactly once, on the transition into MISSED (not on every
subsequent check, or a long outage would spam the webhook every 5
minutes). Protected by a `CRON_SECRET` bearer token so the endpoint can't
be triggered by anyone who finds the URL.

## One trade-off worth calling out

The check-in history timeline currently renders successful pings only —
it doesn't yet log a distinct "miss" event when the checker detects one.
In practice you read it together with the status badge: an unbroken,
evenly spaced strip of ticks that just stops is what a missed job looks
like. A cleaner v2 would add a lightweight `StatusChange` log table so the
timeline could render explicit miss markers too, not just infer them from
absence.
