import Link from "next/link";
import { LibraryStatsSceneLoader } from "@/components/library-stats-scene-loader";
import { SiteShell } from "@/components/site-shell";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  WATCHING: "Watching",
  COMPLETED: "Completed",
  PLANNING: "Plan to watch",
  PAUSED: "Paused",
  DROPPED: "Dropped",
};
const statusKeys = ["WATCHING", "COMPLETED", "PLANNING", "PAUSED", "DROPPED"] as const;

export default async function LibraryStatsPage() {
  if (!isBackendConfigured()) return <StatsNotice title="Connect your library." body="Configure the local backend to build statistics from your own tracked titles." />;
  const session = await getCurrentSession();
  if (!session) return <StatsNotice title="Your story, in numbers." body="Sign in to see statistics from your personal anime collection." action="SIGN IN OR CREATE AN ACCOUNT" href="/sign-in" />;

  const groups = await getPrismaClient().animeListEntry.groupBy({
    by: ["status"] as const,
    where: { userId: session.user.id },
    _count: { _all: true },
    _sum: { episodesWatched: true, rewatchCount: true },
    _avg: { personalScore: true },
  }).catch(() => null);
  if (!groups) {
    return <StatsNotice title="Statistics are unavailable." body="The database could not load your collection. Please retry in a moment." />;
  }

  const byStatus = new Map(groups.map((group) => [group.status, group]));
  const points = statusKeys.map((key) => ({ key, label: statusLabels[key], value: byStatus.get(key)?._count._all ?? 0 }));
  const totalTitles = groups.reduce((total, group) => total + group._count._all, 0);
  const totalEpisodes = groups.reduce((total, group) => total + (group._sum.episodesWatched ?? 0), 0);
  const completed = byStatus.get("COMPLETED")?._count._all ?? 0;
  const rewatches = groups.reduce((total, group) => total + (group._sum.rewatchCount ?? 0), 0);
  const scores = groups.flatMap((group) => group._avg.personalScore === null ? [] : [{ average: group._avg.personalScore, count: group._count._all }]);
  const ratingCount = scores.reduce((total, score) => total + score.count, 0);
  const averageScore = ratingCount ? scores.reduce((total, score) => total + score.average * score.count, 0) / ratingCount : null;

  return (
    <SiteShell active="library">
      <section className="maviri-library-intro maviri-stats-intro">
        <div className="maviri-kicker"><span>YOUR COLLECTION /</span> PERSONAL SIGNALS</div>
        <h1>Stories, <em>counted.</em></h1>
        <p>Every number comes from your saved titles and progress. Your collection stays private.</p>
        <Link className="maviri-text-link" href="/library">BACK TO YOUR LIBRARY <span aria-hidden="true">↗</span></Link>
      </section>
      <section className="maviri-library-stats maviri-stats-overview" aria-label="Personal anime statistics">
        <div><span>TRACKED TITLES</span><b>{totalTitles}</b></div>
        <div><span>EPISODES WATCHED</span><b>{totalEpisodes}</b></div>
        <div><span>COMPLETED</span><b>{completed}</b></div>
        <div><span>REWATCHES</span><b>{rewatches}</b></div>
        <div><span>MEAN PERSONAL SCORE</span><b>{averageScore === null ? "—" : averageScore.toFixed(1)}</b></div>
      </section>
      <section className="maviri-stats-experience" aria-labelledby="maviri-stats-chart-title">
        <div className="maviri-stats-experience__heading"><span>01 / WATCHING RHYTHM</span><h2 id="maviri-stats-chart-title">Your collection, <em>in orbit.</em></h2><p>Each pillar represents a status in your library. Turn the scene to explore the distribution.</p></div>
        {totalTitles ? <LibraryStatsSceneLoader points={points} /> : <div className="maviri-empty-state maviri-stats-empty"><span>NO TRACKING DATA YET</span><h2>Start with one story.</h2><p>Add anime to your library and this view will grow from your own activity.</p><Link className="maviri-text-link" href="/discover">FIND ANIME TO TRACK <span aria-hidden="true">↗</span></Link></div>}
        {totalTitles > 0 && <dl className="maviri-stats-legend">{points.map((point) => <div key={point.key}><dt>{point.label}</dt><dd>{point.value}</dd></div>)}</dl>}
      </section>
    </SiteShell>
  );
}

function StatsNotice({ title, body, action, href }: { title: string; body: string; action?: string; href?: string }) {
  return <SiteShell active="library"><div className="maviri-empty-state"><span>PERSONAL STATISTICS</span><h1>{title}</h1><p>{body}</p>{action && href && <Link className="maviri-submit-link" href={href}>{action} ↗</Link>}</div></SiteShell>;
}
