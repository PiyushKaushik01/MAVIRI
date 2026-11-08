import Link from "next/link";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteShell } from "@/components/site-shell";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  if (!isBackendConfigured()) return <ProfileSettingsNotice message="Set DATABASE_URL and BETTER_AUTH_SECRET before editing a profile." />;
  const session = await getCurrentSession();
  if (!session) return <SiteShell active="profile"><div className="maviri-empty-state"><span>PROFILE / PRIVATE</span><h2>Sign in to edit your profile.</h2><Link className="maviri-submit-link" href="/sign-in">SIGN IN ↗</Link></div></SiteShell>;
  let profile: { name: string; username: string | null; bio: string | null; image: string | null; bannerUrl: string | null; profileTheme: string; role: string } | null = null;
  let pageError = "";
  try {
    const prisma = getPrismaClient();
    profile = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, username: true, bio: true, image: true, bannerUrl: true, profileTheme: true, role: true } });
  } catch (error) {
    pageError = error instanceof Error ? error.message : "Your profile could not be loaded.";
  }
  if (pageError) return <ProfileSettingsNotice message={pageError} />;
  if (!profile) return <ProfileSettingsNotice message="Your account could not be loaded." />;
  return <SiteShell active="profile"><section className="maviri-profile-settings-intro"><div className="maviri-kicker"><span>05</span> PROFILE / CUSTOMIZE</div><h1>Your <em>corner.</em></h1></section><ProfileSettingsForm profile={profile} />{profile.username && <Link className="maviri-text-link" href={`/profile/${profile.username}`}>VIEW YOUR PROFILE ↗</Link>}{["ADMIN", "MODERATOR"].includes(profile.role) && <Link className="maviri-text-link" href="/moderation">OPEN MODERATION ↗</Link>}<SignOutButton /></SiteShell>;
}

function ProfileSettingsNotice({ message }: { message: string }) {
  return <SiteShell active="profile"><div className="maviri-catalogue-error"><span>PROFILE / CONNECTION</span><p>{message}</p></div></SiteShell>;
}
