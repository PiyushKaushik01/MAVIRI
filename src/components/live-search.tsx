"use client";

import { FormEvent, useEffect, useState } from "react";
import { Anime, animeTitle } from "@/lib/anilist";
import { AnimeCard } from "@/components/anime-card";

export function LiveSearch({ initialAnime }: { initialAnime: Anime[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[] | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const anime = query.trim() ? results ?? [] : initialAnime;

  useEffect(() => {
    if (query.trim().length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setStatus("");
      try {
        const response = await fetch(`/api/anime?search=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        const result = await response.json() as { anime?: Anime[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Search failed. Please try again.");
        setResults(result.anime ?? []);
        if (!result.anime?.length) setStatus(`No anime found for “${query.trim()}”.`);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") setStatus(error.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 280);

    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, initialAnime]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); }
  function handleQueryChange(value: string) {
    setQuery(value);
    setResults(null);
    setIsLoading(false);
    setStatus(value.trim().length === 1 ? "Enter at least two characters." : "");
  }

  return (
    <>
      <form className="maviri-search-form" role="search" onSubmit={handleSubmit}>
        <label className="maviri-search-form__label" htmlFor="maviri-anime-search">SEARCH THE CATALOGUE</label>
        <div className="maviri-search-form__control">
          <span aria-hidden="true">⌕</span>
          <input id="maviri-anime-search" type="search" value={query} onChange={(event) => handleQueryChange(event.target.value)} autoComplete="off" />
          <kbd>↵</kbd>
        </div>
        <p>Live results from the AniList catalogue</p>
      </form>
      <div className="maviri-results-heading"><span>{query ? "SEARCH RESULTS" : "TRENDING RIGHT NOW"}</span><span>{isLoading ? "SYNCING…" : `${anime.length} TITLES`}</span></div>
      {status ? <div className="maviri-feedback" role="status">{status}</div> : null}
      {anime.length ? <div className="maviri-anime-grid">{anime.map((item, index) => <AnimeCard key={item.id} anime={item} index={index} />)}</div> : !status && !isLoading ? <div className="maviri-feedback">No catalogue results to show.</div> : null}
      {anime[0] && <span className="maviri-visually-hidden">First result: {animeTitle(anime[0])}</span>}
    </>
  );
}
