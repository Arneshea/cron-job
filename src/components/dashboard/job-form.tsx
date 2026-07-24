"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { CRON_PRESETS, validateCronExpression } from "@/lib/scheduling";

export interface JobFormValues {
  id?: string;
  name: string;
  description: string;
  schedule: string;
  graceMinutes: number;
  alertWebhookUrl: string;
  alertEmail: string;
}

const defaultValues: JobFormValues = {
  name: "",
  description: "",
  schedule: "0 2 * * *",
  graceMinutes: 10,
  alertWebhookUrl: "",
  alertEmail: "",
};

export function JobForm({ initial }: { initial?: JobFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [values, setValues] = useState<JobFormValues>(initial ?? defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const scheduleError = values.schedule ? validateCronExpression(values.schedule) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (scheduleError) {
      setError(scheduleError);
      return;
    }

    setLoading(true);

    const url = isEdit ? `/api/jobs/${initial!.id}` : "/api/jobs";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setLoading(false);
        return;
      }

      router.push(isEdit ? `/jobs/${initial!.id}` : `/jobs/${data.job.id}`);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Job name" htmlFor="name">
        <Input
          id="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Nightly database backup"
          required
        />
      </Field>

      <Field label="Description" htmlFor="description" hint="Optional — what does this job do?">
        <Textarea
          id="description"
          rows={2}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <Field
        label="Schedule (cron expression)"
        htmlFor="schedule"
        error={values.schedule ? scheduleError ?? undefined : undefined}
        hint="When this job is expected to run"
      >
        <Input
          id="schedule"
          value={values.schedule}
          onChange={(e) => update("schedule", e.target.value)}
          placeholder="0 2 * * *"
          className="font-mono"
          required
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CRON_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.value}
              onClick={() => update("schedule", preset.value)}
              className="rounded-full border border-ink-600 px-2.5 py-1 text-xs text-fog-500 transition-colors hover:border-signal-amber hover:text-signal-amber"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Grace period (minutes)"
        htmlFor="grace"
        hint="How late a check-in can be before we call it missed"
      >
        <Input
          id="grace"
          type="number"
          min={1}
          max={1440}
          value={values.graceMinutes}
          onChange={(e) => update("graceMinutes", Number(e.target.value))}
          required
        />
      </Field>

      <div className="rounded-[var(--radius-md)] border border-ink-700 bg-ink-900 p-4">
        <h3 className="text-sm font-medium text-fog-100">Alerts</h3>
        <p className="mt-1 text-xs text-fog-700">
          Sent once when a job transitions into Missed. Leave blank to skip alerting.
        </p>
        <div className="mt-3 flex flex-col gap-4">
          <Field label="Webhook URL" htmlFor="webhook" hint="Slack or Discord incoming webhook">
            <Input
              id="webhook"
              type="url"
              value={values.alertWebhookUrl}
              onChange={(e) => update("alertWebhookUrl", e.target.value)}
              placeholder="https://hooks.slack.com/services/…"
              className="font-mono text-xs"
            />
          </Field>
          <Field label="Alert email" htmlFor="alertEmail" hint="Reference only in this version">
            <Input
              id="alertEmail"
              type="email"
              value={values.alertEmail}
              onChange={(e) => update("alertEmail", e.target.value)}
              placeholder="ops@yourcompany.com"
            />
          </Field>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-signal-coral">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create job"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
