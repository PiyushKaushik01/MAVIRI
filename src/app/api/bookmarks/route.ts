import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();
  const bookmarks = await prisma.postBookmark.findMany({
    where: { userId: access.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { post: { include: { author: { select: { id: true, name: true, username: true, image: true } }, _count: { select: { comments: true, likes: true, reposts: true } } } } },
  });
  return NextResponse.json({ bookmarks });
}
