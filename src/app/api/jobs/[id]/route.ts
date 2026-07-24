import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validators";
import { evaluateSchedule } from "@/lib/scheduling";

async function getOwnedJob(userId: string, jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  // Row-level check: existing AND owned by the caller. Never trust the
  // route param alone — a logged-in user could type any job id in the URL.
  if (!job || job.userId !== userId) return null;
  return job;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await getOwnedJob(session.user.id, id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pings = await prisma.ping.findMany({
    where: { jobId: id },
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ job, pings });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedJob(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);

  // Support a lightweight { paused: boolean } toggle separately from a full
  // edit, since the dashboard's pause switch shouldn't require re-validating
  // the whole form.
  if (body && typeof body.paused === "boolean" && Object.keys(body).length === 1) {
    const job = await prisma.job.update({
      where: { id },
      data: { paused: body.paused },
    });
    return NextResponse.json({ job });
  }

  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, description, schedule, graceMinutes, alertWebhookUrl, alertEmail } =
    parsed.data;

  // Re-anchor the expected schedule from the job's last known ping (or now,
  // if it's never pinged) using the newly edited schedule/grace.
  const referenceTime = existing.lastPingAt ?? new Date();
  const { nextExpectedAt, status } = evaluateSchedule(
    schedule,
    referenceTime,
    graceMinutes
  );

  const job = await prisma.job.update({
    where: { id },
    data: {
      name,
      description: description || null,
      schedule,
      graceMinutes,
      alertWebhookUrl: alertWebhookUrl || null,
      alertEmail: alertEmail || null,
      nextExpectedAt,
      status: existing.paused ? existing.status : status,
    },
  });

  return NextResponse.json({ job });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedJob(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.job.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
