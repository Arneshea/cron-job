import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobForm } from "@/components/dashboard/job-form";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.userId !== session!.user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-fog-100">Edit job</h1>
      <p className="mt-1 text-sm text-fog-500">{job.name}</p>
      <div className="mt-6">
        <JobForm
          initial={{
            id: job.id,
            name: job.name,
            description: job.description ?? "",
            schedule: job.schedule,
            graceMinutes: job.graceMinutes,
            alertWebhookUrl: job.alertWebhookUrl ?? "",
            alertEmail: job.alertEmail ?? "",
          }}
        />
      </div>
    </div>
  );
}
