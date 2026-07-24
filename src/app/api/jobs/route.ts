import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validators";
import { evaluateSchedule } from "@/lib/scheduling";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = jobSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, description, schedule, graceMinutes, alertWebhookUrl, alertEmail } =
    parsed.data;

  // A brand-new job has never pinged, so we evaluate its schedule from
  // "now" to seed the first expected run.
  const now = new Date();
  const { nextExpectedAt } = evaluateSchedule(schedule, now, graceMinutes, now);

  const job = await prisma.job.create({
    data: {
      userId: session.user.id,
      name,
      description: description || null,
      schedule,
      graceMinutes,
      alertWebhookUrl: alertWebhookUrl || null,
      alertEmail: alertEmail || null,
      nextExpectedAt,
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
