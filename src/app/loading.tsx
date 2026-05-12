export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="rounded-3xl border border-accent bg-accent/10 p-6">
        <div className="h-4 w-32 rounded bg-accent/40" />
        <div className="mt-4 h-8 w-3/5 rounded bg-accent/40" />
        <div className="mt-3 h-8 w-2/5 rounded bg-accent/40" />
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-20 rounded-2xl bg-accent/30" />
          <div className="h-20 rounded-2xl bg-accent/30" />
          <div className="h-20 rounded-2xl bg-accent/30" />
        </div>
      </div>
    </div>
  );
}

