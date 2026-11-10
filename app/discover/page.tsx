import { DiscoveryExplorer } from "@/components/features/discover/discovery-explorer";
import { getFeaturedPayload, type FeaturedPayload } from "@/lib/anime-service";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  let payload: FeaturedPayload | null = null;
  let failed = false;
  try {
    payload = await getFeaturedPayload();
  } catch (error) {
    console.error("[DiscoverPage] AniList fetch failed:", error);
    failed = true;
  }

  if (failed || !payload) {
    return (
      <main className="mx-auto min-h-[65vh] w-full max-w-[1360px] px-4 py-16 sm:px-6 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">The anime index</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">The shelves are refreshing.</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">AniList did not answer this time. Refresh in a moment and the seasonal and trending picks will be back.</p>
      </main>
    );
  }

  return <DiscoveryExplorer seasonal={payload.seasonal} trending={payload.trending} />;
}
