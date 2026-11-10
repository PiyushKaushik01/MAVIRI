import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function cleanImageUrl(value: unknown) {
  const cleaned = cleanText(value, 500);
  if (!cleaned) return null;
  try {
    const url = new URL(cleaned);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to edit your profile." }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Profile details must be valid JSON." }, { status: 400 });
  }

  if (!input || typeof input !== "object") {
    return NextResponse.json({ error: "Profile details are missing." }, { status: 400 });
  }

  const values = input as Record<string, unknown>;
  const displayName = cleanText(values.displayName, 40);
  const bio = cleanText(values.bio, 220);
  const avatarUrl = cleanImageUrl(values.avatarUrl);
  const bannerUrl = cleanImageUrl(values.bannerUrl);

  if (values.avatarUrl && !avatarUrl) {
    return NextResponse.json({ error: "Avatar links must use HTTPS." }, { status: 400 });
  }
  if (values.bannerUrl && !bannerUrl) {
    return NextResponse.json({ error: "Banner links must use HTTPS." }, { status: 400 });
  }

  const profile = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(displayName ? { name: displayName } : {}),
      profile: {
        upsert: {
          create: { displayName, bio, avatarUrl, bannerUrl },
          update: { displayName, bio, avatarUrl, bannerUrl },
        },
      },
    },
    select: {
      profile: {
        select: { displayName: true, bio: true, avatarUrl: true, bannerUrl: true },
      },
    },
  });

  return NextResponse.json({ profile: profile.profile });
}
