import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusSchema = z.enum(["WATCHING", "COMPLETED", "PLANNING", "PAUSED", "DROPPED"]);
const entrySchema = z.object({
  aniListMediaId: z.number().int().positive(),
  status: statusSchema,
  episodesWatched: z.number().int().min(0).max(10000).default(0),
  rewatchCount: z.number().int().min(0).max(1000).default(0),
  personalScore: z.number().int().min(0).max(100).nullable().optional(),
  startedAt: z.iso.datetime().nullable().optional(),
  completedAt: z.iso.datetime().nullable().optional(),
  personalNotes: z.string().max(500).nullable().optional(),
  customListId: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();

  const requestedStatus = request.nextUrl.searchParams.get("status");
  const status = requestedStatus ? statusSchema.safeParse(requestedStatus) : null;
  if (status && !status.success) return NextResponse.json({ error: "Unknown anime list status." }, { status: 400 });

  const entries = await prisma.animeListEntry.findMany({
    where: { userId: access.user.id, ...(status?.success ? { status: status.data } : {}) },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();

  const body = await request.json().catch(() => null);
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Review the anime entry fields.", details: parsed.error.flatten() }, { status: 400 });
  const value = parsed.data;
  if (value.customListId) {
    const ownedList = await prisma.animeCustomList.findFirst({ where: { id: value.customListId, userId: access.user.id }, select: { id: true } });
    if (!ownedList) return NextResponse.json({ error: "Custom list not found." }, { status: 404 });
  }
  const entry = await prisma.animeListEntry.upsert({
    where: { userId_aniListMediaId: { userId: access.user.id, aniListMediaId: value.aniListMediaId } },
    create: {
      userId: access.user.id,
      aniListMediaId: value.aniListMediaId,
      status: value.status,
      episodesWatched: value.episodesWatched,
      rewatchCount: value.rewatchCount,
      personalScore: value.personalScore,
      startedAt: value.startedAt ? new Date(value.startedAt) : null,
      completedAt: value.completedAt ? new Date(value.completedAt) : null,
      personalNotes: value.personalNotes,
      customListId: value.customListId,
    },
    update: {
      status: value.status,
      episodesWatched: value.episodesWatched,
      rewatchCount: value.rewatchCount,
      personalScore: value.personalScore,
      ...(value.startedAt !== undefined ? { startedAt: value.startedAt ? new Date(value.startedAt) : null } : {}),
      ...(value.completedAt !== undefined ? { completedAt: value.completedAt ? new Date(value.completedAt) : null } : {}),
      personalNotes: value.personalNotes,
      customListId: value.customListId,
    },
  });
  return NextResponse.json({ entry }, { status: 201 });
}
