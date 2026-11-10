import { headers } from "next/headers";
import { getFeaturedPayload } from "@/lib/anime-service";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignalRoom } from "@/components/features/home/signal-room";
import type { AnimeMedia } from "@/lib/anilist";

export async function HeroSection() {
  let picks: AnimeMedia[] = [];
  let profileImage: string | null = null;
  try {
    const payload = await getFeaturedPayload();
    picks = [...payload.trending, ...payload.seasonal].filter(
      (anime, index, all) => all.findIndex((candidate) => candidate.id === anime.id) === index
    );
  } catch (error) {
    console.error("[HeroSection] AniList fetch failed:", error);
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { avatarUrl: true },
      });
      profileImage = profile?.avatarUrl ?? session.user.image ?? null;
    }
  } catch (error) {
    console.error("[HeroSection] profile image lookup failed:", error);
  }

  return <SignalRoom anime={picks} profileImage={profileImage} />;
}
