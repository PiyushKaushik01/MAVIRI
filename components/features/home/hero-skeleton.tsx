export function HeroSkeleton() {
  return (
    <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-6">
      <div className="md:col-span-5">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-paper-raised">
          <div className="aspect-[3/4] animate-pulse bg-paper-elevated" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-paper-elevated" />
            <div className="h-6 w-2/3 animate-pulse rounded bg-paper-elevated" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-paper-elevated" />
          </div>
        </div>
      </div>
      <div className="md:col-span-3">
        <div className="mb-2 h-3 w-24 animate-pulse rounded bg-paper-elevated" />
        <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-xl bg-paper-elevated"
            />
          ))}
        </div>
      </div>
      <div className="md:col-span-4">
        <div className="h-[420px] animate-pulse rounded-2xl bg-paper-elevated" />
      </div>
    </section>
  );
}