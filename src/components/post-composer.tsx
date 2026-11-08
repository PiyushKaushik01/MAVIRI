"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PostComposer() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const rawAnimeId = String(data.get("aniListMediaId") ?? "").trim();
    const rawScore = String(data.get("reviewScore") ?? "").trim();
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: String(data.get("content") ?? ""), kind: data.get("kind"),
          aniListMediaId: rawAnimeId ? Number(rawAnimeId) : null,
          reviewScore: rawScore ? Number(rawScore) : null,
          mediaUrl: String(data.get("mediaUrl") ?? "").trim() || null,
          mediaAlt: String(data.get("mediaAlt") ?? "").trim() || null,
          quotedPostId: String(data.get("quotedPostId") ?? "").trim() || null,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Your post could not be published.");
      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your post could not be published.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="maviri-post-composer" onSubmit={submitPost}>
      <label className="maviri-post-composer__label" htmlFor="maviri-post-content">START A CONVERSATION</label>
      <textarea id="maviri-post-content" name="content" maxLength={1200} minLength={1} required />
      <div className="maviri-post-composer__controls">
        <label htmlFor="maviri-post-kind">POST TYPE<select id="maviri-post-kind" name="kind"><option value="TEXT">Thought</option><option value="DISCUSSION">Discussion</option><option value="IMAGE">Image link</option><option value="REVIEW">Review</option><option value="QUOTE">Quote post</option></select></label>
        <label htmlFor="maviri-post-anime">ANILIST ID <input id="maviri-post-anime" name="aniListMediaId" type="number" min="1" /></label>
        <label htmlFor="maviri-post-score">REVIEW SCORE <input id="maviri-post-score" name="reviewScore" type="number" min="0" max="100" /></label>
        <label htmlFor="maviri-post-media">IMAGE URL <input id="maviri-post-media" name="mediaUrl" type="url" /></label>
        <label htmlFor="maviri-post-media-alt">IMAGE DESCRIPTION <input id="maviri-post-media-alt" name="mediaAlt" type="text" maxLength={160} /></label>
        <label htmlFor="maviri-post-quote">QUOTE POST ID <input id="maviri-post-quote" name="quotedPostId" type="text" /></label>
        <button className="maviri-submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "PUBLISHING…" : "PUBLISH ↗"}</button>
      </div>
      {error && <p className="maviri-form-error" role="alert">{error}</p>}
    </form>
  );
}
