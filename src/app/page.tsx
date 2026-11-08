import { Suspense } from "react";
import Link from "next/link";
import { AnimeCard } from "@/components/anime-card";
import { FeedPost, PostCard } from "@/components/post-card";
import { SiteShell } from "@/components/site-shell";
import { animeTitle, getTrendingAnime, plainDescription, type Anime } from "@/lib/anilist";
import { getRankedCommunityPosts } from "@/lib/community-feed";
import { getCurrentSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <SiteShell active="home">
      <section className="maviri-home-intro">
        <div className="maviri-kicker"><span>01</span> A NEW KIND OF ANIME SPACE <span className="maviri-kicker__rule" /></div>
        <h1>Stories worth<br /><em>staying for.</em></h1>
        <p className="maviri-home-intro__copy">Find the next world you’ll love. Follow the threads that make it matter.</p>
        <Link className="maviri-text-link" href="/discover">STEP INTO DISCOVERY <span aria-hidden="true">↗</span></Link>
        <span className="maviri-home-intro__seal" aria-hidden="true">M<br />✳</span>
      </section>
      <Suspense fallback={null}><HomeCommunity /></Suspense>
      <Suspense fallback={<HomeCatalogueLoading />}><HomeCatalogue /></Suspense>
      <section className="maviri-next-note"><span>MORE THAN A WATCHLIST.</span><p>A space for the shows you love and the people you meet through them.</p><span className="maviri-next-note__mark">M / 01</span></section>
    </SiteShell>
  );
}

async function HomeCommunity() {
  let communityPosts: FeedPost[] = [];
  let communityAvailable = false;
  try {
    const session = await getCurrentSession();
    if (session) {
      const feed = await getRankedCommunityPosts({ viewerId: session.user.id, take: 3 });
      communityPosts = feed.posts.map((post) => ({ ...post, createdAt: post.createdAt.toISOString() }));
      communityAvailable = true;
    }
  } catch {
    communityAvailable = false;
  }

  if (!communityAvailable) return null;
  return (
    <section className="maviri-home-community">
      <div className="maviri-section-heading"><div><span className="maviri-section-heading__eyebrow">YOUR CIRCLE / FRESH THREADS</span><h2>In the <em>conversation.</em></h2></div><Link href="/community">OPEN COMMUNITY <span>↗</span></Link></div>
      {communityPosts.length ? communityPosts.map((post) => <PostCard key={post.id} post={post} />) : <div className="maviri-community-signin"><span>YOUR FEED IS QUIET</span><p>Follow someone or start the first thread in your circle.</p><Link className="maviri-text-link" href="/community">START A CONVERSATION ↗</Link></div>}
      <Link className="maviri-library-shortcut" href="/library">OPEN YOUR ANIME LIBRARY ↗</Link>
    </section>
  );
}

async function HomeCatalogue() {
  let anime: Anime[] = [];
  let errorMessage = "";
  try {
    anime = await getTrendingAnime(9);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "The AniList catalogue could not be reached.";
  }

  if (errorMessage) return <CatalogueError message={errorMessage} />;

  const lead = anime[0];
  const description = lead ? plainDescription(lead.description) : "";
  return (
    <>
      {lead ? <section className="maviri-feature" aria-labelledby="maviri-feature-title">
        <div className="maviri-feature__visual">
          {lead.bannerImage ? (
            // AniList image URLs are returned at runtime and are not known to Next's image optimizer.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead.bannerImage} alt="" className="maviri-feature__banner" />
          ) : lead.coverImage.extraLarge ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead.coverImage.extraLarge} alt="" className="maviri-feature__banner maviri-feature__banner--cover" />
          ) : null}
          <div className="maviri-feature__overlay" />
          <span className="maviri-feature__stamp">TRENDING<br />ON ANILIST</span>
          <div className="maviri-feature__content">
            <p>THE STORY IN THE SPOTLIGHT <span>&#10022; {lead.averageScore ?? "Not rated"}</span></p>
            <h2 id="maviri-feature-title">{animeTitle(lead)}</h2>
            <div className="maviri-feature__tags">{lead.format?.replaceAll("_", " ")} <i /> {lead.seasonYear ?? "NOW"} {lead.season ?? ""}</div>
            <p className="maviri-feature__description">{description.slice(0, 190) || "Explore this title in the AniList catalogue."}{description.length > 190 ? "..." : ""}</p>
            <Link className="maviri-feature__button" href={`/anime/${lead.id}`}>EXPLORE THE ANIME <span>&#8599;</span></Link>
          </div>
          <span className="maviri-feature__counter">01 <i /> 09</span>
        </div>
        <div className="maviri-feature__aside"><span>01 / TRENDING SELECTION</span><p>A pulse check on what the anime community is watching right now.</p><Link href="/discover">SEE THE FULL CATALOGUE &#8599;</Link></div>
      </section> : null}
      <section className="maviri-trending" aria-labelledby="maviri-trending-title">
        <div className="maviri-section-heading"><div><span className="maviri-section-heading__eyebrow">FRESH FROM THE COMMUNITY</span><h2 id="maviri-trending-title">On the <em>radar.</em></h2></div><Link href="/discover">EXPLORE ALL <span>&#8599;</span></Link></div>
        {anime.length > 1 ? <div className="maviri-anime-grid maviri-anime-grid--home">{anime.slice(1).map((item, index) => <AnimeCard key={item.id} anime={item} index={index + 1} />)}</div> : <div className="maviri-feedback">AniList returned no trending titles.</div>}
      </section>
    </>
  );
}

function CatalogueError({ message }: { message: string }) {
  return <section className="maviri-catalogue-error" role="status"><span>CATALOGUE CONNECTION</span><p>{message}</p><Link href="/discover">Open discovery &#8599;</Link></section>;
}

function HomeCatalogueLoading() {
  return <section className="maviri-catalogue-pending" role="status" aria-live="polite"><span>ANILIST / LIVE CATALOGUE</span><p>Connecting to trending anime…</p></section>;
}
