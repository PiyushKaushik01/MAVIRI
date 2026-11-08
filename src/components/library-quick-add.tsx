"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LibraryQuickAdd({ aniListMediaId, episodes = 0 }: { aniListMediaId: number; episodes?: number }) {
  const [status, setStatus] = useState("WATCHING");
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function addToLibrary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aniListMediaId, status, episodesWatched }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not add this title.");
      setMessage("Added to your library.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add this title.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="maviri-quick-add" onSubmit={addToLibrary}>
      <h2>Keep it close.</h2>
      <p>Add this title to your personal library.</p>
      <label htmlFor="maviri-quick-status">WATCH STATUS<select id="maviri-quick-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="WATCHING">Watching</option><option value="PLANNING">Planning to watch</option><option value="COMPLETED">Completed</option><option value="PAUSED">Paused</option><option value="DROPPED">Dropped</option></select></label>
      <label htmlFor="maviri-quick-episodes">EPISODES WATCHED<input id="maviri-quick-episodes" type="number" min="0" max={episodes || 10000} value={episodesWatched} onChange={(event) => setEpisodesWatched(Number(event.target.value))} /></label>
      <button className="maviri-submit-button" type="submit" disabled={isSaving}>{isSaving ? "SAVING…" : "ADD TO MY LIBRARY ↗"}</button>
      {message && <p className="maviri-inline-feedback" role="status">{message}</p>}
    </form>
  );
}
