import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const reactionSchema = z.object({ kind: z.enum(["LIKE", "BOOKMARK", "REPOST"]) });
type RouteContext = { params: Promise<{ postId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const { postId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Unknown post action." }, { status: 400 });
  const prisma = getPrismaClient();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const { kind } = parsed.data;
  const unique = { postId_userId: { postId, userId: access.user.id } };
  let active: boolean;

  if (kind === "LIKE") {
    const existing = await prisma.postLike.findUnique({ where: unique, select: { id: true } });
    if (existing) { await prisma.postLike.delete({ where: { id: existing.id } }); active = false; }
    else { await prisma.postLike.create({ data: { postId, userId: access.user.id } }); active = true; }
  } else if (kind === "BOOKMARK") {
    const existing = await prisma.postBookmark.findUnique({ where: unique, select: { id: true } });
    if (existing) { await prisma.postBookmark.delete({ where: { id: existing.id } }); active = false; }
    else { await prisma.postBookmark.create({ data: { postId, userId: access.user.id } }); active = true; }
  } else {
    const existing = await prisma.postRepost.findUnique({ where: unique, select: { id: true } });
    if (existing) { await prisma.postRepost.delete({ where: { id: existing.id } }); active = false; }
    else { await prisma.postRepost.create({ data: { postId, userId: access.user.id } }); active = true; }
  }

  if (active && post.authorId !== access.user.id && kind !== "BOOKMARK") {
    await prisma.notification.create({ data: { recipientId: post.authorId, actorId: access.user.id, kind, entityId: postId } });
  }
  return NextResponse.json({ active });
}
