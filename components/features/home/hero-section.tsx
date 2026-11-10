import Image from "next/image";
import { ArrowUpRight, MessageCircle, Sparkles, Users } from "lucide-react";
import { getFeaturedPayload } from "@/lib/anime-service";
import type { AnimeMedia } from "@/lib/anilist";

export async function HeroSection() {
  let seasonal: AnimeMedia[] = [];
  let trending: AnimeMedia[] = [];

  try {
    const payload = await getFeaturedPayload();
    seasonal = payload.seasonal;
    trending = payload.trending;
  } catch (error) {
    console.error("[HeroSection] AniList fetch failed:", error);
  }

  if (seasonal.length < 3 || trending.length < 3) {
    return (
      <section className="mt-10 rounded-2xl border border-border-soft bg-paper-raised p-8 text-center shadow-[var(--shadow-soft)] sm:p-10">
        <p className="text-sm font-medium text-ink-soft">
          Anime picks are taking a breather. Try again in a little while.
        </p>
      </section>
    );
  }

  const featured = trending[0];
  const episodeAnime = seasonal[0];
  const discussionAnime = trending[1];
  const featuredTitle = featured.title.english ?? featured.title.romaji ?? "Trending anime";
  const episodeTitle = episodeAnime.title.english ?? episodeAnime.title.romaji ?? "Seasonal pick";
  const discussionTitle = discussionAnime.title.english ?? discussionAnime.title.romaji ?? "Anime pick";

  return (
    <section className="home-hero relative mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-12 lg:gap-8">
      <div className="flex flex-col gap-6 md:col-span-4">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
            <Sparkles size={14} className="text-accent-primary" /> A little corner for anime people
          </p>
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Welcome to <span className="text-accent-primary">Maviri</span>.
          </h1>
          <p className="mt-3 max-w-prose text-sm font-medium leading-relaxed text-ink-soft">
            Find your next series, keep your watch progress, and trade episode thoughts with fans who care about the same details you do.
          </p>
          <div className="home-stamps" aria-label="What you can do on Maviri">
            <span className="home-stamp"><Sparkles className="h-3.5 w-3.5" /> Discover anime</span>
            <span className="home-stamp"><Users className="h-3.5 w-3.5" /> Find your people</span>
          </div>
        </div>

        <a href={`https://anilist.co/anime/${featured.id}`} target="_blank" rel="noreferrer noopener" aria-label={`Explore ${featuredTitle} on AniList`} className="home-featured-card group relative mt-1 block overflow-hidden rounded-[22px] border border-border-soft bg-paper-raised text-left no-underline shadow-[var(--shadow-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-elevated">
            {featured.coverImage.extraLarge || featured.coverImage.large ? (
              <Image
                src={featured.coverImage.extraLarge ?? featured.coverImage.large!}
                alt={`${featuredTitle} cover artwork`}
                fill
                preload
                sizes="(max-width: 767px) 100vw, 34vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
                Trending now <ArrowUpRight size={12} />
              </span>
              <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{featuredTitle}</h2>
              <p className="mt-2 text-sm font-medium text-white/80">
                {featured.genres.slice(0, 2).join(" · ")}
                {featured.seasonYear ? ` · ${featured.seasonYear}` : ""}
              </p>
            </div>
          </div>
        </a>
      </div>

      <div className="flex flex-col gap-5 md:col-span-8">
        <article className="home-social-post overflow-hidden rounded-[22px] border border-border-soft bg-paper-raised p-4 shadow-[var(--shadow-soft)] sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-primary/20 text-accent-primary">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted">Seasonal spotlight</p>
              <p className="mt-1 truncate text-sm font-bold text-ink">{episodeTitle}</p>
            </div>
            {episodeAnime.status === "RELEASING" && (
              <span className="ml-auto shrink-0 rounded-full bg-accent-secondary/20 px-2.5 py-1 text-[10px] font-bold text-ink-soft">Airing</span>
            )}
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-paper-elevated">
            {episodeAnime.bannerImage || episodeAnime.coverImage.extraLarge || episodeAnime.coverImage.large ? (
              <Image
                src={episodeAnime.bannerImage ?? episodeAnime.coverImage.extraLarge ?? episodeAnime.coverImage.large!}
                alt={`${episodeTitle} artwork`}
                fill
                sizes="(max-width: 767px) 100vw, 66vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.025]"
              />
            ) : null}
            {episodeAnime.episodes && (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {episodeAnime.episodes} episodes
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink-soft">
              {episodeAnime.genres.slice(0, 3).join(" · ") || "A new seasonal pick"}
            </p>
            <a className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-ink hover:text-ink-muted" href={`https://anilist.co/anime/${episodeAnime.id}`} target="_blank" rel="noreferrer noopener">
              Show details <ArrowUpRight size={15} />
            </a>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[22px] border border-border-soft bg-paper-raised p-5 sm:p-6">
          <div className="absolute right-5 top-5 text-accent-tertiary/70" aria-hidden="true"><MessageCircle size={22} /></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">A conversation starter</p>
          <h2 className="mt-3 max-w-2xl text-xl font-bold leading-snug text-ink sm:text-2xl">
            What makes a slow-burn story worth sticking with?
          </h2>
          <a className="mt-5 flex min-h-16 items-center gap-3 rounded-xl bg-paper-elevated/70 p-3 transition-colors hover:bg-paper-elevated" href={`https://anilist.co/anime/${discussionAnime.id}`} target="_blank" rel="noreferrer noopener">
            {discussionAnime.coverImage.large && (
              <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-paper-elevated">
                <Image src={discussionAnime.coverImage.large} alt="" fill sizes="36px" className="object-cover" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink">Try the question with {discussionTitle}</span>
              <span className="mt-1 block text-xs text-ink-muted">{discussionAnime.genres.slice(0, 2).join(" · ")}</span>
            </span>
            <ArrowUpRight size={16} className="shrink-0 text-ink-muted" />
          </a>
          <p className="mt-3 text-xs text-ink-muted">A prompt for your next anime night, ready whenever the conversation is.</p>
        </article>
      </div>
    </section>
  );
}
