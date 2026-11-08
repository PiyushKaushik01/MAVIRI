import { NextRequest, NextResponse } from "next/server";
import { getAnimeById } from "@/lib/anilist";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: value } = await context.params;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ error: "Anime ID must be a positive integer." }, { status: 400 });
  }

  try {
    const anime = await getAnimeById(id);
    return anime
      ? NextResponse.json({ anime })
      : NextResponse.json({ error: "Anime was not found." }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Anime catalogue is temporarily unavailable.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
