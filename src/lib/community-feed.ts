import "server-only";
import { getPrismaClient } from "@/lib/prisma";

export async function getRankedCommunityPosts(options: { viewerId?: string; before?: { createdAt: Date; id: string }; take?: number } = {}) {
  const prisma = getPrismaClient();
  const take = Math.min(Math.max(options.take ?? 30, 1), 50);
  const followed = options.viewerId
    ? await prisma.follow.findMany({ where: { followerId: options.viewerId }, select: { followingId: true } })
    : [];
  const followedIds = new Set(followed.map((item) => item.followingId));
  const trackedMedia = options.viewerId
    ? await prisma.animeListEntry.findMany({ where: { userId: options.viewerId }, select: { aniListMediaId: true } })
    : [];
  const trackedMediaIds = new Set(trackedMedia.map((entry) => entry.aniListMediaId));
  const candidates = await prisma.post.findMany({
    where: options.before ? { OR: [{ createdAt: { lt: options.before.createdAt } }, { createdAt: options.before.createdAt, id: { lt: options.before.id } }] } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      quotedPost: { select: { id: true, content: true, author: { select: { name: true, username: true } } } },
      _count: { select: { comments: true, likes: true, reposts: true } },
      likes: options.viewerId ? { where: { userId: options.viewerId }, select: { id: true } } : false,
      bookmarks: options.viewerId ? { where: { userId: options.viewerId }, select: { id: true } } : false,
    },
  });

  const ranked = candidates.map((post) => {
    const ageHours = Math.max(0, (Date.now() - post.createdAt.getTime()) / 3_600_000);
    const score = post._count.likes * 1.2 + post._count.comments * 1.8 + post._count.reposts * 1.5 + (followedIds.has(post.authorId) ? 3.5 : 0) + (post.aniListMediaId && trackedMediaIds.has(post.aniListMediaId) ? 2.75 : 0) - ageHours * 0.18;
    return { post, score };
  }).sort((left, right) => right.score - left.score || right.post.createdAt.getTime() - left.post.createdAt.getTime());

  const diversified: typeof ranked = [];
  const authorCounts = new Map<string, number>();
  for (const item of ranked) {
    const count = authorCounts.get(item.post.authorId) ?? 0;
    if (count < 2 && diversified.length < take) {
      diversified.push(item);
      authorCounts.set(item.post.authorId, count + 1);
    }
  }
  if (diversified.length < take) {
    for (const item of ranked) {
      if (diversified.length >= take) break;
      if (!diversified.includes(item)) diversified.push(item);
    }
  }

  return {
    posts: diversified.map(({ post }) => ({
      id: post.id,
      content: post.content,
      kind: post.kind,
      aniListMediaId: post.aniListMediaId,
      reviewScore: post.reviewScore,
      mediaUrl: post.mediaUrl,
      mediaAlt: post.mediaAlt,
      quotedPost: post.quotedPost,
      createdAt: post.createdAt,
      author: post.author,
      counts: post._count,
      likedByViewer: Array.isArray(post.likes) && post.likes.length > 0,
      bookmarkedByViewer: Array.isArray(post.bookmarks) && post.bookmarks.length > 0,
      viewerCanManage: options.viewerId === post.authorId,
    })),
    nextCursor: candidates.length === take
      ? Buffer.from(JSON.stringify({ createdAt: candidates[candidates.length - 1].createdAt.toISOString(), id: candidates[candidates.length - 1].id })).toString("base64url")
      : null,
  };
}
