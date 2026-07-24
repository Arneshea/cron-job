import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/button";
import { JobRow } from "@/components/dashboard/job-row";
import { EmptyJobsState } from "@/components/dashboard/empty-state";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const jobs = await prisma.job.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  const summary = {
    healthy: jobs.filter((j) => j.status === "HEALTHY").length,
    late: jobs.filter((j) => j.status === "LATE").length,
    missed: jobs.filter((j) => j.status === "MISSED").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-fog-100">Your jobs</h1>
          <p className="mt-1 text-sm text-fog-500">
            {jobs.length === 0
              ? "Nothing registered yet"
              : `${summary.healthy} healthy · ${summary.late} late · ${summary.missed} missed`}
          </p>
        </div>
        <LinkButton href="/jobs/new" size="sm">
          + Add job
        </LinkButton>
      </div>

      {jobs.length === 0 ? (
        <EmptyJobsState />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-ink-700 bg-ink-900 px-4">
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              id={job.id}
              name={job.name}
              schedule={job.schedule}
              status={job.status}
              lastPingAt={job.lastPingAt?.toISOString() ?? null}
              paused={job.paused}
            />
          ))}
        </div>
      )}
    </div>
  );
}
