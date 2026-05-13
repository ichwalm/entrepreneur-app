import { getHomepageSettings } from "@/lib/siteSettings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const homepage = await getHomepageSettings();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-foreground/70">
          Kelola konten yang sebelumnya hardcoded di homepage (konsep CMS ringan).
        </p>
      </div>
      <div className="rounded-xl border border-accent bg-accent/10 p-5">
        <div className="text-sm font-semibold">Homepage</div>
        <div className="mt-4">
          <SettingsForm initial={homepage} />
        </div>
      </div>
    </div>
  );
}

