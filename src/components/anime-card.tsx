import Link from "next/link";
import { Anime, animeTitle } from "@/lib/anilist";

type AnimeCardProps = { anime: Anime; index?: number };

export function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const title = animeTitle(anime);
  return (
    <article className="maviri-anime-card">
      <Link className="maviri-anime-card__link" href={`/anime/${anime.id}`} aria-label={`Open ${title}`}>
        <div className="maviri-anime-card__artwork-wrap">
          {anime.coverImage.large ? (
            // AniList controls image dimensions and provides the source URL.
            // eslint-disable-next-line @next/next/no-img-element
            <img className="maviri-anime-card__artwork" src={anime.coverImage.large} alt="" loading="lazy" />
          ) : <div className="maviri-anime-card__artwork-fallback" aria-hidden="true">M</div>}
          <span className="maviri-anime-card__index">{String(index + 1).padStart(2, "0")}</span>
          {anime.averageScore && <span className="maviri-anime-card__score">✳ {anime.averageScore}</span>}
        </div>
        <div className="maviri-anime-card__meta">
          <h3>{title}</h3>
          <p>{[anime.format?.replaceAll("_", " "), anime.seasonYear].filter(Boolean).join(" · ")}</p>
        </div>
      </Link>
    </article>
  );
}
