"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type AnimeCustomListOption = { id: string; name: string; description: string | null; _count?: { entries: number } };

export function CustomListManager({ initialLists }: { initialLists: AnimeCustomListOption[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const router = useRouter();

  async function createList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/library/lists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: description || null }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "List could not be created.");
      setName(""); setDescription(""); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "List could not be created."); }
  }

  async function removeList(id: string) {
    setBusyId(id); setError("");
    try {
      const response = await fetch(`/api/library/lists/${id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "List could not be removed.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "List could not be removed."); }
    finally { setBusyId(""); }
  }

  return <section className="maviri-custom-lists"><div><span>ORGANIZE / YOUR WAY</span><h2>Personal lists.</h2></div><form onSubmit={createList}><label htmlFor="maviri-new-list-name">NEW LIST<input id="maviri-new-list-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={48} required /></label><label htmlFor="maviri-new-list-description">NOTE<input id="maviri-new-list-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={160} /></label><button type="submit">CREATE LIST +</button></form>{initialLists.length > 0 && <ul>{initialLists.map((list) => <li key={list.id}><span><b>{list.name}</b>{list.description && <small>{list.description}</small>}<small>{list._count?.entries ?? 0} titles</small></span><button type="button" onClick={() => removeList(list.id)} disabled={busyId === list.id}>{busyId === list.id ? "…" : "REMOVE"}</button></li>)}</ul>}{error && <p className="maviri-form-error" role="alert">{error}</p>}</section>;
}
