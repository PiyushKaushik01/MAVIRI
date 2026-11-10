export function HeroSkeleton() {
  return (
    <section className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-12 lg:gap-8" aria-label="Loading anime picks">
      <div className="flex flex-col gap-5 md:col-span-4">
        <div className="space-y-3 py-2">
          <div className="h-3 w-40 animate-pulse rounded-full bg-paper-elevated" />
          <div className="h-10 w-4/5 animate-pulse rounded-lg bg-paper-elevated" />
          <div className="h-4 w-full animate-pulse rounded-full bg-paper-elevated" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-paper-elevated" />
        </div>
        <div className="aspect-[3/4] w-full animate-pulse overflow-hidden rounded-[22px] bg-paper-elevated" />
      </div>

      <div className="flex flex-col gap-5 md:col-span-8">
        <div className="space-y-4 rounded-[22px] border border-border-soft bg-paper-raised p-4 sm:p-5">
          <div className="h-9 w-40 animate-pulse rounded-full bg-paper-elevated" />
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-paper-elevated" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-paper-elevated" />
        </div>
        <div className="space-y-3 rounded-[22px] border border-border-soft bg-paper-raised p-5 sm:p-6">
          <div className="h-3 w-36 animate-pulse rounded-full bg-paper-elevated" />
          <div className="h-7 w-4/5 animate-pulse rounded-lg bg-paper-elevated" />
          <div className="h-14 animate-pulse rounded-xl bg-paper-elevated" />
        </div>
      </div>
    </section>
  );
}
