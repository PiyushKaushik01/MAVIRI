import Link from "next/link";
import { PostCard, FeedPost } from "@/components/post-card";
import { SiteShell } from "@/components/site-shell";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  if (!isBackendConfigured()) return <BookmarksNotice message="Saved posts are stored in your account after database setup." />;
  const session = await getCurrentSession();
  if (!session) return <SiteShell active="bookmarks"><div className="maviri-empty-state"><span>SAVED / PRIVATE</span><h2>Sign in to keep posts for later.</h2><Link className="maviri-submit-link" href="/sign-in">SIGN IN ↗</Link></div></SiteShell>;
  let posts: FeedPost[] = [];
  let pageError = "";
  try {
    const prisma = getPrismaClient();
    const bookmarks = await prisma.postBookmark.findMany({
      where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 100,
      include: { post: { include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        _count: { select: { comments: true, likes: true, reposts: true } },
        quotedPost: { select: { id: true, content: true, author: { select: { name: true, username: true } } } },
      } } },
    });
    posts = bookmarks.map(({ post }) => ({
      id: post.id, content: post.content, kind: post.kind, aniListMediaId: post.aniListMediaId,
      reviewScore: post.reviewScore, mediaUrl: post.mediaUrl, mediaAlt: post.mediaAlt,
      quotedPost: post.quotedPost, createdAt: post.createdAt.toISOString(), author: post.author,
      counts: post._count, likedByViewer: false, bookmarkedByViewer: true, viewerCanManage: post.authorId === session.user.id,
    }));
  } catch (error) {
    pageError = error instanceof Error ? error.message : "Saved posts could not be loaded.";
  }
  if (pageError) return <BookmarksNotice message={pageError} />;
  return <SiteShell active="bookmarks"><section className="maviri-notifications-intro"><div className="maviri-kicker"><span>07</span> SAVED / PERSONAL ARCHIVE</div><h1>Keep the <em>good ones.</em></h1><p>Posts you saved from the community.</p></section>{posts.length ? <div className="maviri-post-list">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <div className="maviri-empty-state"><span>SAVED POSTS / 00</span><h2>No saved posts yet.</h2><p>Save a community post to find it here later.</p><Link className="maviri-text-link" href="/community">OPEN THE COMMUNITY ↗</Link></div>}</SiteShell>;
}

function BookmarksNotice({ message }: { message: string }) {
  return <SiteShell active="bookmarks"><div className="maviri-catalogue-error"><span>SAVED / CONNECTION</span><p>{message}</p></div></SiteShell>;
}
