import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ username: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isBackendConfigured()) return NextResponse.json({ error: "Profiles are not configured." }, { status: 503 });
  const { username } = await context.params;
  const prisma = getPrismaClient();
  const profile = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true, name: true, username: true, bio: true, image: true, bannerUrl: true, profileTheme: true, createdAt: true,
      posts: { orderBy: { createdAt: "desc" }, take: 20, include: { _count: { select: { comments: true, likes: true, reposts: true } } } },
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
  return profile ? NextResponse.json({ profile }) : NextResponse.json({ error: "Profile not found." }, { status: 404 });
}
