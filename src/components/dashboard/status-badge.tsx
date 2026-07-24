const STATUS_CONFIG = {
  HEALTHY: {
    label: "Healthy",
    dot: "bg-signal-mint",
    text: "text-signal-mint",
    bg: "bg-signal-mint/10",
    border: "border-signal-mint/25",
    pulse: true,
  },
  LATE: {
    label: "Late",
    dot: "bg-signal-amber",
    text: "text-signal-amber",
    bg: "bg-signal-amber/10",
    border: "border-signal-amber/25",
    pulse: true,
  },
  MISSED: {
    label: "Missed",
    dot: "bg-signal-coral",
    text: "text-signal-coral",
    bg: "bg-signal-coral/10",
    border: "border-signal-coral/25",
    pulse: false,
  },
  PAUSED: {
    label: "Paused",
    dot: "bg-signal-slate",
    text: "text-signal-slate",
    bg: "bg-signal-slate/10",
    border: "border-signal-slate/25",
    pulse: false,
  },
} as const;

export type JobStatusValue = keyof typeof STATUS_CONFIG;

export function StatusBadge({ status }: { status: JobStatusValue }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.border} ${config.bg} px-2.5 py-1 text-xs font-medium ${config.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot} ${config.pulse ? "pulse-dot" : ""}`}
      />
      {config.label}
    </span>
  );
}
