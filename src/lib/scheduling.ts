import parser from "cron-parser";
import { JobStatus } from "@prisma/client";

/**
 * CronWatch's core logic: the "dead man's switch" pattern.
 *
 * Every monitored job has a cron schedule (e.g. "0 2 * * *" — every day at
 * 2am). Instead of CronWatch reaching out to check the job, the job reaches
 * out to CronWatch (a "ping") every time it finishes running successfully.
 *
 * We don't flag a job MISSED the instant it's a second late — jobs run on
 * real infrastructure with real jitter. Each job has a graceMinutes window:
 * time past the expected run before we escalate from LATE to MISSED.
 */

export interface ScheduleEvaluation {
  nextExpectedAt: Date;
  status: JobStatus;
}

/**
 * Given a cron expression and the last time we heard from a job, compute:
 *  - the next time we expect a ping
 *  - the job's current status (HEALTHY / LATE / MISSED)
 *
 * "Next expected" is always the most recent scheduled run that is <= now,
 * evaluated from the last ping (or job creation, if it's never pinged).
 * That's the run we're waiting on a heartbeat for.
 */
export function evaluateSchedule(
  cronExpression: string,
  referenceTime: Date,
  graceMinutes: number,
  now: Date = new Date()
): ScheduleEvaluation {
  const interval = parser.parse(cronExpression, {
    currentDate: referenceTime,
  });

  // The next scheduled run strictly after the reference time (last ping,
  // or job creation for a job that's never checked in).
  const nextExpectedAt = interval.next().toDate();

  const graceMs = graceMinutes * 60 * 1000;
  const msSinceExpected = now.getTime() - nextExpectedAt.getTime();

  let status: JobStatus;
  if (msSinceExpected <= 0) {
    // We haven't even reached the next expected run yet.
    status = JobStatus.HEALTHY;
  } else if (msSinceExpected <= graceMs) {
    // Past the expected time, but still inside the grace window.
    status = JobStatus.LATE;
  } else {
    // Past expected time + grace. The job is considered missed.
    status = JobStatus.MISSED;
  }

  return { nextExpectedAt, status };
}

/** Validate a cron expression, returning an error message if invalid. */
export function validateCronExpression(expression: string): string | null {
  try {
    parser.parse(expression);
    return null;
  } catch {
    return "That doesn't look like a valid cron expression (e.g. \"0 2 * * *\" for daily at 2am).";
  }
}

/** Human-readable common presets, shown as quick-picks in the job form. */
export const CRON_PRESETS: { label: string; value: string }[] = [
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at 2:00 AM", value: "0 2 * * *" },
  { label: "Every day at 9:00 AM", value: "0 9 * * *" },
  { label: "Every Monday at 9:00 AM", value: "0 9 * * 1" },
  { label: "Every 1st of the month", value: "0 0 1 * *" },
];
