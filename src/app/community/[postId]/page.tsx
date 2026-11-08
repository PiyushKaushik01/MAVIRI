import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedPost, PostCard } from "@/components/post-card";
import { ReplyForm } from "@/components/reply-form";
import { SiteShell } from "@/components/site-shell";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";
type DiscussionPageProps = { params: Promise<{ postId: string }> };

export default async function DiscussionPage({ params }: DiscussionPageProps) {
  if (!isBackendConfigured()) return <SiteShell active="community"><div className="maviri-catalogue-error"><span>DISCUSSION CONNECTION</span><p>Set up the database to read community conversations.</p></div></SiteShell>;
  const { postId } = await params;
  const prisma = getPrismaClient();
  const session = await getCurrentSession();
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      quotedPost: { select: { id: true, content: true, author: { select: { name: true, username: true } } } },
      _count: { select: { comments: true, likes: true, reposts: true } },
      likes: session ? { where: { userId: session.user.id }, select: { id: true } } : false,
      bookmarks: session ? { where: { userId: session.user.id }, select: { id: true } } : false,
      comments: {
        where: { parentCommentId: null }, orderBy: { createdAt: "asc" }, take: 100,
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          replies: { orderBy: { createdAt: "asc" }, take: 30, include: { author: { select: { id: true, name: true, username: true, image: true } } } },
        },
      },
    },
  });
  if (!post) notFound();

  const feedPost: FeedPost = {
    id: post.id, content: post.content, kind: post.kind, aniListMediaId: post.aniListMediaId,
    reviewScore: post.reviewScore, mediaUrl: post.mediaUrl, mediaAlt: post.mediaAlt, quotedPost: post.quotedPost,
    createdAt: post.createdAt.toISOString(), author: post.author,
    counts: post._count, likedByViewer: Array.isArray(post.likes) && post.likes.length > 0,
    bookmarkedByViewer: Array.isArray(post.bookmarks) && post.bookmarks.length > 0,
    viewerCanManage: session?.user.id === post.authorId,
  };
  return (
    <SiteShell active="community">
      <div className="maviri-discussion-heading"><Link className="maviri-back-link" href="/community">← COMMUNITY FEED</Link><span>THREAD / {post.id.slice(-6).toUpperCase()}</span></div>
      <PostCard post={feedPost} />
      <section className="maviri-replies"><div className="maviri-community-feed-heading"><span>{post._count.comments} REPLIES</span><span>FOLLOW THE THREAD</span></div>
        {session ? <ReplyForm postId={post.id} /> : <p className="maviri-reply-signin"><Link href="/sign-in">Sign in</Link> to join the conversation.</p>}
        {post.comments.length ? post.comments.map((comment) => (
          <article className="maviri-comment" key={comment.id}>
            <header><span>{comment.author.name}{comment.author.username ? ` @${comment.author.username}` : ""}</span><time>{comment.createdAt.toISOString().slice(0, 10)}</time></header>
            <p>{comment.content}</p>
            {session ? <ReplyForm postId={post.id} parentCommentId={comment.id} /> : null}
            {comment.replies.map((reply) => <div className="maviri-comment maviri-comment--nested" key={reply.id}><header><span>{reply.author.name}{reply.author.username ? ` @${reply.author.username}` : ""}</span><time>{reply.createdAt.toISOString().slice(0, 10)}</time></header><p>{reply.content}</p></div>)}
          </article>
        )) : <div className="maviri-empty-state"><p>No replies yet. Start the conversation.</p></div>}
      </section>
    </SiteShell>
  );
}
