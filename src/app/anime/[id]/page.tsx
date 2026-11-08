import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteShell } from "@/components/site-shell";
import { LibraryQuickAdd } from "@/components/library-quick-add";
import { animeTitle, getAnimeById, plainDescription } from "@/lib/anilist";

type AnimePageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: AnimePageProps): Promise<Metadata> {
  const { id } = await params;
  let anime;
  try {
    anime = await getAnimeById(Number(id));
  } catch {
    return { title: "Anime catalogue — Maviri" };
  }
  return anime ? { title: `${animeTitle(anime)} — Maviri`, description: plainDescription(anime.description).slice(0, 155) } : { title: "Anime not found — Maviri" };
}

export default async function AnimePage({ params }: AnimePageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  return (
    <SiteShell active="discover">
      <Suspense fallback={<AnimeDetailLoading />}>
        <AnimeDetailContent id={id} />
      </Suspense>
    </SiteShell>
  );
}

async function AnimeDetailContent({ id }: { id: number }) {
  const anime = await getAnimeById(id);
  if (!anime) notFound();
  const title = animeTitle(anime);
  const description = plainDescription(anime.description);

  return (
    <article className="maviri-anime-detail">
        <Link className="maviri-back-link" href="/discover">← BACK TO DISCOVERY</Link>
        {anime.bannerImage ? <div className="maviri-detail-banner">
          {/* AniList image URLs are returned at runtime and are not known to Next's image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={anime.bannerImage} alt="" />
          <span>ANILIST CATALOGUE / {anime.id}</span>
        </div> : <div className="maviri-detail-banner maviri-detail-banner--empty"><span>ANILIST CATALOGUE / {anime.id}</span></div>}
        <div className="maviri-detail-main">
          <div className="maviri-detail-cover">
            {anime.coverImage.extraLarge ? <Image src={anime.coverImage.extraLarge} alt={`${title} cover artwork`} width={360} height={520} unoptimized priority /> : <div className="maviri-detail-cover__fallback">M</div>}
          </div>
          <div className="maviri-detail-copy">
            <div className="maviri-kicker"><span>ANIME / {anime.id}</span> {anime.status?.replaceAll("_", " ") ?? "CATALOGUE ENTRY"}</div>
            <h1>{title}</h1>
            {anime.title.native && <p className="maviri-detail-native">{anime.title.native}</p>}
            <div className="maviri-detail-stats"><span><b>{anime.averageScore ?? "—"}</b> SCORE</span><span><b>{anime.episodes ?? "—"}</b> EPISODES</span><span><b>{anime.format?.replaceAll("_", " ") ?? "—"}</b> FORMAT</span><span><b>{anime.seasonYear ?? "—"}</b> YEAR</span></div>
            <div className="maviri-detail-genres">{anime.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
            <h2>About this story</h2>
            <p className="maviri-detail-description">{description || "No synopsis is available for this title."}</p>
            {anime.studios?.nodes.length ? <div className="maviri-detail-studios"><span>STUDIO</span><p>{anime.studios.nodes.map((studio) => studio.name).join(" · ")}</p></div> : null}
            <a className="maviri-text-link" href={anime.siteUrl} target="_blank" rel="noreferrer">VIEW ANILIST ENTRY <span aria-hidden="true">↗</span></a>
            <LibraryQuickAdd aniListMediaId={anime.id} episodes={anime.episodes ?? 0} />
          </div>
        </div>
        {anime.characters?.nodes.length ? <section className="maviri-characters"><div className="maviri-section-heading"><div><span className="maviri-section-heading__eyebrow">PEOPLE IN THIS WORLD</span><h2>Characters.</h2></div></div><div className="maviri-character-list">{anime.characters.nodes.map((character) => <div className="maviri-character" key={character.name.full}>{character.image.large && <Image src={character.image.large} alt="" width={72} height={72} unoptimized />}<span>{character.name.full}</span></div>)}</div></section> : null}
        {anime.relations?.edges.length ? <section className="maviri-relations"><div className="maviri-section-heading"><div><span className="maviri-section-heading__eyebrow">KEEP EXPLORING</span><h2>Connected <em>stories.</em></h2></div></div><div className="maviri-related-list">{anime.relations.edges.filter((edge) => edge.node.id !== anime.id).slice(0, 8).map((edge) => <Link href={`/anime/${edge.node.id}`} key={`${edge.relationType}-${edge.node.id}`}><span>{edge.relationType.replaceAll("_", " ")}</span><strong>{animeTitle(edge.node)}</strong><span>↗</span></Link>)}</div></section> : null}
    </article>
  );
}

function AnimeDetailLoading() {
  return (
    <section className="maviri-catalogue-pending" role="status" aria-live="polite">
      <span>ANILIST / STORY DETAILS</span>
      <p>Loading this anime entry…</p>
    </section>
  );
}
