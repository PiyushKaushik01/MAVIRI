import { getFeaturedPayload } from "@/lib/anime-service";
import { AfterCredits } from "@/components/features/home/after-credits";
import type { AnimeMedia } from "@/lib/anilist";

export async function PreviewSections() {
  let anime: AnimeMedia[] = [];

  try {
    const payload = await getFeaturedPayload();
    anime = [...payload.seasonal, ...payload.trending].filter(
      (title, index, all) => all.findIndex((candidate) => candidate.id === title.id) === index
    );
  } catch (error) {
    console.error("[PreviewSections] AniList fetch failed:", error);
  }

  return <AfterCredits anime={anime} />;
}
