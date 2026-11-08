import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ listId: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const { listId } = await context.params;
  const prisma = getPrismaClient();
  const deleted = await prisma.animeCustomList.deleteMany({ where: { id: listId, userId: access.user.id } });
  return deleted.count ? NextResponse.json({ deleted: true }) : NextResponse.json({ error: "Custom list not found." }, { status: 404 });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const { listId } = await context.params;
  const parsed = z.object({ name: z.string().trim().min(1).max(48), description: z.string().trim().max(160).nullable().optional() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "List details are invalid." }, { status: 400 });
  const prisma = getPrismaClient();
  try {
    const existing = await prisma.animeCustomList.findFirst({ where: { id: listId, userId: access.user.id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Custom list not found." }, { status: 404 });
    const list = await prisma.animeCustomList.update({ where: { id: existing.id }, data: { name: parsed.data.name, description: parsed.data.description || null } });
    return NextResponse.json({ list });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "You already have a list with that name." }, { status: 409 });
    throw error;
  }
}
