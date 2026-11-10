import { NextResponse } from "next/server";
import { searchAnime } from "@/lib/anilist";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchAnime(query.slice(0, 80));
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[api/anime/search] failed:", error);
    return NextResponse.json(
      { error: "Unable to search anime right now." },
      { status: 502 }
    );
  }
}
