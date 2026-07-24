import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateSchedule } from "@/lib/scheduling";
import { sendMissedJobAlert } from "@/lib/alerts";
import { JobStatus } from "@prisma/client";

/**
 * The background "checker" — this is what makes CronWatch a dead man's
 * switch instead of just a log of pings. Nothing about this route is
 * triggered by a user click; it runs on its own clock via Vercel Cron
 * (see vercel.json) and asks, for every active job: "has this gone quiet?"
 *
 * Protected with CRON_SECRET so it can't be spammed/triggered by anyone who
 * finds the URL — Vercel Cron sends this as a bearer token automatically.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({ where: { paused: false } });
  const now = new Date();

  let checked = 0;
  let newlyMissed = 0;

  for (const job of jobs) {
    const referenceTime = job.lastPingAt ?? job.createdAt;
    const { nextExpectedAt, status } = evaluateSchedule(
      job.schedule,
      referenceTime,
      job.graceMinutes,
      now
    );

    checked++;

    const wasAlreadyMissed = job.status === JobStatus.MISSED;

    if (status !== job.status || nextExpectedAt.getTime() !== job.nextExpectedAt?.getTime()) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status, nextExpectedAt },
      });
    }

    // Only fire an alert on the transition into MISSED, not on every check
    // — otherwise a job down for a day spams the webhook every run.
    if (status === JobStatus.MISSED && !wasAlreadyMissed) {
      newlyMissed++;
      await sendMissedJobAlert({ ...job, status, nextExpectedAt });
      await prisma.job.update({
        where: { id: job.id },
        data: { lastAlertedAt: now },
      });
    }
  }

  return NextResponse.json({ ok: true, checked, newlyMissed, ranAt: now.toISOString() });
}
