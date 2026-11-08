"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type NotificationItem = {
  id: string;
  kind: string;
  entityId: string;
  readAt: string | null;
  createdAt: string;
  actor: { name: string; username: string | null; image: string | null };
};

function notificationLabel(notification: NotificationItem) {
  const name = notification.actor.username ? `@${notification.actor.username}` : notification.actor.name;
  if (notification.kind === "LIKE") return `${name} liked your post.`;
  if (notification.kind === "REPOST") return `${name} reposted your post.`;
  if (notification.kind === "FOLLOW") return `${name} followed you.`;
  if (notification.kind === "COMMENT_REPLY") return `${name} replied to your comment.`;
  return `${name} replied to your post.`;
}

function notificationHref(notification: NotificationItem) {
  if (notification.kind === "FOLLOW") return notification.actor.username ? `/profile/${notification.actor.username}` : "/community";
  return `/community/${notification.entityId}`;
}

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const [notifications, setNotifications] = useState(items);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function markRead(notificationId?: string) {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notificationId ? { notificationId } : { all: true }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Notifications could not be updated.");
      setNotifications((current) => current.map((item) => !notificationId || item.id === notificationId ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Notifications could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="maviri-notification-controls"><button type="button" onClick={() => markRead()} disabled={isSaving || !notifications.some((item) => !item.readAt)}>{isSaving ? "UPDATING…" : "MARK ALL AS READ"}</button></div>
      {error && <p className="maviri-form-error" role="alert">{error}</p>}
      {notifications.length ? <div className="maviri-notification-list">{notifications.map((item) => <article className={`maviri-notification ${item.readAt ? "is-read" : "is-unread"}`} key={item.id}><Link href={notificationHref(item)}><span>{item.actor.image ? <Image src={item.actor.image} alt="" width={33} height={33} unoptimized /> : item.actor.name.slice(0, 1).toUpperCase()}</span><div><p>{notificationLabel(item)}</p><time>{item.createdAt.slice(0, 10)}</time></div></Link>{!item.readAt && <button type="button" onClick={() => markRead(item.id)} aria-label="Mark notification as read">READ</button>}</article>)}</div> : <div className="maviri-empty-state"><span>NOTIFICATIONS / 00</span><h2>Nothing new for now.</h2><p>Follows, replies, likes, and reposts will show up here.</p></div>}
    </>
  );
}
