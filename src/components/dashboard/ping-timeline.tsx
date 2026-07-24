"use client";

import { useState } from "react";

interface Ping {
  id: string;
  receivedAt: string;
}

/**
 * Renders the most recent pings as a row of ticks along a baseline, like an
 * ECG strip. Each tick is a successful check-in; hovering shows the exact
 * timestamp. Read alongside the job's current status badge: a healthy job
 * shows an unbroken, evenly spaced strip, a missed job shows the strip
 * simply stopping.
 */
export function PingTimeline({ pings }: { pings: Ping[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (pings.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-ink-600 text-sm text-fog-700">
        No check-ins yet — this job hasn&apos;t pinged CronWatch
      </div>
    );
  }

  // Oldest first for left-to-right reading.
  const ordered = [...pings].reverse();

  return (
    <div className="rounded-[var(--radius-md)] border border-ink-700 bg-ink-900 p-4">
      <div className="relative flex h-16 items-center gap-[3px] overflow-x-auto">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-ink-600" />
        {ordered.map((ping) => (
          <div
            key={ping.id}
            className="group relative z-10 flex-shrink-0"
            onMouseEnter={() => setHovered(ping.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="h-6 w-[3px] rounded-full bg-signal-mint transition-transform group-hover:scale-y-125" />
            {hovered === ping.id && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] border border-ink-600 bg-ink-800 px-2 py-1 text-xs font-mono text-fog-300 shadow-lg">
                {new Date(ping.receivedAt).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-fog-700">
        {pings.length} check-in{pings.length === 1 ? "" : "s"} shown, most recent{" "}
        {new Date(ordered[ordered.length - 1].receivedAt).toLocaleString()}
      </p>
    </div>
  );
}
