import { LinkButton } from "@/components/ui/button";
import { PulseMark } from "@/components/pulse-mark";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function LandingPage() {
  const session = await auth();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CronWatch",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "A heartbeat monitor for scheduled jobs. Get alerted the moment a cron job, backup, or scheduled task stops checking in.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <PulseMark className="h-6 w-16" />
          <span className="font-mono text-sm font-semibold tracking-tight text-fog-100">
            CronWatch
          </span>
        </div>
        <nav className="flex items-center gap-3">
          {session?.user ? (
            <LinkButton href="/dashboard" size="sm">
              Dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                Log in
              </LinkButton>
              <LinkButton href="/register" size="sm">
                Get started
              </LinkButton>
            </>
          )}
        </nav>
      </header>

      <main id="main" className="flex-1">
        <section className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 pb-16 pt-12 md:pt-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-amber">
            Dead man&apos;s switch for scheduled jobs
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.15] tracking-tight text-fog-100 md:text-5xl">
            Know the instant a cron job goes quiet.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-fog-500 md:text-lg">
            Backups, nightly reports, data syncs — they usually run silently.
            CronWatch listens for a heartbeat from every job you schedule, and
            tells you the moment one doesn&apos;t check in.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <LinkButton href="/register" size="md">
              Start monitoring — it&apos;s free
            </LinkButton>
            <LinkButton href="/login" variant="secondary" size="md">
              I already have an account
            </LinkButton>
          </div>

          <div className="mt-10 w-full rounded-[var(--radius-lg)] border border-ink-700 bg-ink-900 p-6">
            <PulseMark className="h-10 w-full" animate />
            <div className="mt-4 grid gap-4 font-mono text-xs text-fog-500 sm:grid-cols-3">
              <div className="rounded-[var(--radius-sm)] border border-ink-700 bg-ink-950 p-3">
                <span className="text-signal-mint">● nightly-backup</span>
                <p className="mt-1 text-fog-700">last seen 4m ago</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-ink-700 bg-ink-950 p-3">
                <span className="text-signal-amber">● weekly-report</span>
                <p className="mt-1 text-fog-700">14m late, within grace</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-ink-700 bg-ink-950 p-3">
                <span className="text-signal-coral">● inventory-sync</span>
                <p className="mt-1 text-fog-700">missed — alert sent</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-fog-700">
            How it works
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Register a job",
                body: "Name it, give it a cron schedule and a grace period. You get a unique ping URL back.",
              },
              {
                step: "2",
                title: "Ping on success",
                body: "Add one line to your job: a GET or POST to your ping URL when it finishes running.",
              },
              {
                step: "3",
                title: "Get alerted if it goes quiet",
                body: "Miss a scheduled check-in past your grace window, and CronWatch fires a webhook alert.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-[var(--radius-lg)] border border-ink-700 bg-ink-900 p-5"
              >
                <span className="font-mono text-xs text-signal-amber">
                  {item.step}
                </span>
                <h3 className="mt-2 text-base font-semibold text-fog-100">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fog-500">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="rounded-[var(--radius-lg)] border border-ink-700 bg-gradient-to-br from-ink-900 to-ink-950 p-8 text-center">
            <h2 className="text-2xl font-semibold text-fog-100">
              Stop finding out about failures from a customer.
            </h2>
            <div className="mt-5">
              <LinkButton href="/register">Start monitoring for free</LinkButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl border-t border-ink-800 px-6 py-8 text-xs text-fog-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Built as a Digital Heroes Full Stack Developer trial project.</span>
          <Link href="/register" className="hover:text-fog-300">
            Get started →
          </Link>
        </div>
      </footer>
    </>
  );
}
