"use client";

import { useState } from "react";
import { FeedPost, PostCard } from "@/components/post-card";

export function CommunityTimeline({ initialPosts, initialCursor }: { initialPosts: FeedPost[]; initialCursor: string | null }) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadMore() {
    if (!cursor || isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/community/posts?before=${encodeURIComponent(cursor)}`);
      const result = await response.json() as { posts?: FeedPost[]; nextCursor?: string | null; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not load more posts.");
      setPosts((current) => [...current, ...(result.posts ?? [])]);
      setCursor(result.nextCursor ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load more posts.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {posts.length ? <div className="maviri-post-list">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <div className="maviri-empty-state"><span>COMMUNITY / LIVE</span><h2>The first conversation can be yours.</h2><p>There are no community posts yet.</p></div>}
      {error && <p className="maviri-form-error" role="alert">{error}</p>}
      {cursor && <button className="maviri-load-more" type="button" onClick={loadMore} disabled={isLoading}>{isLoading ? "LOADING…" : "LOAD OLDER POSTS ↓"}</button>}
    </>
  );
}
