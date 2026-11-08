import { NextRequest, NextResponse } from "next/server";
import { getTrendingAnime, searchAnime } from "@/lib/anilist";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim();
    if (search && search.length < 2) {
      return NextResponse.json({ error: "Enter at least two characters to search." }, { status: 400 });
    }
    const anime = search ? await searchAnime(search.slice(0, 80)) : await getTrendingAnime();
    return NextResponse.json({ anime });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Anime catalogue is temporarily unavailable.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
