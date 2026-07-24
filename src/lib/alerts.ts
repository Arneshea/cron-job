import type { Job } from "@prisma/client";

/**
 * Fires a webhook alert when a job transitions into MISSED. Formatted as a
 * plain { text } payload, which both Slack and Discord incoming webhooks
 * accept natively — no per-platform branching needed for the MVP.
 */
export async function sendMissedJobAlert(job: Job): Promise<void> {
  if (!job.alertWebhookUrl) return;

  const text =
    `🔴 *${job.name}* missed its check-in.\n` +
    `Expected around ${job.nextExpectedAt?.toISOString() ?? "unknown"}, ` +
    `grace period was ${job.graceMinutes} min.\n` +
    `Last seen: ${job.lastPingAt ? job.lastPingAt.toISOString() : "never"}.`;

  try {
    await fetch(job.alertWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    // Alerting is best-effort — a failed webhook shouldn't crash the
    // background checker run for every other job.
    console.error(`Failed to send alert for job ${job.id}:`, err);
  }
}
