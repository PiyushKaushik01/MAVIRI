import { Suspense } from "react";
import Image from "next/image";
import { getFeaturedPayload } from "@/lib/anime-service";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const payload = await getFeaturedPayload();
  const animeList = payload.seasonal; // Reusing the fetch for now

  return (
    <div className="min-h-screen bg-paper">
      {/* Top Navigation Placeholder */}
      <div className="border-b-2 border-ink bg-paper-raised px-6 py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <span className="font-accent text-xl font-bold">Maviri</span>
          <span className="text-sm font-bold text-ink-muted">Discovery Stage</span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
        
        {/* Search Header */}
        <section className="mb-16">
          <h1 className="text-4xl font-black tracking-tight mb-6">Find your next obsession.</h1>
          <div className="relative max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-ink-muted" />
            </div>
            <input
              type="text"
              placeholder="Search titles, studios, genres..."
              className="w-full rounded-2xl border-2 border-ink bg-paper-raised py-4 pl-12 pr-4 text-lg font-medium shadow-[4px_4px_0_0_var(--ink)] outline-none transition-shadow focus:shadow-[6px_6px_0_0_var(--ink)]"
            />
          </div>
        </section>

        {/* Thematic Cluster: Seasonal */}
        <section className="mb-20">
          <div className="mb-6 flex items-end justify-between border-b-2 border-ink pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-ink">This Season</h2>
              <p className="text-sm font-medium text-ink-soft">Airing right now</p>
            </div>
            <button className="text-sm font-bold text-ink hover:text-accent-tertiary underline decoration-2 underline-offset-4">
              View all
            </button>
          </div>
          
          {/* Horizontal Scroll Container */}
          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory hide-scrollbar">
            {animeList.slice(0, 6).map((anime) => (
              <article 
                key={anime.id} 
                className="group relative w-[200px] shrink-0 snap-start cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-ink bg-paper-elevated transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[4px_4px_0_0_var(--ink)]">
                  {anime.coverImage.large && (
                    <Image
                      src={anime.coverImage.large}
                      alt={anime.title.romaji ?? ""}
                      fill
                      className="object-cover"
                    />
                  )}
                  {anime.averageScore && (
                    <span className="absolute right-2 top-2 rounded-md border border-ink bg-accent-primary px-1.5 py-0.5 text-[10px] font-bold text-ink">
                      ★ {(anime.averageScore / 10).toFixed(1)}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-bold text-ink line-clamp-1 group-hover:underline decoration-2 underline-offset-2">
                  {anime.title.english ?? anime.title.romaji}
                </h3>
                <p className="text-xs font-medium text-ink-soft line-clamp-1">
                  {anime.genres.join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Thematic Cluster: Staggered Grid (Hidden Gems) */}
        <section>
           <div className="mb-6 flex items-end justify-between border-b-2 border-ink pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-ink">Critically Acclaimed</h2>
              <p className="text-sm font-medium text-ink-soft">Must-watch masterpieces</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {animeList.slice(6, 10).map((anime, i) => (
              <article 
                key={anime.id} 
                className={`group relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-ink shadow-[4px_4px_0_0_var(--ink)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)] ${i % 2 !== 0 ? 'md:mt-12' : ''}`}
              >
                {anime.coverImage.large && (
                  <Image
                    src={anime.coverImage.large}
                    alt={anime.title.romaji ?? ""}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-sm font-bold text-white line-clamp-2">
                    {anime.title.english ?? anime.title.romaji}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}