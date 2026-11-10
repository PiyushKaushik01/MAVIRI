const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const USER_AGENT = "Maviri/0.1 (+https://maviri.app)";

export type AnimeMedia = {
  id: number;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    large: string | null;
    extraLarge: string | null;
    color: string | null;
  };
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  episodes: number | null;
  format: string | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number | null;
};

type AniListResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

const MEDIA_FRAGMENT = `
  id
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  description
  genres
  episodes
  format
  status
  season
  seasonYear
  averageScore
  popularity
`;

async function anilistQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AniList ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as AniListResponse<T>;
  if (json.errors?.length) {
    throw new Error(`AniList error: ${json.errors[0].message}`);
  }
  if (!json.data) {
    throw new Error("AniList returned no data");
  }
  return json.data;
}

export function currentSeason(): { season: string; year: number } {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const season =
    month <= 2 ? "WINTER" : month <= 5 ? "SPRING" : month <= 8 ? "SUMMER" : "FALL";
  return { season, year };
}

export async function fetchFeaturedAnime(limit = 10): Promise<AnimeMedia[]> {
  const { season, year } = currentSeason();
  const query = `
    query Featured($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          season: $season
          seasonYear: $seasonYear
          type: ANIME
          sort: POPULARITY_DESC
        ) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, {
    season,
    seasonYear: year,
    perPage: limit,
  });
  return data.Page.media;
}

export async function fetchTrendingAnime(limit = 8): Promise<AnimeMedia[]> {
  const query = `
    query Trending($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, {
    perPage: limit,
  });
  return data.Page.media;
}

export async function searchAnime(query: string, limit = 24): Promise<AnimeMedia[]> {
  const search = query.trim();
  if (!search) return [];

  const queryText = `
    query SearchAnime($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(queryText, {
    search,
    perPage: limit,
  });
  return data.Page.media;
}
