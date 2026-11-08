import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/follow-button";
import { FeedPost, PostCard } from "@/components/post-card";
import { SiteShell } from "@/components/site-shell";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentSession, isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";
type ProfilePageProps = { params: Promise<{ username: string }> };

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  if (!isBackendConfigured()) return <SiteShell active="profile"><div className="maviri-catalogue-error"><span>PROFILE / CONNECTION</span><p>Profile pages need the application database.</p></div></SiteShell>;
  const { username } = await params;
  const prisma = getPrismaClient();
  const [session, profile] = await Promise.all([
    getCurrentSession(),
    prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true, name: true, username: true, bio: true, image: true, bannerUrl: true, profileTheme: true, createdAt: true,
        posts: { orderBy: { createdAt: "desc" }, take: 20, include: { _count: { select: { comments: true, likes: true, reposts: true } }, quotedPost: { select: { id: true, content: true, author: { select: { name: true, username: true } } } } } },
        _count: { select: { posts: true, followers: true, following: true } },
      },
    }),
  ]);
  if (!profile) notFound();

  const isOwner = session?.user.id === profile.id;
  const followed = session && !isOwner ? await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: profile.id } }, select: { id: true } }) : null;
  const posts: FeedPost[] = profile.posts.map((post) => ({
    id: post.id, content: post.content, kind: post.kind, aniListMediaId: post.aniListMediaId,
    reviewScore: post.reviewScore, mediaUrl: post.mediaUrl, mediaAlt: post.mediaAlt, quotedPost: post.quotedPost, createdAt: post.createdAt.toISOString(),
    author: { id: profile.id, name: profile.name, username: profile.username, image: profile.image },
    counts: post._count, likedByViewer: false, bookmarkedByViewer: false,
  }));

  return (
    <SiteShell active="profile">
      <section className={`maviri-public-profile maviri-profile-theme--${profile.profileTheme}`}>
        <div className="maviri-public-profile__banner">{profile.bannerUrl && <Image src={profile.bannerUrl} alt="" width={1600} height={420} unoptimized />}</div>
        <div className="maviri-public-profile__identity"><div className="maviri-public-profile__avatar">{profile.image ? <Image src={profile.image} alt={`${profile.name} avatar`} width={82} height={82} unoptimized /> : profile.name.slice(0, 1).toUpperCase()}</div><div><span>@{profile.username}</span><h1>{profile.name}</h1></div>{isOwner ? <Link className="maviri-outline-link" href="/settings/profile">EDIT PROFILE</Link> : session ? <FollowButton userId={profile.id} initialFollowing={Boolean(followed)} /> : <Link className="maviri-outline-link" href="/sign-in">SIGN IN TO FOLLOW</Link>}</div>
        {profile.bio && <p className="maviri-public-profile__bio">{profile.bio}</p>}
        <div className="maviri-public-profile__stats"><span><b>{profile._count.posts}</b> POSTS</span><span><b>{profile._count.followers}</b> FOLLOWERS</span><span><b>{profile._count.following}</b> FOLLOWING</span><span>HERE SINCE <b>{profile.createdAt.toISOString().slice(0, 10)}</b></span></div>
      </section>
      <section className="maviri-profile-posts"><div className="maviri-community-feed-heading"><span>RECENT POSTS</span><span>{posts.length} SHOWN</span></div>{posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <div className="maviri-empty-state"><p>This profile has not posted yet.</p></div>}</section>
    </SiteShell>
  );
}
