"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({ userId, initialFollowing }: { userId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function toggleFollow() {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/community/follow/${userId}`, { method: "POST" });
      const result = await response.json() as { following?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update follow status.");
      setFollowing(Boolean(result.following));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update follow status.");
    } finally {
      setIsSaving(false);
    }
  }

  return <div className="maviri-follow-control"><button type="button" onClick={toggleFollow} disabled={isSaving}>{isSaving ? "…" : following ? "FOLLOWING" : "FOLLOW ↗"}</button>{error && <p role="status">{error}</p>}</div>;
}
