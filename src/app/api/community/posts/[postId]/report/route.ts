import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const reportSchema = z.object({ reason: z.string().trim().min(3).max(500) });
type RouteContext = { params: Promise<{ postId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const { postId } = await context.params;
  const parsed = reportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Add a short reason for this report." }, { status: 400 });
  const prisma = getPrismaClient();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  await prisma.report.upsert({
    where: { reporterId_postId: { reporterId: access.user.id, postId } },
    create: { reporterId: access.user.id, postId, reason: parsed.data.reason },
    update: { reason: parsed.data.reason, status: "OPEN", resolvedAt: null },
  });
  return NextResponse.json({ reported: true }, { status: 201 });
}
