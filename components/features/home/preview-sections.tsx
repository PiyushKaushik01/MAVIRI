import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { getFeaturedPayload } from "@/lib/anime-service";
import type { AnimeMedia } from "@/lib/anilist";

export async function PreviewSections() {
  let shelfPicks: AnimeMedia[] = [];
  let conversationPicks: AnimeMedia[] = [];

  try {
    const payload = await getFeaturedPayload();
    shelfPicks = payload.seasonal.slice(0, 3);
    conversationPicks = payload.trending.slice(1, 5);
  } catch (error) {
    console.error("[PreviewSections] AniList fetch failed:", error);
  }

  return (
    <div className="mt-20 flex flex-col gap-20 sm:mt-28 sm:gap-28">
      <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16" aria-labelledby="shelf-preview-title">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">A shelf that remembers</p>
          <h2 id="shelf-preview-title" className="mt-3 max-w-lg text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Your anime journey, all in one place.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Keep the series you are watching close, mark the ones you have finished, and pick up right where you left off.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {["Episode progress and rewatches", "Ratings and personal notes", "A clear place for your next watch"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-semibold text-ink">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-secondary" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="shelf-preview rounded-[22px] border border-border-soft bg-paper-raised p-4 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-border-soft pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Currently watching</p>
              <p className="mt-1 text-xs text-ink-muted">Sample shelf preview</p>
            </div>
            <span className="rounded-full bg-accent-primary/25 px-3 py-1 text-xs font-bold text-ink">3 active</span>
          </div>

          <div className="flex flex-col gap-3">
            {shelfPicks.map((anime, index) => {
              const title = anime.title.english ?? anime.title.romaji ?? "Anime pick";
              const totalEpisodes = anime.episodes ?? 24;
              const currentEpisode = Math.max(1, Math.ceil(totalEpisodes * (index === 0 ? 0.43 : index === 1 ? 0.25 : 0.68)));
              const progress = Math.min(100, Math.round((currentEpisode / totalEpisodes) * 100));

              return (
                <article key={anime.id} className="shelf-row flex items-center gap-3 rounded-xl p-2.5 sm:gap-4 sm:p-3">
                  <div className="relative h-[68px] w-12 shrink-0 overflow-hidden rounded-lg bg-paper-elevated">
                    {anime.coverImage.large && <Image src={anime.coverImage.large} alt={`${title} cover`} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="max-w-full truncate text-sm font-bold text-ink">{title}</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-muted"><Clock3 size={11} /> Watching</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-paper-elevated">
                        <div className="h-full rounded-full bg-accent-secondary" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold tabular-nums text-ink-muted">{currentEpisode} / {totalEpisodes}</span>
                    </div>
                  </div>
                </article>
              );
            })}
            {shelfPicks.length === 0 && <p className="py-6 text-sm text-ink-muted">Anime cover previews will return when AniList is available.</p>}
          </div>
        </div>
      </section>

      <section className="community-preview grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-16" aria-labelledby="conversation-preview-title">
        <div className="community-note rounded-[22px] p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">Conversation starter</p>
          <h2 id="conversation-preview-title" className="mt-3 max-w-xl text-3xl font-black leading-tight text-ink sm:text-4xl">
            The best part is having someone to talk about it with.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft sm:text-base">
            Bring your theories, favorite scenes, and wildly specific character rankings. Maviri gives every anime its own place in the conversation.
          </p>
          <Link href="/discover" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-primary">
            Find something to watch <ArrowRight size={16} />
          </Link>
        </div>

        <div className="conversation-art" role="group" aria-label="Trending anime artwork">
          {conversationPicks.slice(0, 4).map((anime, index) => {
            const title = anime.title.english ?? anime.title.romaji ?? "Anime pick";
            return (
              <a key={anime.id} href={`https://anilist.co/anime/${anime.id}`} target="_blank" rel="noreferrer noopener" className={`conversation-poster poster-${index + 1}`} aria-label={`Explore ${title} on AniList`}>
                {anime.coverImage.large && <Image src={anime.coverImage.large} alt="" fill sizes="(max-width: 640px) 25vw, 120px" className="object-cover" />}
                <span>{title}</span>
              </a>
            );
          })}
          {conversationPicks.length === 0 && <p className="text-sm text-ink-muted">Trending artwork will return when AniList is available.</p>}
        </div>
      </section>
    </div>
  );
}
