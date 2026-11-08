"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Anime, animeTitle } from "@/lib/anilist";

export function AnimeEmbed({ aniListMediaId }: { aniListMediaId: number }) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/anime/${aniListMediaId}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as { anime?: Anime; error?: string };
        if (!response.ok || !result.anime) throw new Error(result.error ?? "AniList title is unavailable.");
        setAnime(result.anime);
      })
      .catch((caught: unknown) => {
        if (caught instanceof Error && caught.name !== "AbortError") setError(caught.message);
      });
    return () => controller.abort();
  }, [aniListMediaId]);

  if (error) return <div className="maviri-post-card__anime maviri-post-card__anime--error"><span>ANILIST ENTRY / {aniListMediaId}</span><strong>{error}</strong><Link href={`/anime/${aniListMediaId}`}>OPEN TITLE ↗</Link></div>;
  if (!anime) return <div className="maviri-post-card__anime maviri-post-card__anime--loading"><span>ANILIST ENTRY / {aniListMediaId}</span><strong>Fetching live title details…</strong></div>;

  return (
    <Link className="maviri-anime-embed" href={`/anime/${anime.id}`}>
      {anime.coverImage.large && <Image src={anime.coverImage.large} alt="" width={104} height={134} unoptimized loading="lazy" />}
      <span><small>ANILIST / {anime.format?.replaceAll("_", " ") ?? "ANIME"}</small><strong>{animeTitle(anime)}</strong><small>{anime.seasonYear ?? "—"} {anime.averageScore ? `· SCORE ${anime.averageScore}` : ""}</small></span>
      <b aria-hidden="true">↗</b>
    </Link>
  );
}
