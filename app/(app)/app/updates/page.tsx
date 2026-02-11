export default function UpdatesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--ga-text)]">Updates</h1>
      <p className="ga-muted">
        This section mirrors the mobile app&apos;s Updates screen. Add release notes or links to the latest builds here.
      </p>
      <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] p-5 text-sm text-[var(--ga-text)]">
        Tip: link to your Expo build or store listings from the landing page.
      </div>
    </div>
  );
}
