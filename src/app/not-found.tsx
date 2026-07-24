import Link from "next/link";
import { PulseMark } from "@/components/pulse-mark";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <PulseMark className="h-6 w-16 opacity-50" />
      <h1 className="text-2xl font-semibold text-fog-100">This page went quiet</h1>
      <p className="max-w-sm text-sm text-fog-500">
        Nothing checked in at this URL. It may have been deleted, or the link
        might be wrong.
      </p>
      <LinkButton href="/dashboard" size="sm">
        Back to dashboard
      </LinkButton>
      <Link href="/" className="text-xs text-fog-700 hover:text-fog-500">
        or go home
      </Link>
    </main>
  );
}
