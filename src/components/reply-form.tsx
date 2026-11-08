"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ReplyForm({ postId, parentCommentId }: { postId: string; parentCommentId?: string }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const content = String(new FormData(form).get("content") ?? "");
    try {
      const response = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentCommentId: parentCommentId ?? null }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Your reply could not be published.");
      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your reply could not be published.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <form className="maviri-reply-form" onSubmit={submitReply}><label className="maviri-visually-hidden" htmlFor={`maviri-reply-${postId}-${parentCommentId ?? "root"}`}>Write a reply</label><textarea id={`maviri-reply-${postId}-${parentCommentId ?? "root"}`} name="content" maxLength={800} required /><button type="submit" disabled={isSubmitting}>{isSubmitting ? "SENDING…" : "REPLY ↗"}</button>{error && <p className="maviri-form-error" role="alert">{error}</p>}</form>;
}
