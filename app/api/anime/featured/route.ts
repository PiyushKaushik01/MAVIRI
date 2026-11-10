import { NextResponse } from "next/server";
import { getFeaturedPayload } from "@/lib/anime-service";

export async function GET() {
  try {
    const payload = await getFeaturedPayload();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/anime/featured] failed:", error);
    return NextResponse.json(
      { error: "Unable to load featured anime right now." },
      { status: 502 }
    );
  }
}