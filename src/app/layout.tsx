import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CronWatch — know the instant a job goes quiet",
    template: "%s · CronWatch",
  },
  description:
    "CronWatch is a heartbeat monitor for your scheduled jobs. Register a job, ping us when it runs, and get alerted the moment it doesn't.",
  openGraph: {
    title: "CronWatch — know the instant a job goes quiet",
    description:
      "A dead man's switch for your cron jobs, backups, and scheduled tasks.",
    url: appUrl,
    siteName: "CronWatch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CronWatch — know the instant a job goes quiet",
    description:
      "A dead man's switch for your cron jobs, backups, and scheduled tasks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-950 text-fog-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
