import Link from "next/link";
import { CommunityTimeline } from "@/components/community-timeline";
import { PostComposer } from "@/components/post-composer";
import { FeedPost } from "@/components/post-card";
import { SiteShell } from "@/components/site-shell";
import { getRankedCommunityPosts } from "@/lib/community-feed";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  if (!isBackendConfigured()) {
    return <SiteShell active="community"><section className="maviri-community-intro"><div className="maviri-kicker"><span>03</span> COMMUNITY / LIVE</div><h1>Anime is better<br /><em>talked about.</em></h1></section><div className="maviri-catalogue-error"><span>COMMUNITY CONNECTION</span><p>Set up PostgreSQL and authentication to load and publish community posts.</p></div></SiteShell>;
  }

  let posts: FeedPost[] = [];
  let cursor: string | null = null;
  let signedIn = false;
  let pageError = "";
  try {
    const session = await getCurrentSession();
    signedIn = Boolean(session);
    const feed = await getRankedCommunityPosts({ viewerId: session?.user.id, take: 25 });
    posts = feed.posts.map((post) => ({ ...post, createdAt: post.createdAt.toISOString() }));
    cursor = feed.nextCursor;
  } catch (error) {
    pageError = error instanceof Error ? error.message : "The community feed is unavailable.";
  }
  if (pageError) return <SiteShell active="community"><div className="maviri-catalogue-error"><span>COMMUNITY CONNECTION</span><p>{pageError}</p></div></SiteShell>;
  return (
    <SiteShell active="community">
      <section className="maviri-community-intro"><div className="maviri-kicker"><span>03</span> ANIME / COMMUNITY / LIVE</div><h1>Anime is better<br /><em>talked about.</em></h1><p>Thoughts, watch notes, reviews, and conversations from the people here.</p></section>
      {signedIn ? <PostComposer /> : <div className="maviri-community-signin"><span>JOIN THE CONVERSATION</span><p>Sign in to post, reply, and follow people.</p><Link className="maviri-submit-link" href="/sign-in">SIGN IN OR CREATE AN ACCOUNT ↗</Link></div>}
      <div className="maviri-community-feed-heading"><span>THE COMMUNITY FEED</span><span>RANKED FOR RECENCY, REPLIES, AND PEOPLE YOU FOLLOW</span></div>
      <CommunityTimeline initialPosts={posts} initialCursor={cursor} />
    </SiteShell>
  );
}
