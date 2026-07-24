"use client";

import { useState } from "react";

export function PingUrlBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-ink-700 bg-ink-900 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-fog-100">Ping URL</h3>
        <button
          onClick={copy}
          className="text-xs font-medium text-signal-amber hover:underline"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-1 text-xs text-fog-700">
        Call this URL (GET or POST) from your job when it finishes successfully.
      </p>
      <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-[var(--radius-sm)] bg-ink-950 px-3 py-2 font-mono text-xs text-signal-mint">
        {url}
      </code>
      <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-[var(--radius-sm)] bg-ink-950 px-3 py-2 font-mono text-xs text-fog-500">
        curl {url}
      </code>
    </div>
  );
}
