import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["WATCHING", "COMPLETED", "PLANNING", "PAUSED", "DROPPED"]).optional(),
  episodesWatched: z.number().int().min(0).max(10000).optional(),
  rewatchCount: z.number().int().min(0).max(1000).optional(),
  personalScore: z.number().int().min(0).max(100).nullable().optional(),
  startedAt: z.iso.datetime().nullable().optional().transform((value) => value ? new Date(value) : value),
  completedAt: z.iso.datetime().nullable().optional().transform((value) => value ? new Date(value) : value),
  personalNotes: z.string().max(500).nullable().optional(),
  customListId: z.string().nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, "Include at least one field to update.");

type RouteContext = { params: Promise<{ entryId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();
  const { entryId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Review the anime entry fields." }, { status: 400 });

  const existing = await prisma.animeListEntry.findFirst({ where: { id: entryId, userId: access.user.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Library entry not found." }, { status: 404 });
  if (parsed.data.customListId) {
    const ownedList = await prisma.animeCustomList.findFirst({ where: { id: parsed.data.customListId, userId: access.user.id }, select: { id: true } });
    if (!ownedList) return NextResponse.json({ error: "Custom list not found." }, { status: 404 });
  }
  const entry = await prisma.animeListEntry.update({ where: { id: existing.id }, data: parsed.data });
  return NextResponse.json({ entry });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();
  const { entryId } = await context.params;
  const deleted = await prisma.animeListEntry.deleteMany({ where: { id: entryId, userId: access.user.id } });
  return deleted.count ? NextResponse.json({ deleted: true }) : NextResponse.json({ error: "Library entry not found." }, { status: 404 });
}
