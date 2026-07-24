import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateSchedule } from "@/lib/scheduling";
import { JobStatus } from "@prisma/client";

const MAX_PING_RATE_MS = 1000; // ignore duplicate pings within 1s (double-fire guard)

async function handlePing(request: Request, token: string) {
  // Deliberately not behind session auth — this endpoint is called by
  // headless cron jobs/scripts, not logged-in browsers. The unguessable
  // pingToken in the URL *is* the auth.
  const job = await prisma.job.findUnique({ where: { pingToken: token } });

  if (!job) {
    return NextResponse.json({ error: "Unknown ping token" }, { status: 404 });
  }

  const now = new Date();

  // Idempotency guard: if a job's runner retries on a flaky connection and
  // fires the same ping twice in quick succession, don't record two rows
  // or recompute the schedule twice.
  if (job.lastPingAt && now.getTime() - job.lastPingAt.getTime() < MAX_PING_RATE_MS) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const source =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("user-agent") ??
    undefined;

  await prisma.ping.create({
    data: { jobId: job.id, receivedAt: now, source },
  });

  const { nextExpectedAt } = evaluateSchedule(job.schedule, now, job.graceMinutes, now);

  await prisma.job.update({
    where: { id: job.id },
    data: {
      lastPingAt: now,
      nextExpectedAt,
      status: job.paused ? JobStatus.PAUSED : JobStatus.HEALTHY,
    },
  });

  return NextResponse.json({ ok: true, nextExpectedAt });
}

// Support both GET and POST — GET makes it trivial to test with curl or even
// a browser; POST is the more "correct" verb for jobs that can send one.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  return handlePing(request, token);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  return handlePing(request, token);
}
