import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ reportId: string }> };
const decisionSchema = z.object({ status: z.enum(["RESOLVED", "DISMISSED"]), removePost: z.boolean().default(false), note: z.string().max(500).nullable().optional() });

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();
  const moderator = await prisma.user.findUnique({ where: { id: access.user.id }, select: { role: true } });
  if (!moderator || !["ADMIN", "MODERATOR"].includes(moderator.role)) return NextResponse.json({ error: "Moderator access is required." }, { status: 403 });
  const { reportId } = await context.params;
  const parsed = decisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Moderation decision is invalid." }, { status: 400 });
  const report = await prisma.report.findUnique({ where: { id: reportId }, select: { id: true, postId: true } });
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  await prisma.$transaction(async (transaction) => {
    await transaction.report.update({ where: { id: report.id }, data: { status: parsed.data.status, resolvedAt: new Date() } });
    if (parsed.data.removePost) await transaction.post.delete({ where: { id: report.postId } });
    await transaction.moderationAction.create({ data: { userId: access.user.id, action: parsed.data.removePost ? "REMOVE_REPORTED_POST" : parsed.data.status, targetId: report.postId, note: parsed.data.note } });
  });
  return NextResponse.json({ status: parsed.data.status });
}
