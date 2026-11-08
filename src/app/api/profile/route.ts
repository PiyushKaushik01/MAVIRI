import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(24).regex(/^[a-z0-9_]+$/),
  bio: z.string().trim().max(280).nullable(),
  image: z.string().url().refine((value) => value.startsWith("https://")).nullable(),
  bannerUrl: z.string().url().refine((value) => value.startsWith("https://")).nullable(),
  profileTheme: z.enum(["paper", "charcoal", "lilac", "matcha"]),
});

export async function GET() {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: access.user.id }, select: { id: true, name: true, email: true, username: true, bio: true, image: true, bannerUrl: true, profileTheme: true } });
  return NextResponse.json({ profile: user });
}

export async function PATCH(request: NextRequest) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Profile fields are invalid.", details: parsed.error.flatten() }, { status: 400 });
  const prisma = getPrismaClient();
  try {
    const profile = await prisma.user.update({
      where: { id: access.user.id },
      data: parsed.data,
      select: { id: true, name: true, username: true, bio: true, image: true, bannerUrl: true, profileTheme: true },
    });
    return NextResponse.json({ profile });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "That username is already in use." }, { status: 409 });
    }
    throw error;
  }
}
