"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimeEmbed } from "@/components/anime-embed";

export type FeedPost = {
  id: string;
  content: string;
  kind: string;
  aniListMediaId: number | null;
  reviewScore: number | null;
  mediaUrl: string | null;
  mediaAlt: string | null;
  quotedPost: { id: string; content: string; author: { name: string; username: string | null } } | null;
  createdAt: string;
  author: { id: string; name: string; username: string | null; image: string | null };
  counts: { comments: number; likes: number; reposts: number };
  likedByViewer: boolean;
  bookmarkedByViewer: boolean;
  viewerCanManage?: boolean;
};

export function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(post.likedByViewer);
  const [bookmarked, setBookmarked] = useState(post.bookmarkedByViewer);
  const [likeCount, setLikeCount] = useState(post.counts.likes);
  const [repostCount, setRepostCount] = useState(post.counts.reposts);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const router = useRouter();

  async function react(kind: "LIKE" | "BOOKMARK" | "REPOST") {
    setMessage("");
    const before = { liked, bookmarked, likeCount, repostCount };
    if (kind === "LIKE") { setLiked(!liked); setLikeCount(likeCount + (liked ? -1 : 1)); }
    if (kind === "BOOKMARK") setBookmarked(!bookmarked);
    if (kind === "REPOST") setRepostCount(repostCount + 1);
    try {
      const response = await fetch(`/api/community/posts/${post.id}/reaction`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
      const result = await response.json() as { active?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Sign in to react to this post.");
      if (kind === "LIKE") { setLiked(Boolean(result.active)); setLikeCount(before.likeCount + (result.active ? 1 : -1)); }
      if (kind === "BOOKMARK") setBookmarked(Boolean(result.active));
      if (kind === "REPOST") setRepostCount(before.repostCount + (result.active ? 1 : -1));
    } catch (error) {
      setLiked(before.liked); setBookmarked(before.bookmarked); setLikeCount(before.likeCount); setRepostCount(before.repostCount);
      setMessage(error instanceof Error ? error.message : "Could not save this action.");
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`/api/community/posts/${post.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Post could not be edited.");
      setIsEditing(false);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Post could not be edited."); }
  }

  async function deletePost() {
    if (!window.confirm("Delete this post and its replies?")) return;
    try {
      const response = await fetch(`/api/community/posts/${post.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Post could not be deleted.");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Post could not be deleted."); }
  }

  async function reportPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsReporting(false);
    try {
      const response = await fetch(`/api/community/posts/${post.id}/report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: data.get("reason") }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Report could not be submitted.");
      setMessage("Report sent to the moderation team.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Report could not be submitted."); }
  }

  const author = post.author.username
    ? <Link href={`/profile/${post.author.username}`}>{post.author.name} <span>@{post.author.username}</span></Link>
    : <span>{post.author.name}</span>;

  return (
    <article className="maviri-post-card">
      <div className="maviri-post-card__rail"><span>{post.author.image ? <Image src={post.author.image} alt="" width={33} height={33} unoptimized /> : post.author.name.slice(0, 1).toUpperCase()}</span><i /></div>
      <div className="maviri-post-card__body">
        <header className="maviri-post-card__header"><div>{author}<span>{post.kind === "TEXT" ? "POST" : post.kind}</span></div><time dateTime={post.createdAt}>{post.createdAt.slice(0, 10)}</time></header>
        {isEditing ? <form className="maviri-post-edit" onSubmit={saveEdit}><label className="maviri-visually-hidden" htmlFor={`maviri-post-edit-${post.id}`}>Edit your post</label><textarea id={`maviri-post-edit-${post.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1200} required /><button type="submit">SAVE EDIT</button><button type="button" onClick={() => setIsEditing(false)}>CANCEL</button></form> : <p className="maviri-post-card__content">{post.content}</p>}
        {post.mediaUrl && <a className="maviri-post-card__media" href={post.mediaUrl} target="_blank" rel="noreferrer"><Image src={post.mediaUrl} alt={post.mediaAlt ?? "Community post image"} width={1200} height={900} unoptimized loading="lazy" /></a>}
        {post.aniListMediaId && <AnimeEmbed aniListMediaId={post.aniListMediaId} />}
        {post.quotedPost && <Link className="maviri-post-card__quote" href={`/community/${post.quotedPost.id}`}><span>QUOTED POST / {post.quotedPost.author.username ? `@${post.quotedPost.author.username}` : post.quotedPost.author.name}</span><p>{post.quotedPost.content}</p></Link>}
        {post.kind === "REVIEW" && post.reviewScore !== null && <div className="maviri-post-card__rating">PERSONAL SCORE <b>{post.reviewScore} / 100</b></div>}
        <div className="maviri-post-card__actions" aria-label="Post actions">
          <Link href={`/community/${post.id}`} aria-label={`Reply to ${post.author.name}'s post`}>↩ <span>{post.counts.comments}</span></Link>
          <button type="button" className={liked ? "is-active" : ""} onClick={() => react("LIKE")} aria-pressed={liked}>♡ <span>{likeCount}</span></button>
          <button type="button" onClick={() => react("REPOST")}>⟳ <span>{repostCount}</span></button>
          <button type="button" className={bookmarked ? "is-active" : ""} onClick={() => react("BOOKMARK")} aria-pressed={bookmarked}>⌑ <span>SAVE</span></button>
          {post.viewerCanManage && <><button type="button" onClick={() => setIsEditing(true)}>EDIT</button><button type="button" onClick={deletePost}>DELETE</button></>}
          <button type="button" onClick={() => setIsReporting(!isReporting)}>{isReporting ? "CANCEL REPORT" : "REPORT"}</button>
        </div>
        {isReporting && <form className="maviri-report-form" onSubmit={reportPost}><label htmlFor={`maviri-report-${post.id}`}>WHY ARE YOU REPORTING THIS POST?<textarea id={`maviri-report-${post.id}`} name="reason" minLength={3} maxLength={500} required value={reportReason} onChange={(event) => setReportReason(event.target.value)} /></label><button type="submit">SEND REPORT</button></form>}
        {message && <p className="maviri-inline-feedback" role="status">{message}</p>}
      </div>
    </article>
  );
}
