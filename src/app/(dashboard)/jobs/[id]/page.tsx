import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PingTimeline } from "@/components/dashboard/ping-timeline";
import { PingUrlBox } from "@/components/dashboard/ping-url-box";
import { DeleteJobButton } from "@/components/dashboard/delete-job-button";
import { LinkButton } from "@/components/ui/button";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.job.findUnique({ where: { id } });

  // Row-level check: exists AND belongs to the logged-in user. A 404 here
  // (not a 403) avoids confirming to a stranger that a given job id exists
  // at all.
  if (!job || job.userId !== session!.user.id) {
    notFound();
  }

  const pings = await prisma.ping.findMany({
    where: { jobId: id },
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const pingUrl = `${appUrl}/api/ping/${job.pingToken}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard" className="text-sm text-fog-500 hover:text-fog-300">
          ← Back to dashboard
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-fog-100">{job.name}</h1>
            <StatusBadge status={job.paused ? "PAUSED" : job.status} />
          </div>
          {job.description && (
            <p className="mt-1 text-sm text-fog-500">{job.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LinkButton href={`/jobs/${job.id}/edit`} variant="secondary" size="sm">
            Edit
          </LinkButton>
          <DeleteJobButton jobId={job.id} jobName={job.name} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-md)] border border-ink-700 bg-ink-900 p-4">
          <p className="text-xs text-fog-700">Schedule</p>
          <p className="mt-1 font-mono text-sm text-fog-100">{job.schedule}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-ink-700 bg-ink-900 p-4">
          <p className="text-xs text-fog-700">Grace period</p>
          <p className="mt-1 font-mono text-sm text-fog-100">{job.graceMinutes} min</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-ink-700 bg-ink-900 p-4">
          <p className="text-xs text-fog-700">Next expected</p>
          <p className="mt-1 font-mono text-sm text-fog-100">
            {job.nextExpectedAt ? new Date(job.nextExpectedAt).toLocaleString() : "—"}
          </p>
        </div>
      </div>

      <PingUrlBox url={pingUrl} />

      <div>
        <h2 className="mb-3 text-sm font-medium text-fog-100">Check-in history</h2>
        <PingTimeline pings={pings.map((p) => ({ id: p.id, receivedAt: p.receivedAt.toISOString() }))} />
      </div>

      {(job.alertWebhookUrl || job.alertEmail) && (
        <div className="rounded-[var(--radius-md)] border border-ink-700 bg-ink-900 p-4">
          <h2 className="text-sm font-medium text-fog-100">Alerting</h2>
          <dl className="mt-2 flex flex-col gap-1 text-xs text-fog-500">
            {job.alertWebhookUrl && (
              <div className="flex gap-2">
                <dt className="text-fog-700">Webhook:</dt>
                <dd className="font-mono">{job.alertWebhookUrl}</dd>
              </div>
            )}
            {job.alertEmail && (
              <div className="flex gap-2">
                <dt className="text-fog-700">Email:</dt>
                <dd className="font-mono">{job.alertEmail}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
