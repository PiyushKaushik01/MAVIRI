import { Suspense } from "react";
import { LiveSearch } from "@/components/live-search";
import { SiteShell } from "@/components/site-shell";
import { Anime, getTrendingAnime } from "@/lib/anilist";

export const revalidate = 60;

export default function DiscoverPage() {
  return (
    <SiteShell active="discover">
      <section className="maviri-discover-intro">
        <div className="maviri-kicker"><span>02</span> FOLLOW THE THREAD</div>
        <h1>Find your<br /><em>next feeling.</em></h1>
        <p>Search the live catalogue. Find a title, then follow its story wherever it leads.</p>
        <span className="maviri-discover-intro__side-note">ANILIST GRAPHQL / LIVE INDEX</span>
      </section>
      <Suspense fallback={<DiscoverLoading />}>
        <DiscoverResults />
      </Suspense>
    </SiteShell>
  );
}

async function DiscoverResults() {
  let anime: Anime[] = [];
  let errorMessage = "";
  try {
    anime = await getTrendingAnime(12);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "The AniList catalogue could not be reached.";
  }

  if (errorMessage) {
    return (
      <div className="maviri-catalogue-error" role="status">
        <span>CATALOGUE CONNECTION</span>
        <p>{errorMessage}</p>
        <p>Try refreshing the page in a moment.</p>
      </div>
    );
  }
  return <LiveSearch initialAnime={anime} />;
}

function DiscoverLoading() {
  return (
    <section className="maviri-catalogue-pending" role="status" aria-live="polite">
      <span>ANILIST / LIVE CATALOGUE</span>
      <p>Connecting to trending anime…</p>
    </section>
  );
}
