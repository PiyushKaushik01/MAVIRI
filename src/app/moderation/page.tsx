import Link from "next/link";
import { ModerationQueue } from "@/components/moderation-queue";
import { SiteShell } from "@/components/site-shell";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  if (!isBackendConfigured()) return <ModerationNotice message="Moderation tools need a configured database." />;
  const session = await getCurrentSession();
  if (!session) return <SiteShell active="account"><div className="maviri-empty-state"><h2>Sign in to continue.</h2><Link className="maviri-submit-link" href="/sign-in">SIGN IN ↗</Link></div></SiteShell>;
  let items: Array<{ id: string; reason: string; createdAt: string; reporter: { name: string; username: string | null }; post: { id: string; content: string; author: { name: string; username: string | null } } }> = [];
  let pageError = "";
  let denied = false;
  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (!user || !["ADMIN", "MODERATOR"].includes(user.role)) denied = true;
    else {
      const reports = await prisma.report.findMany({
        where: { status: "OPEN" }, orderBy: { createdAt: "asc" }, take: 100,
        include: { reporter: { select: { name: true, username: true } }, post: { include: { author: { select: { name: true, username: true } } } } },
      });
      items = reports.map((report) => ({ ...report, createdAt: report.createdAt.toISOString() }));
    }
  } catch (error) {
    pageError = error instanceof Error ? error.message : "Moderation reports could not be loaded.";
  }
  if (pageError) return <ModerationNotice message={pageError} />;
  if (denied) return <ModerationNotice message="This area is available to moderators only." />;
  return <SiteShell active="account"><section className="maviri-notifications-intro"><div className="maviri-kicker"><span>STAFF / COMMUNITY CARE</span> MODERATION</div><h1>Keep the space <em>good.</em></h1><p>Review reports and take a recorded action on harmful posts.</p></section><ModerationQueue reports={items} /></SiteShell>;
}

function ModerationNotice({ message }: { message: string }) {
  return <SiteShell active="account"><div className="maviri-catalogue-error"><span>MODERATION / ACCESS</span><p>{message}</p></div></SiteShell>;
}
