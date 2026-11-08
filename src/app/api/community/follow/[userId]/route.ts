import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ userId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const { userId } = await context.params;
  if (userId === access.user.id) return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
  const prisma = getPrismaClient();
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const where = { followerId_followingId: { followerId: access.user.id, followingId: userId } };
  const existing = await prisma.follow.findUnique({ where, select: { id: true } });
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }
  await prisma.follow.create({ data: { followerId: access.user.id, followingId: userId } });
  await prisma.notification.create({ data: { recipientId: userId, actorId: access.user.id, kind: "FOLLOW", entityId: access.user.id } });
  return NextResponse.json({ following: true }, { status: 201 });
}
