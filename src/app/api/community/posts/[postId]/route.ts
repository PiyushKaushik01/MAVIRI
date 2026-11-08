import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ postId: string }> };
const editSchema = z.object({ content: z.string().trim().min(1).max(1200) });

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const { postId } = await context.params;
  const parsed = editSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Post text must be between 1 and 1,200 characters." }, { status: 400 });
  const prisma = getPrismaClient();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.authorId !== access.user.id) return NextResponse.json({ error: "Only the author can edit this post." }, { status: 403 });
  const updated = await prisma.post.update({ where: { id: postId }, data: { content: parsed.data.content } });
  return NextResponse.json({ post: updated });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const { postId } = await context.params;
  const prisma = getPrismaClient();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.authorId !== access.user.id) return NextResponse.json({ error: "Only the author can delete this post." }, { status: 403 });
  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ deleted: true });
}
