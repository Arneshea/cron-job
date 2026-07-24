import { PrismaClient, JobStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { evaluateSchedule } from "../src/lib/scheduling";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@demo.com",
      passwordHash,
    },
  });

  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // A healthy job that pinged recently on a frequent schedule.
  const healthyJob = await prisma.job.upsert({
    where: { id: "seed-healthy-job" },
    update: {},
    create: {
      id: "seed-healthy-job",
      userId: demoUser.id,
      name: "nightly-backup",
      description: "Backs up the production database every night at 2am.",
      schedule: "0 2 * * *",
      graceMinutes: 30,
      lastPingAt: hourAgo,
      status: JobStatus.HEALTHY,
    },
  });

  await prisma.ping.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      jobId: healthyJob.id,
      receivedAt: new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000),
    })),
  });

  // A job that's gone quiet for two days — will show as MISSED.
  const missedJob = await prisma.job.upsert({
    where: { id: "seed-missed-job" },
    update: {},
    create: {
      id: "seed-missed-job",
      userId: demoUser.id,
      name: "inventory-sync",
      description: "Syncs warehouse inventory counts every hour.",
      schedule: "0 * * * *",
      graceMinutes: 15,
      lastPingAt: twoDaysAgo,
      status: JobStatus.MISSED,
    },
  });

  await prisma.ping.create({
    data: { jobId: missedJob.id, receivedAt: twoDaysAgo },
  });

  // Recompute derived fields (nextExpectedAt) so the seeded state matches
  // what the scheduling engine would actually produce.
  for (const job of [healthyJob, missedJob]) {
    const ref = job.lastPingAt ?? job.createdAt;
    const { nextExpectedAt, status } = evaluateSchedule(job.schedule, ref, job.graceMinutes);
    await prisma.job.update({
      where: { id: job.id },
      data: { nextExpectedAt, status },
    });
  }

  console.log("Seeded demo user: demo@demo.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
