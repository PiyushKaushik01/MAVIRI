import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();
  const lists = await prisma.animeCustomList.findMany({ where: { userId: access.user.id }, orderBy: { createdAt: "asc" }, include: { _count: { select: { entries: true } } } });
  return NextResponse.json({ lists });
}

const listSchema = z.object({ name: z.string().trim().min(1).max(48), description: z.string().trim().max(160).nullable().optional() });

export async function POST(request: NextRequest) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const parsed = listSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "List name must be 1–48 characters." }, { status: 400 });
  const prisma = getPrismaClient();
  try {
    const list = await prisma.animeCustomList.create({ data: { userId: access.user.id, name: parsed.data.name, description: parsed.data.description || null } });
    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "You already have a list with that name." }, { status: 409 });
    throw error;
  }
}
