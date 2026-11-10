import { fetchFeaturedAnime, fetchTrendingAnime, type AnimeMedia } from "./anilist";
import { getCached, setCached } from "./cache";

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_KEY = "anime:featured:v1";

export type FeaturedPayload = {
  seasonal: AnimeMedia[];
  trending: AnimeMedia[];
  fetchedAt: number;
};

export async function getFeaturedPayload(): Promise<FeaturedPayload> {
  const cached = getCached<FeaturedPayload>(CACHE_KEY);
  if (cached) return cached;

  const [seasonal, trending] = await Promise.all([
    fetchFeaturedAnime(10),
    fetchTrendingAnime(8),
  ]);

  const payload: FeaturedPayload = { seasonal, trending, fetchedAt: Date.now() };
  setCached(CACHE_KEY, payload, CACHE_TTL_MS);
  return payload;
}