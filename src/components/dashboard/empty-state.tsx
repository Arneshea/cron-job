import { LinkButton } from "@/components/ui/button";
import { PulseMark } from "@/components/pulse-mark";

export function EmptyJobsState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-ink-600 px-6 py-16 text-center">
      <PulseMark className="h-6 w-16 opacity-50" />
      <div>
        <h2 className="text-base font-semibold text-fog-100">
          Nothing to watch yet
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-fog-500">
          Register your first scheduled job and CronWatch will tell you the
          moment it stops checking in.
        </p>
      </div>
      <LinkButton href="/jobs/new" size="sm">
        Add your first job
      </LinkButton>
    </div>
  );
}
