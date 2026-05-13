"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HomepageSettings } from "@/lib/siteSettings";

export function SettingsForm(props: { initial: HomepageSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<HomepageSettings>(props.initial);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof HomepageSettings>(key: K, value: HomepageSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Gagal menyimpan settings.";
        setError(msg);
        return;
      }
      setSuccess("Settings tersimpan.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Hero badge"
          value={form.heroBadge}
          onChange={(v) => setField("heroBadge", v)}
        />
        <Field
          label="Footer text"
          value={form.footerText}
          onChange={(v) => setField("footerText", v)}
        />
      </div>

      <FieldTextArea
        label="Hero title"
        value={form.heroTitle}
        onChange={(v) => setField("heroTitle", v)}
        rows={2}
      />
      <FieldTextArea
        label="Hero description"
        value={form.heroDescription}
        onChange={(v) => setField("heroDescription", v)}
        rows={4}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="About eyebrow"
          value={form.aboutEyebrow}
          onChange={(v) => setField("aboutEyebrow", v)}
        />
        <Field
          label="Contact eyebrow"
          value={form.contactEyebrow}
          onChange={(v) => setField("contactEyebrow", v)}
        />
      </div>

      <FieldTextArea
        label="About title"
        value={form.aboutTitle}
        onChange={(v) => setField("aboutTitle", v)}
        rows={2}
      />
      <FieldTextArea
        label="About description"
        value={form.aboutDescription}
        onChange={(v) => setField("aboutDescription", v)}
        rows={4}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FieldTextArea
          label="About tagline title"
          value={form.aboutTaglineTitle}
          onChange={(v) => setField("aboutTaglineTitle", v)}
          rows={2}
        />
        <FieldTextArea
          label="About tagline subtitle"
          value={form.aboutTaglineSubtitle}
          onChange={(v) => setField("aboutTaglineSubtitle", v)}
          rows={3}
        />
      </div>

      <FieldTextArea
        label="Contact title"
        value={form.contactTitle}
        onChange={(v) => setField("contactTitle", v)}
        rows={2}
      />
      <FieldTextArea
        label="Contact description"
        value={form.contactDescription}
        onChange={(v) => setField("contactDescription", v)}
        rows={4}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="Contact email"
          value={form.contactEmail}
          type="email"
          onChange={(v) => setField("contactEmail", v)}
        />
        <Field
          label="Contact WhatsApp"
          value={form.contactWhatsapp}
          onChange={(v) => setField("contactWhatsapp", v)}
        />
        <Field
          label="Contact hours"
          value={form.contactHours}
          onChange={(v) => setField("contactHours", v)}
        />
      </div>

      {error ? (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm"
        >
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}

function Field(props: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-foreground/80">{props.label}</label>
      <input
        value={props.value}
        type={props.type ?? "text"}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
        required
      />
    </div>
  );
}

function FieldTextArea(props: {
  label: string;
  value: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-foreground/80">{props.label}</label>
      <textarea
        value={props.value}
        rows={props.rows}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-accent bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
        required
      />
    </div>
  );
}

