import Image from "next/image";
import { MessageCircle, Heart, Repeat2, Play } from "lucide-react";
import { getFeaturedPayload } from "@/lib/anime-service";
import type { AnimeMedia } from "@/lib/anilist";

export async function HeroSection() {
  let seasonal: AnimeMedia[] = [];
  let trending: AnimeMedia[] = [];
  let failed = false;

  try {
    const payload = await getFeaturedPayload();
    seasonal = payload.seasonal;
    trending = payload.trending;
  } catch (err) {
    console.error("[HeroSection] AniList fetch failed:", err);
    failed = true;
  }

  if (failed || seasonal.length < 3 || trending.length < 3) {
    return (
      <section className="mt-10 rounded-2xl border-2 border-ink bg-paper-raised p-10 text-center shadow-[4px_4px_0_0_var(--ink)]">
        <p className="text-sm font-medium text-ink-soft">
          The community is currently offline. Please refresh.
        </p>
      </section>
    );
  }

  const featured = seasonal[0];
  const postAnime = trending[0];
  const threadAnime = trending[1];

  return (
    <section className="relative mt-8 md:mt-12 grid grid-cols-1 gap-6 md:grid-cols-12 lg:gap-8">
      
      {/* Zone 1: The Welcome & Featured Anime (Left, spans 4 cols) */}
      <div className="md:col-span-4 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Welcome to <span className="text-accent-primary drop-shadow-[2px_2px_0_var(--ink)]">Maviri</span>.
          </h1>
          <p className="mt-3 text-sm font-medium text-ink-soft leading-relaxed">
            The social layer for your anime obsession. Track what you watch, discover your next favourite, and talk about it with people who get it.
          </p>
        </div>

        <article className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[6px_6px_0_0_var(--ink)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--ink)] mt-2">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-elevated">
            <Image
              src={featured.coverImage.extraLarge || featured.coverImage.large!}
              alt=""
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="mb-2 inline-block rounded-md bg-accent-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-ink">
                Trending #1
              </span>
              <h2 className="text-2xl font-bold leading-tight text-white">
                {featured.title.english ?? featured.title.romaji}
              </h2>
              <p className="text-sm font-medium text-white/80 mt-1">
                {featured.genres.slice(0, 2).join(" · ")}
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Zone 2: The Social Posts (Right, spans 8 cols) */}
      <div className="md:col-span-8 flex flex-col gap-6">
        
        {/* Post Type 1: Instagram-style Media Post */}
        <article className="rounded-2xl border-2 border-ink bg-paper-raised p-4 shadow-[4px_4px_0_0_var(--ink)]">
          <div className="flex items-center gap-3 mb-3">
            {/* Mock Avatar using a character image */}
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-ink bg-accent-secondary">
              <Image src={threadAnime.coverImage.large!} alt="User" fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink leading-none">@kaush</p>
              <p className="text-xs font-medium text-ink-muted mt-1">Watching {postAnime.title.romaji}</p>
            </div>
          </div>
          
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border-2 border-ink bg-paper-elevated">
             <Image src={postAnime.bannerImage || postAnime.coverImage.extraLarge!} alt="Post content" fill className="object-cover" />
             <div className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 backdrop-blur-md">
               <span className="text-xs font-bold text-white">EP 8 / 12</span>
             </div>
          </div>
          
          <p className="mt-3 text-sm font-medium text-ink line-clamp-2">
            The animation in this episode was absolutely insane. Studio MAPPA never misses. The fight choreography is on another level. 🍿🔥
          </p>
          
          <div className="mt-4 flex items-center gap-6 border-t-2 border-ink/10 pt-3">
            <button className="flex items-center gap-1.5 text-ink-soft hover:text-accent-primary transition-colors">
              <Heart className="h-4 w-4" /> <span className="text-xs font-bold">1.2k</span>
            </button>
            <button className="flex items-center gap-1.5 text-ink-soft hover:text-accent-secondary transition-colors">
              <MessageCircle className="h-4 w-4" /> <span className="text-xs font-bold">84</span>
            </button>
          </div>
        </article>

        {/* Post Type 2: Twitter/X-style Discussion */}
        <article className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_0_var(--ink)] relative overflow-hidden">
          {/* Decorative background accent */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-tertiary/20 blur-2xl" />
          
          <div className="flex gap-3">
             <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-ink bg-accent-tertiary">
              <Image src={seasonal[1].coverImage.large!} alt="User" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-ink">@anime_critic</p>
                <span className="text-xs font-medium text-ink-muted">· 2h</span>
              </div>
              <p className="text-sm font-medium text-ink mt-1 mb-3">
                Unpopular opinion: The pacing in the first half was actually necessary for the world-building. If they rushed it, we wouldn't care about the stakes in season 2. You guys just have TikTok attention spans. 🤷‍♂️
              </p>
              
              {/* Embedded Anime Card inside text post */}
              <div className="flex items-center gap-3 rounded-xl border-2 border-ink bg-paper-raised p-2 transition-colors hover:bg-paper-elevated cursor-pointer">
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md border border-ink">
                  <Image src={threadAnime.coverImage.large!} alt="Anime" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink leading-tight line-clamp-1">{threadAnime.title.english ?? threadAnime.title.romaji}</p>
                  <p className="text-[10px] font-medium text-ink-soft mt-0.5">Action · Drama · 2024</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-6">
                <button className="flex items-center gap-1.5 text-ink-soft hover:text-accent-secondary transition-colors">
                  <MessageCircle className="h-4 w-4" /> <span className="text-xs font-bold">402</span>
                </button>
                <button className="flex items-center gap-1.5 text-ink-soft hover:text-accent-primary transition-colors">
                  <Repeat2 className="h-4 w-4" /> <span className="text-xs font-bold">1.5k</span>
                </button>
              </div>
            </div>
          </div>
        </article>

      </div>
    </section>
  );
} 