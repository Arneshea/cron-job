"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge, JobStatusValue } from "./status-badge";

interface JobRowProps {
  id: string;
  name: string;
  schedule: string;
  status: JobStatusValue;
  lastPingAt: string | null;
  paused: boolean;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function JobRow({ id, name, schedule, status, lastPingAt, paused }: JobRowProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePause(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused: !paused }),
    });
    router.refresh();
    setBusy(false);
  }

  return (
    <Link
      href={`/jobs/${id}`}
      className="group flex items-center justify-between gap-4 border-b border-ink-800 px-1 py-4 transition-colors last:border-b-0 hover:bg-ink-900/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <span className="truncate text-sm font-medium text-fog-100">{name}</span>
          <StatusBadge status={status} />
        </div>
        <div className="mt-1 flex items-center gap-3 font-mono text-xs text-fog-700">
          <span>{schedule}</span>
          <span aria-hidden="true">·</span>
          <span>last seen {timeAgo(lastPingAt)}</span>
        </div>
      </div>
      <button
        onClick={togglePause}
        disabled={busy}
        className="rounded-[var(--radius-sm)] border border-ink-600 px-3 py-1.5 text-xs font-medium text-fog-500 opacity-0 transition-opacity hover:text-fog-100 group-hover:opacity-100 disabled:opacity-50"
      >
        {paused ? "Resume" : "Pause"}
      </button>
    </Link>
  );
}
