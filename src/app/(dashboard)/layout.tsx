import Link from "next/link";
import { auth } from "@/lib/auth";
import { PulseMark } from "@/components/pulse-mark";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <PulseMark className="h-5 w-14" />
            <span className="font-mono text-sm font-semibold text-fog-100">
              CronWatch
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-fog-500 sm:inline">
              {session?.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
