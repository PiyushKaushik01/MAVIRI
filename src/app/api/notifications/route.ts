import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();
  const notifications = await prisma.notification.findMany({
    where: { recipientId: access.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, username: true, image: true } } },
  });
  return NextResponse.json({ notifications });
}

const readSchema = z.object({ notificationId: z.string().optional(), all: z.boolean().optional() }).refine((value) => value.all || value.notificationId);

export async function PATCH(request: NextRequest) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const parsed = readSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a notification to mark as read." }, { status: 400 });
  const prisma = getPrismaClient();
  const where = { recipientId: access.user.id, readAt: null, ...(parsed.data.notificationId ? { id: parsed.data.notificationId } : {}) };
  const result = await prisma.notification.updateMany({ where, data: { readAt: new Date() } });
  return NextResponse.json({ updated: result.count });
}
