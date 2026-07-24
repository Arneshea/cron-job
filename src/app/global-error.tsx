"use client";

import { useEffect } from "react";
import { PulseMark } from "@/components/pulse-mark";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Full details go to server logs only — the user gets a friendly,
    // actionable message, never a raw stack trace.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center text-fog-100">
        <PulseMark className="h-6 w-16 opacity-50" />
        <h1 className="text-2xl font-semibold">Something broke on our end</h1>
        <p className="max-w-sm text-sm text-fog-500">
          That&apos;s on us, not you. Try again — if it keeps happening, the
          error&apos;s been logged.
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </body>
    </html>
  );
}
