import { AnimeVibePicker } from "@/components/features/home/anime-vibe-picker";
import { getFeaturedPayload } from "@/lib/anime-service";

export async function AnimeVibeSection() {
  const payload = await getFeaturedPayload().catch((error: unknown) => {
    console.error("[AnimeVibeSection] AniList fetch failed:", error);
    return null;
  });

  if (!payload) {
    return (
      <section className="mt-20 rounded-2xl border border-border-soft bg-paper-raised p-7 shadow-[var(--shadow-soft)] sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">The anime corner</p>
        <h2 className="mt-3 text-2xl font-bold text-ink">Fresh picks are on the way.</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">AniList is taking a break. Your discovery shelf will be back when the connection returns.</p>
      </section>
    );
  }

  const anime = [...payload.trending, ...payload.seasonal].filter(
    (title, index, all) => all.findIndex((candidate) => candidate.id === title.id) === index
  );

  return <AnimeVibePicker anime={anime} />;
}
