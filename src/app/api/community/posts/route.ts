import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRankedCommunityPosts } from "@/lib/community-feed";
import { requireApiUser } from "@/lib/api-auth";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(1200),
  kind: z.enum(["TEXT", "DISCUSSION", "REVIEW", "IMAGE", "QUOTE"]).default("TEXT"),
  aniListMediaId: z.number().int().positive().nullable().optional(),
  reviewScore: z.number().int().min(0).max(100).nullable().optional(),
  mediaUrl: z.string().url().refine((value) => value.startsWith("https://")).nullable().optional(),
  mediaAlt: z.string().max(160).nullable().optional(),
  quotedPostId: z.string().nullable().optional(),
}).refine((value) => value.kind !== "REVIEW" || value.reviewScore !== null && value.reviewScore !== undefined, "Reviews need a score.")
  .refine((value) => value.kind !== "IMAGE" || Boolean(value.mediaUrl), "Image posts need a secure image URL.")
  .refine((value) => value.kind !== "QUOTE" || Boolean(value.quotedPostId), "Quote posts need a source post.");

export async function GET(request: NextRequest) {
  if (!isBackendConfigured()) return NextResponse.json({ error: "Community storage is not configured." }, { status: 503 });
  const beforeParam = request.nextUrl.searchParams.get("before");
  let before: { createdAt: Date; id: string } | undefined;
  if (beforeParam) {
    try {
      const cursor = JSON.parse(Buffer.from(beforeParam, "base64url").toString("utf8")) as { createdAt?: string; id?: string };
      const createdAt = new Date(cursor.createdAt ?? "");
      if (!cursor.id || Number.isNaN(createdAt.getTime())) throw new Error("Invalid cursor");
      before = { createdAt, id: cursor.id };
    } catch {
      return NextResponse.json({ error: "Invalid feed cursor." }, { status: 400 });
    }
  }
  const session = await getCurrentSession();
  const feed = await getRankedCommunityPosts({ viewerId: session?.user.id, before, take: 25 });
  return NextResponse.json(feed);
}

export async function POST(request: NextRequest) {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const body = await request.json().catch(() => null);
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Post details are invalid.", details: parsed.error.flatten() }, { status: 400 });

  const prisma = getPrismaClient();
  if (parsed.data.kind === "QUOTE") {
    const source = await prisma.post.findUnique({ where: { id: parsed.data.quotedPostId ?? "" }, select: { id: true } });
    if (!source) return NextResponse.json({ error: "The post you want to quote no longer exists." }, { status: 404 });
  }
  const post = await prisma.post.create({
    data: { authorId: access.user.id, ...parsed.data },
    select: { id: true },
  });
  return NextResponse.json({ post }, { status: 201 });
}
