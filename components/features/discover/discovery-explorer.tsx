"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Search, Sparkles, Star, X } from "lucide-react";
import type { AnimeMedia } from "@/lib/anilist";

type Collection = "seasonal" | "trending";

function cleanDescription(description: string | null) {
  return description
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function DiscoveryExplorer({ seasonal, trending }: { seasonal: AnimeMedia[]; trending: AnimeMedia[] }) {
  const [collection, setCollection] = useState<Collection>("seasonal");
  const [genre, setGenre] = useState("All genres");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(seasonal[0]?.id ?? trending[0]?.id ?? null);
  const [searchState, setSearchState] = useState<{ term: string; results: AnimeMedia[]; error: boolean } | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  const allAnime = useMemo(
    () => [...seasonal, ...trending].filter((anime, index, all) => all.findIndex((candidate) => candidate.id === anime.id) === index),
    [seasonal, trending]
  );
  const genres = useMemo(() => Array.from(new Set(allAnime.flatMap((anime) => anime.genres))).slice(0, 10), [allAnime]);
  const collectionAnime = collection === "seasonal" ? seasonal : trending;
  const matchingGenreQuery = genres.some((item) => item.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 2 || matchingGenreQuery) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/anime/search?q=${encodeURIComponent(searchTerm)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Anime search failed");
        const data = (await response.json()) as { results: AnimeMedia[] };
        setSearchState({ term: searchTerm, results: data.results, error: false });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("[DiscoveryExplorer] search failed:", error);
          setSearchState({ term: searchTerm, results: [], error: true });
        }
      }
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [matchingGenreQuery, query]);

  const remoteSearch = query.trim().length >= 2 && !matchingGenreQuery;
  const searchResults = searchState?.term === query.trim() ? searchState.results : null;
  const searching = remoteSearch && searchResults === null;
  const searchError = searchState?.term === query.trim() && searchState.error;
  const sourceAnime = remoteSearch
    ? searchResults ?? []
    : collectionAnime;
  const filteredAnime = sourceAnime.filter((anime) => {
    const title = `${anime.title.english ?? ""} ${anime.title.romaji ?? ""} ${anime.title.native ?? ""}`.toLowerCase();
    const matchesSearch = title.includes(query.trim().toLowerCase()) || anime.genres.some((item) => item.toLowerCase().includes(query.trim().toLowerCase()));
    return matchesSearch && (genre === "All genres" || anime.genres.includes(genre));
  });
  const selected = filteredAnime.find((anime) => anime.id === selectedId) ?? filteredAnime[0];
  const searchableAnime = useMemo(
    () => [...allAnime, ...(searchState?.results ?? [])].filter((anime, index, all) => all.findIndex((candidate) => candidate.id === anime.id) === index),
    [allAnime, searchState]
  );
  const related = selected
    ? searchableAnime.filter((anime) => anime.id !== selected.id && anime.genres.some((item) => selected.genres.includes(item))).slice(0, 4)
    : [];
  const description = selected && cleanDescription(selected.description);

  const changeCollection = (next: Collection) => {
    setCollection(next);
    setSelectedId((next === "seasonal" ? seasonal : trending)[0]?.id ?? null);
    setGenre("All genres");
  };

  const selectAnime = (id: number) => {
    setSelectedId(id);
    if (window.innerWidth < 1024) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }));
    }
  };

  return (
    <main className="discovery-page mx-auto w-full max-w-[1360px] px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-10">
      <header className="discovery-heading mb-8 grid gap-6 lg:grid-cols-[1fr_minmax(280px,0.58fr)] lg:items-end lg:mb-12">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-muted"><Sparkles size={14} className="text-accent-primary" /> The anime index</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-5xl">Find your next obsession.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">Search what you love, follow a genre thread, and see what is catching fire this season.</p>
        </div>

        <label className="discovery-search flex min-h-14 items-center gap-3 px-4">
          <Search size={19} className="shrink-0 text-ink-muted" aria-hidden="true" />
          <span className="sr-only">Search anime by title or genre</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title or genre..."
            className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink outline-none placeholder:text-ink-muted"
          />
          {query && <button type="button" onClick={() => setQuery("")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-paper-elevated hover:text-ink" aria-label="Clear search"><X size={17} /></button>}
        </label>
      </header>

      <section aria-label="Anime collections">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-border-soft pb-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Browse the shelves</h2>
            <p className="mt-1 text-sm text-ink-muted">{searching ? "Searching the AniList catalogue…" : searchError ? "Search could not connect" : remoteSearch ? "Results from the anime catalogue" : collection === "seasonal" ? "Fresh from this season" : "Rising through the charts"}</p>
          </div>
          <div className="flex rounded-full bg-paper-elevated/70 p-1" role="group" aria-label="Choose anime collection">
            <button type="button" className="discovery-filter border-0 bg-transparent" aria-pressed={collection === "seasonal"} onClick={() => changeCollection("seasonal")}>This season</button>
            <button type="button" className="discovery-filter border-0 bg-transparent" aria-pressed={collection === "trending"} onClick={() => changeCollection("trending")}>Trending</button>
          </div>
        </div>

        <div className="mb-7 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by genre">
          {["All genres", ...genres].map((item) => (
            <button key={item} type="button" className="discovery-filter shrink-0" aria-pressed={genre === item} onClick={() => setGenre(item)}>{item}</button>
          ))}
        </div>

        {filteredAnime.length === 0 && searching ? (
          <div className="discovery-detail p-8 text-center sm:p-12" role="status">
            <p className="font-bold text-ink">Looking across the anime index…</p>
            <p className="mt-2 text-sm text-ink-muted">Search results will appear here.</p>
          </div>
        ) : filteredAnime.length === 0 ? (
          <div className="discovery-detail p-8 text-center sm:p-12">
            <p className="font-bold text-ink">{searchError ? "Anime search is unavailable right now." : "No anime matched that search."}</p>
            <p className="mt-2 text-sm text-ink-muted">{searchError ? "Try again shortly or browse the seasonal and trending shelves." : "Try another title or clear the genre filter."}</p>
            <button type="button" className="discovery-filter mt-5" onClick={() => { setQuery(""); setGenre("All genres"); }}>Reset filters</button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(310px,0.75fr)] lg:items-start">
            <div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-4">
                {filteredAnime.map((anime) => {
                  const title = anime.title.english ?? anime.title.romaji ?? "Anime pick";
                  const active = selected?.id === anime.id;
                  return (
                    <button key={anime.id} type="button" onClick={() => selectAnime(anime.id)} aria-pressed={active} aria-label={`Show details for ${title}`} className={`discovery-poster group overflow-hidden text-left ${active ? "ring-2 ring-accent-primary ring-offset-2 ring-offset-paper" : ""}`}>
                      <span className="relative block aspect-[3/4] overflow-hidden bg-paper-elevated">
                        {anime.coverImage.large && <Image src={anime.coverImage.large} alt="" fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 220px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
                        {anime.averageScore && <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-paper-raised/95 px-2 py-1 text-[10px] font-bold text-ink"><Star size={10} className="fill-accent-primary text-accent-primary" />{(anime.averageScore / 10).toFixed(1)}</span>}
                      </span>
                      <span className="block p-3">
                        <span className="block truncate text-sm font-bold text-ink">{title}</span>
                        <span className="mt-1 block truncate text-xs text-ink-muted">{anime.genres.slice(0, 2).join(" · ") || anime.format || "Anime"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selected && (
              <aside ref={detailRef} className="discovery-detail scroll-mt-5 overflow-hidden lg:sticky lg:top-6" aria-live="polite">
                <div className="relative aspect-[16/8] overflow-hidden bg-paper-elevated sm:aspect-[16/7]">
                  {(selected.bannerImage || selected.coverImage.extraLarge || selected.coverImage.large) && <Image src={selected.bannerImage ?? selected.coverImage.extraLarge ?? selected.coverImage.large!} alt="" fill sizes="(max-width: 1023px) 100vw, 38vw" className="object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-4 left-5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm">{collection === "seasonal" ? "Seasonal pick" : "Trending"}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                    {[selected.season, selected.seasonYear].filter(Boolean).join(" ") || selected.format || "Anime"}
                    {selected.averageScore ? ` · ${selected.averageScore}% score` : ""}
                  </p>
                  <h2 className="mt-2 text-2xl font-black leading-tight text-ink">{selected.title.english ?? selected.title.romaji}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft">{description || "Open AniList to see the full synopsis, staff, cast, and related titles."}</p>
                  <div className="mt-4 flex flex-wrap gap-2">{selected.genres.map((item) => <span key={item} className="rounded-full bg-paper-elevated px-3 py-1 text-xs font-semibold text-ink-soft">{item}</span>)}</div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-soft pt-4">
                    <span className="text-xs text-ink-muted">{selected.episodes ? `${selected.episodes} episodes` : "Episode count unknown"}{selected.status === "RELEASING" ? " · Airing" : ""}</span>
                    <a href={`https://anilist.co/anime/${selected.id}`} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-ink hover:text-ink-muted">Full details <ArrowUpRight size={15} /></a>
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}
      </section>

      {selected && related.length > 0 && (
        <section className="mt-16 border-t border-border-soft pt-8" aria-labelledby="related-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Follow the thread</p><h2 id="related-title" className="mt-2 text-2xl font-bold text-ink">More like {selected.title.english ?? selected.title.romaji}</h2></div>
            <span className="hidden items-center gap-1 text-sm text-ink-muted sm:flex">Shared genres <ArrowRight size={14} /></span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((anime) => (
              <button key={anime.id} type="button" onClick={() => { setSelectedId(anime.id); const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }); }} className="group flex min-w-0 items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-paper-elevated/70">
                <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-paper-elevated">{anime.coverImage.large && <Image src={anime.coverImage.large} alt="" fill sizes="40px" className="object-cover transition-transform duration-300 group-hover:scale-105" />}</span>
                <span className="min-w-0"><span className="block truncate text-xs font-bold text-ink">{anime.title.english ?? anime.title.romaji}</span><span className="mt-1 block truncate text-[10px] text-ink-muted">{anime.genres.find((item) => selected.genres.includes(item))}</span></span>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
