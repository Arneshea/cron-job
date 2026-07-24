import { JobForm } from "@/components/dashboard/job-form";

export const metadata = { title: "Add a job" };

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-fog-100">Add a job</h1>
      <p className="mt-1 text-sm text-fog-500">
        Tell CronWatch what to expect, and you&apos;ll get a ping URL to add
        to your job.
      </p>
      <div className="mt-6">
        <JobForm />
      </div>
    </div>
  );
}
