"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteJobButton({ jobId, jobName }: { jobId: string; jobName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!confirming) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        Delete job
      </Button>
    );
  }

  async function handleDelete() {
    setBusy(true);
    await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-signal-coral/30 bg-signal-coral/5 px-3 py-2">
      <span className="text-xs text-fog-300">Delete &ldquo;{jobName}&rdquo; permanently?</span>
      <Button variant="danger" size="sm" onClick={handleDelete} disabled={busy}>
        {busy ? "Deleting…" : "Confirm"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={busy}>
        Cancel
      </Button>
    </div>
  );
}
