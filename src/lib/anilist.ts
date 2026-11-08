import { cache } from "react";

export type AnimeTitle = {
  romaji: string | null;
  english: string | null;
  native: string | null;
};

export type Anime = {
  id: number;
  title: AnimeTitle;
  description: string | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  genres: string[];
  coverImage: { extraLarge: string | null; large: string | null; color: string | null };
  bannerImage: string | null;
  siteUrl: string;
  studios?: { nodes: Array<{ name: string }> };
  characters?: { nodes: Array<{ name: { full: string }; image: { large: string | null } }> };
  relations?: { edges: Array<{ relationType: string; node: Anime }> };
};

type AniListResponse<T> = { data?: T; errors?: Array<{ message: string }> };

const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const MEMORY_CACHE_LIMIT = 160;
const STALE_CACHE_WINDOW_MS = 15 * 60 * 1000;

type CachedResponse = { value: unknown; expiresAt: number; staleUntil: number; retryAfter: number };
type AniListRequestState = {
  cache: Map<string, CachedResponse>;
  inflight: Map<string, Promise<unknown>>;
  queue: Promise<void>;
  nextRequestAt: number;
  blockedUntil: number;
  minimumInterval: number;
};

const globalForAniList = globalThis as typeof globalThis & { maviriAniListState?: AniListRequestState };
const requestState = globalForAniList.maviriAniListState ??= {
  cache: new Map<string, CachedResponse>(),
  inflight: new Map<string, Promise<unknown>>(),
  queue: Promise.resolve(),
  nextRequestAt: 0,
  blockedUntil: 0,
  minimumInterval: 650,
};

class AniListRateLimitError extends Error {
  constructor(readonly retryInSeconds: number) {
    super(`AniList is busy. Try again in about ${retryInSeconds} seconds.`);
    this.name = "AniListRateLimitError";
  }
}

function readRateLimitDelay(response: Response) {
  const retryAfter = response.headers.get("Retry-After");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(1000, seconds * 1000);
    const date = Date.parse(retryAfter);
    if (Number.isFinite(date)) return Math.max(1000, date - Date.now());
  }

  const reset = Number(response.headers.get("X-RateLimit-Reset"));
  if (Number.isFinite(reset) && reset > 0) {
    const resetAt = reset > 1_000_000_000_000 ? reset : reset > 1_000_000_000 ? reset * 1000 : Date.now() + reset * 1000;
    return Math.max(1000, resetAt - Date.now());
  }
  return 60_000;
}

async function reserveRequestSlot() {
  const scheduled = requestState.queue.then(async () => {
    const now = Date.now();
    if (requestState.blockedUntil > now) throw new AniListRateLimitError(Math.ceil((requestState.blockedUntil - now) / 1000));
    const waitFor = Math.max(0, requestState.nextRequestAt - now);
    if (waitFor) await new Promise((resolve) => setTimeout(resolve, waitFor));
    const dispatchAt = Date.now();
    if (requestState.blockedUntil > dispatchAt) throw new AniListRateLimitError(Math.ceil((requestState.blockedUntil - dispatchAt) / 1000));
    requestState.nextRequestAt = dispatchAt + requestState.minimumInterval;
  });
  requestState.queue = scheduled.then(() => undefined, () => undefined);
  await scheduled;
}

const animeFields = `
  id
  title { romaji english native }
  description(asHtml: false)
  format
  status
  episodes
  season
  seasonYear
  averageScore
  genres
  coverImage { extraLarge large color }
  bannerImage
  siteUrl
`;

async function queryAniList<T>(query: string, variables: Record<string, unknown> = {}, revalidateSeconds = 60): Promise<T> {
  const key = JSON.stringify([query, variables]);
  const now = Date.now();
  const cached = requestState.cache.get(key) as CachedResponse | undefined;
  if (cached && cached.expiresAt > now) return cached.value as T;

  if (cached && cached.staleUntil > now) {
    if (cached.retryAfter <= now && !requestState.inflight.has(key)) {
      void startRequest<T>(key, query, variables, revalidateSeconds).catch(() => undefined);
    }
    return cached.value as T;
  }

  return startRequest<T>(key, query, variables, revalidateSeconds);
}

function startRequest<T>(key: string, query: string, variables: Record<string, unknown>, revalidateSeconds: number) {
  const existing = requestState.inflight.get(key);
  if (existing) return existing as Promise<T>;

  const request = (async () => {
    const previous = requestState.cache.get(key);
    try {
      await reserveRequestSlot();
      const response = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query, variables }),
        cache: "force-cache",
        next: { revalidate: revalidateSeconds },
        signal: AbortSignal.timeout(12_000),
      });

      const remaining = Number(response.headers.get("X-RateLimit-Remaining"));
      const limit = Number(response.headers.get("X-RateLimit-Limit"));
      if (Number.isFinite(limit) && limit > 0) requestState.minimumInterval = Math.max(650, Math.ceil(60_000 / limit));
      if (Number.isFinite(remaining) && remaining <= 0) requestState.blockedUntil = Math.max(requestState.blockedUntil, Date.now() + readRateLimitDelay(response));
      if (response.status === 429) {
        const delay = readRateLimitDelay(response);
        requestState.blockedUntil = Math.max(requestState.blockedUntil, Date.now() + delay);
        throw new AniListRateLimitError(Math.ceil(delay / 1000));
      }
      if (!response.ok) throw new Error(`AniList request failed (${response.status}). Please try again shortly.`);

      const payload = (await response.json()) as AniListResponse<T>;
      if (payload.errors?.length || !payload.data) throw new Error(payload.errors?.[0]?.message ?? "AniList returned no data.");

      const fetchedAt = Date.now();
      requestState.cache.delete(key);
      requestState.cache.set(key, { value: payload.data, expiresAt: fetchedAt + revalidateSeconds * 1000, staleUntil: fetchedAt + revalidateSeconds * 1000 + STALE_CACHE_WINDOW_MS, retryAfter: 0 });
      while (requestState.cache.size > MEMORY_CACHE_LIMIT) requestState.cache.delete(requestState.cache.keys().next().value as string);
      return payload.data;
    } catch (error) {
      if (previous && previous.staleUntil > Date.now()) {
        previous.retryAfter = Math.max(Date.now() + 20_000, requestState.blockedUntil);
        return previous.value as T;
      }
      throw error;
    }
  })();

  requestState.inflight.set(key, request);
  void request.finally(() => {
    if (requestState.inflight.get(key) === request) requestState.inflight.delete(key);
  }).catch(() => undefined);
  return request;
}

export async function getTrendingAnime(perPage = 8): Promise<Anime[]> {
  const data = await queryAniList<{ Page: { media: Anime[] } }>(
    `query MaviriTrending($perPage: Int) {
      Page(perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${animeFields} }
      }
    }`,
    { perPage },
    60,
  );
  return data.Page.media;
}

export async function searchAnime(search: string, perPage = 12): Promise<Anime[]> {
  const data = await queryAniList<{ Page: { media: Anime[] } }>(
    `query MaviriSearch($search: String, $perPage: Int) {
      Page(perPage: $perPage) {
        media(type: ANIME, search: $search, sort: SEARCH_MATCH, isAdult: false) { ${animeFields} }
      }
    }`,
    { search, perPage },
    30,
  );
  return data.Page.media;
}

export async function getAnimeByIds(ids: number[]): Promise<Anime[]> {
  const uniqueIds = [...new Set(ids)].filter((id) => Number.isSafeInteger(id) && id > 0).slice(0, 30);
  if (!uniqueIds.length) return [];
  const data = await queryAniList<{ Page: { media: Anime[] } }>(
    `query MaviriAnimeBatch($ids: [Int], $perPage: Int) {
      Page(perPage: $perPage) {
        media(type: ANIME, id_in: $ids, isAdult: false) { ${animeFields} }
      }
    }`,
    { ids: uniqueIds, perPage: uniqueIds.length },
    120,
  );
  return data.Page.media;
}

export const getAnimeById = cache(async (id: number): Promise<Anime | null> => {
  const data = await queryAniList<{ Media: Anime | null }>(
    `query MaviriAnime($id: Int) {
      Media(id: $id, type: ANIME) {
        ${animeFields}
        studios(isMain: true) { nodes { name } }
        characters(perPage: 6, sort: ROLE) { nodes { name { full } image { large } } }
        relations { edges { relationType(version: 2) node(type: ANIME) { ${animeFields} } } }
      }
    }`,
    { id },
    300,
  );
  return data.Media;
});

export function animeTitle(anime: Anime): string {
  return anime.title.english || anime.title.romaji || anime.title.native || "Untitled anime";
}

export function plainDescription(description: string | null): string {
  return (description ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

