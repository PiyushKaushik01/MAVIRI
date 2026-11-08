import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { isBackendConfigured } from "@/lib/server-session";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const replySchema = z.object({ content: z.string().trim().min(1).max(800), parentCommentId: z.string().nullable().optional() });
type RouteContext = { params: Promise<{ postId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  if (!isBackendConfigured()) return NextResponse.json({ error: "Community storage is not configured." }, { status: 503 });
  const { postId } = await context.params;
  const prisma = getPrismaClient();
  const replies = await prisma.comment.findMany({
    where: { postId, parentCommentId: null },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: 100,
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      replies: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 30, include: { author: { select: { id: true, name: true, username: true, image: true } } } },
    },
  });
  return NextResponse.json({ replies });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const { postId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Reply text must be between 1 and 800 characters." }, { status: 400 });

  const prisma = getPrismaClient();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  const parent = parsed.data.parentCommentId
    ? await prisma.comment.findFirst({ where: { id: parsed.data.parentCommentId, postId }, select: { authorId: true } })
    : null;
  if (parsed.data.parentCommentId && !parent) return NextResponse.json({ error: "Reply thread not found." }, { status: 404 });

  const reply = await prisma.comment.create({ data: { postId, authorId: access.user.id, content: parsed.data.content, parentCommentId: parsed.data.parentCommentId ?? null } });
  const recipientId = parent?.authorId ?? post.authorId;
  if (recipientId !== access.user.id) await prisma.notification.create({ data: { recipientId, actorId: access.user.id, kind: parent ? "COMMENT_REPLY" : "POST_REPLY", entityId: postId } });
  return NextResponse.json({ reply }, { status: 201 });
}
