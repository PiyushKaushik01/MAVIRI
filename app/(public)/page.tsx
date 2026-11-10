import { Suspense } from "react";
import { PublicFooter } from "@/components/shared/public-footer";
import { HeroSection } from "@/components/features/home/hero-section";
import { HeroSkeleton } from "@/components/features/home/hero-skeleton";
import { PreviewSections } from "@/components/features/home/preview-sections";
import { AnimeVibeSection } from "@/components/features/home/anime-vibe-section";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <main className="home-main mx-auto w-full max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>
        <Suspense fallback={<div className="mt-24 h-[28rem] animate-pulse rounded-[28px] bg-paper-elevated" />}>
          <AnimeVibeSection />
        </Suspense>
        <PreviewSections />
      </main>
      <PublicFooter />
    </>
  );
}
