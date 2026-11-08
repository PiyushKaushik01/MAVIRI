import Link from "next/link";
import { NotificationItem, NotificationList } from "@/components/notification-list";
import { SiteShell } from "@/components/site-shell";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  if (!isBackendConfigured()) return <NotificationNotice message="Set up the database and authentication to receive community notifications." />;
  const session = await getCurrentSession();
  if (!session) return <SiteShell active="notifications"><div className="maviri-empty-state"><span>YOUR ACTIVITY / PRIVATE</span><h2>Sign in to see your notifications.</h2><Link className="maviri-submit-link" href="/sign-in">SIGN IN ↗</Link></div></SiteShell>;
  let items: NotificationItem[] = [];
  let pageError = "";
  try {
    const prisma = getPrismaClient();
    const entries = await prisma.notification.findMany({ where: { recipientId: session.user.id }, orderBy: { createdAt: "desc" }, take: 100, include: { actor: { select: { name: true, username: true, image: true } } } });
    items = entries.map((entry) => ({ ...entry, readAt: entry.readAt?.toISOString() ?? null, createdAt: entry.createdAt.toISOString() }));
  } catch (error) {
    pageError = error instanceof Error ? error.message : "Notifications could not be loaded.";
  }
  if (pageError) return <NotificationNotice message={pageError} />;
  return <SiteShell active="notifications"><section className="maviri-notifications-intro"><div className="maviri-kicker"><span>06</span> YOUR COMMUNITY / ACTIVITY</div><h1>Keep <em>in touch.</em></h1><p>Follows and conversations around your posts.</p></section><NotificationList items={items} /></SiteShell>;
}

function NotificationNotice({ message }: { message: string }) {
  return <SiteShell active="notifications"><div className="maviri-catalogue-error"><span>NOTIFICATIONS / CONNECTION</span><p>{message}</p></div></SiteShell>;
}
