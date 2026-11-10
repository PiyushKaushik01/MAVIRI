import { headers } from "next/headers";
import { ProfileEditor, ProfileWelcome } from "@/components/features/profile/profile-editor";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Profile | Maviri" };

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return (
      <main className="profile-page mx-auto w-full max-w-[1320px] px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-10">
        <ProfileWelcome />
      </main>
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { displayName: true, bio: true, avatarUrl: true, bannerUrl: true },
  });

  return (
    <main className="profile-page mx-auto w-full max-w-[1320px] px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-10">
      <ProfileEditor
        user={{ name: session.user.name, image: session.user.image ?? null }}
        saved={{
          displayName: profile?.displayName ?? "",
          bio: profile?.bio ?? "",
          avatarUrl: profile?.avatarUrl ?? "",
          bannerUrl: profile?.bannerUrl ?? "",
        }}
      />
    </main>
  );
}
