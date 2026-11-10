export function HeroSkeleton() {
  return (
    <section className="signal-room signal-skeleton" aria-label="Loading anime picks">
      <div className="space-y-4">
        <div className="h-3 w-44 animate-pulse rounded-full bg-paper-elevated" />
        <div className="h-24 w-4/5 animate-pulse rounded-xl bg-paper-elevated" />
        <div className="h-14 max-w-md animate-pulse rounded-xl bg-paper-elevated" />
      </div>
      <div className="aspect-[1.4] animate-pulse rounded-[28px] bg-paper-elevated" />
    </section>
  );
}
