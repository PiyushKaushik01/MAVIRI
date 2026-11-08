import Link from "next/link";
import { LibraryEntryCard } from "@/components/library-entry-card";
import { AnimeCustomListOption, CustomListManager } from "@/components/custom-list-manager";
import { SiteShell } from "@/components/site-shell";
import { getAnimeByIds } from "@/lib/anilist";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";

const statuses = ["ALL", "WATCHING", "COMPLETED", "PLANNING", "PAUSED", "DROPPED"] as const;
type LibraryPageProps = { searchParams: Promise<{ status?: string }> };
type LibraryEntry = { id: string; aniListMediaId: number; status: string; episodesWatched: number; rewatchCount: number; personalScore: number | null; startedAt: Date | null; completedAt: Date | null; personalNotes: string | null; customListId: string | null };

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  if (!isBackendConfigured()) return <LibraryUnavailable message="Add DATABASE_URL and BETTER_AUTH_SECRET to connect your library." />;
  const session = await getCurrentSession();
  if (!session) return <LibrarySignIn />;

  const params = await searchParams;
  const selectedStatus = statuses.includes((params.status ?? "ALL").toUpperCase() as typeof statuses[number]) ? (params.status ?? "ALL").toUpperCase() : "ALL";
  let entries: LibraryEntry[] = [];
  let customLists: AnimeCustomListOption[] = [];
  let animeById = new Map<number, Awaited<ReturnType<typeof getAnimeByIds>>[number]>();
  let pageError = "";
  try {
    const prisma = getPrismaClient();
    entries = await prisma.animeListEntry.findMany({
      where: { userId: session.user.id, ...(selectedStatus === "ALL" ? {} : { status: selectedStatus as Exclude<typeof statuses[number], "ALL"> }) },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: 200,
    });
    customLists = await prisma.animeCustomList.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" }, include: { _count: { select: { entries: true } } } });
    const anime = await getAnimeByIds(entries.map((entry) => entry.aniListMediaId));
    animeById = new Map(anime.map((item) => [item.id, item]));
  } catch (error) {
    pageError = error instanceof Error ? error.message : "Your library could not be loaded.";
  }
  if (pageError) return <LibraryUnavailable message={pageError} />;
  const totalEpisodes = entries.reduce((total, entry) => total + entry.episodesWatched, 0);
  const completed = entries.filter((entry) => entry.status === "COMPLETED").length;
  const totalRewatches = entries.reduce((total, entry) => total + entry.rewatchCount, 0);
  return (
    <SiteShell active="library">
      <section className="maviri-library-intro"><div className="maviri-kicker"><span>YOUR COLLECTION /</span> PRIVATE BY DEFAULT</div><h1>My <em>library.</em></h1><p>A living record of the stories you have watched and the ones waiting for you.</p><Link className="maviri-text-link" href="/library/stats">OPEN YOUR STATISTICS <span aria-hidden="true">↗</span></Link></section>
      <section className="maviri-library-stats" aria-label="Library statistics"><div><span>IN THIS VIEW</span><b>{entries.length}</b></div><div><span>EPISODES TRACKED</span><b>{totalEpisodes}</b></div><div><span>COMPLETED</span><b>{completed}</b></div><div><span>REWATCHES</span><b>{totalRewatches}</b></div></section>
      <nav className="maviri-library-filters" aria-label="Filter library">{statuses.map((status) => <Link className={status === selectedStatus ? "is-active" : ""} href={status === "ALL" ? "/library" : `/library?status=${status.toLowerCase()}`} key={status}>{status.replaceAll("_", " ")}</Link>)}</nav>
      <CustomListManager initialLists={customLists} />
      {entries.length ? <div className="maviri-library-list">{entries.map((entry) => <LibraryEntryCard key={entry.id} entry={entry} anime={animeById.get(entry.aniListMediaId)} customLists={customLists} />)}</div> : <div className="maviri-empty-state"><span>NO TITLES HERE YET</span><h2>Your next story is out there.</h2><p>Find a title in discovery and add it to your library.</p><Link className="maviri-text-link" href="/discover">GO TO DISCOVERY ↗</Link></div>}
    </SiteShell>
  );
}

function LibrarySignIn() {
  return <SiteShell active="library"><div className="maviri-empty-state"><span>YOUR COLLECTION / PRIVATE BY DEFAULT</span><h1>Keep your watchlist <em>yours.</em></h1><p>Sign in to create a personal anime library and track episodes as you go.</p><Link className="maviri-submit-link" href="/sign-in">SIGN IN OR CREATE AN ACCOUNT ↗</Link></div></SiteShell>;
}

function LibraryUnavailable({ message }: { message: string }) {
  return <SiteShell active="library"><div className="maviri-catalogue-error"><span>LIBRARY CONNECTION</span><p>{message}</p></div></SiteShell>;
}
