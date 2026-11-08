"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Anime, animeTitle } from "@/lib/anilist";
import { AnimeCustomListOption } from "@/components/custom-list-manager";

type LibraryEntry = {
  id: string;
  aniListMediaId: number;
  status: string;
  episodesWatched: number;
  personalScore: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  personalNotes: string | null;
  rewatchCount: number;
  customListId: string | null;
};

export function LibraryEntryCard({ entry, anime, customLists }: { entry: LibraryEntry; anime?: Anime; customLists: AnimeCustomListOption[] }) {
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const payload = {
      status: String(data.get("status")),
      episodesWatched: Number(data.get("episodesWatched")),
      rewatchCount: Number(data.get("rewatchCount")),
      personalScore: data.get("personalScore") ? Number(data.get("personalScore")) : null,
      startedAt: data.get("startedAt") ? new Date(`${data.get("startedAt")}T00:00:00.000Z`).toISOString() : null,
      completedAt: data.get("completedAt") ? new Date(`${data.get("completedAt")}T00:00:00.000Z`).toISOString() : null,
      personalNotes: String(data.get("personalNotes") ?? "").trim() || null,
      customListId: String(data.get("customListId") ?? "") || null,
    };
    try {
      const response = await fetch(`/api/library/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update this entry.");
      setMessage("Saved to your library.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update this entry.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeEntry() {
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/library/${entry.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not remove this entry.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove this entry.");
    } finally {
      setIsSaving(false);
    }
  }

  const title = anime ? animeTitle(anime) : `AniList catalogue entry ${entry.aniListMediaId}`;
  return (
    <article className="maviri-library-entry">
      <Link className="maviri-library-entry__cover" href={`/anime/${entry.aniListMediaId}`} aria-label={`Open ${title}`}>
        {anime?.coverImage.large ? <Image src={anime.coverImage.large} alt="" width={240} height={320} unoptimized loading="lazy" /> : <span>#{entry.aniListMediaId}</span>}
      </Link>
      <div className="maviri-library-entry__main">
        <div className="maviri-library-entry__heading"><div><span>{anime?.format?.replaceAll("_", " ") ?? "ANIME"}</span><h2><Link href={`/anime/${entry.aniListMediaId}`}>{title}</Link></h2></div><span>{anime?.episodes ? `${entry.episodesWatched} / ${anime.episodes} EPS` : `${entry.episodesWatched} EPS`}</span></div>
        <form className="maviri-library-entry__form" onSubmit={saveEntry}>
          <label htmlFor={`maviri-status-${entry.id}`}>STATUS<select id={`maviri-status-${entry.id}`} name="status" defaultValue={entry.status}><option value="WATCHING">Watching</option><option value="COMPLETED">Completed</option><option value="PLANNING">Planning</option><option value="PAUSED">Paused</option><option value="DROPPED">Dropped</option></select></label>
          <label htmlFor={`maviri-progress-${entry.id}`}>EPISODES<input id={`maviri-progress-${entry.id}`} name="episodesWatched" type="number" min="0" max={anime?.episodes ?? 10000} defaultValue={entry.episodesWatched} /></label>
          <label htmlFor={`maviri-score-${entry.id}`}>YOUR SCORE<input id={`maviri-score-${entry.id}`} name="personalScore" type="number" min="0" max="100" defaultValue={entry.personalScore ?? ""} /></label>
          <label htmlFor={`maviri-started-${entry.id}`}>STARTED<input id={`maviri-started-${entry.id}`} name="startedAt" type="date" defaultValue={entry.startedAt?.toISOString().slice(0, 10) ?? ""} /></label>
          <label htmlFor={`maviri-completed-${entry.id}`}>FINISHED<input id={`maviri-completed-${entry.id}`} name="completedAt" type="date" defaultValue={entry.completedAt?.toISOString().slice(0, 10) ?? ""} /></label>
          <label htmlFor={`maviri-rewatch-${entry.id}`}>REWATCHES<input id={`maviri-rewatch-${entry.id}`} name="rewatchCount" type="number" min="0" max="1000" defaultValue={entry.rewatchCount} /></label>
          <label htmlFor={`maviri-list-${entry.id}`}>CUSTOM LIST<select id={`maviri-list-${entry.id}`} name="customListId" defaultValue={entry.customListId ?? ""}><option value="">No custom list</option>{customLists.map((list) => <option value={list.id} key={list.id}>{list.name}</option>)}</select></label>
          <button className="maviri-entry-save" type="submit" disabled={isSaving}>{isSaving ? "SAVING…" : "SAVE"}</button>
          <button className="maviri-entry-remove" type="button" onClick={removeEntry} disabled={isSaving}>REMOVE</button>
          <label className="maviri-library-entry__notes" htmlFor={`maviri-notes-${entry.id}`}>PERSONAL NOTES<textarea id={`maviri-notes-${entry.id}`} name="personalNotes" maxLength={500} defaultValue={entry.personalNotes ?? ""} /></label>
        </form>
        {message && <p className="maviri-inline-feedback" role="status">{message}</p>}
      </div>
    </article>
  );
}
