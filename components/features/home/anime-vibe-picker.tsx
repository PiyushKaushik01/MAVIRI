"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";

type VibeAnime = {
  id: number;
  title: { english: string | null; romaji: string | null };
  coverImage: { large: string | null; extraLarge: string | null };
  description: string | null;
  genres: string[];
  averageScore: number | null;
};

export function AnimeVibePicker({ anime }: { anime: VibeAnime[] }) {
  const genres = useMemo(
    () => Array.from(new Set(anime.flatMap((title) => title.genres))).slice(0, 6),
    [anime]
  );
  const [genre, setGenre] = useState(genres[0] ?? "All picks");
  const [selectedId, setSelectedId] = useState(anime[0]?.id);
  const filtered = anime.filter((title) => title.genres.includes(genre));
  const visibleAnime = filtered.length ? filtered : anime;
  const selectedAnime =
    visibleAnime.find((title) => title.id === selectedId) ?? visibleAnime[0];

  if (!selectedAnime) return null;

  const title = selectedAnime.title.english ?? selectedAnime.title.romaji ?? "Anime pick";
  const description = selectedAnime.description
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();

  return (
    <section className="home-vibe-board mt-20" aria-labelledby="home-vibe-title">
      <div className="home-vibe-intro">
        <span className="home-vibe-kicker"><Sparkles size={13} /> THE ANIME CORNER</span>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/70">A little scroll, a new obsession</p>
            <h2 id="home-vibe-title" className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Pick a vibe. Meet a show.
            </h2>
          </div>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-ink/75">
            Browse real seasonal and trending anime, then see what catches your eye. Save it to your shelf and bring the episode talk back to Maviri.
          </p>
        </div>
        <div className="home-vibe-genre" role="group" aria-label="Filter anime by genre">
          {genres.map((item) => (
            <button
              key={item}
              type="button"
              className="home-vibe-chip"
              aria-pressed={genre === item}
              onClick={() => {
                setGenre(item);
                const nextSelection = anime.find((title) => title.genres.includes(item));
                if (nextSelection) setSelectedId(nextSelection.id);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="home-vibe-content">
        <div className="home-vibe-posters" aria-label={`${genre} anime`}>
          {visibleAnime.slice(0, 4).map((item) => {
            const itemTitle = item.title.english ?? item.title.romaji ?? "Anime pick";
            const imageUrl = item.coverImage.extraLarge ?? item.coverImage.large;
            return (
              <button
                key={item.id}
                type="button"
                className="home-vibe-poster"
                aria-pressed={selectedAnime.id === item.id}
                aria-label={`Show details for ${itemTitle}`}
                onClick={() => setSelectedId(item.id)}
              >
                {imageUrl ? (
                  <Image src={imageUrl} alt="" width={300} height={400} sizes="(max-width: 640px) 42vw, 142px" />
                ) : (
                  <span className="grid aspect-[3/4] place-items-center bg-paper-elevated" aria-hidden="true">✦</span>
                )}
                <span>{itemTitle}</span>
              </button>
            );
          })}
        </div>

        <article className="home-vibe-detail" aria-live="polite">
          <span className="home-vibe-detail-label">
            {genre}{selectedAnime.averageScore ? ` · ${selectedAnime.averageScore}% score` : " · now in the mix"}
          </span>
          <h3>{title}</h3>
          <p>{description || "A trending pick from AniList. Open the discovery page to browse more titles and find your next watch."}</p>
          <a className="home-vibe-link" href={`https://anilist.co/anime/${selectedAnime.id}`} target="_blank" rel="noreferrer noopener">
            More on AniList <ArrowUpRight size={15} />
          </a>
        </article>
      </div>
    </section>
  );
}
