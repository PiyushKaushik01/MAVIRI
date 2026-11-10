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
      <main className="home-main mx-auto w-full max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>
        <Suspense fallback={<div className="mt-20 h-72 animate-pulse rounded-2xl border border-border-soft bg-paper-elevated" />}>
          <AnimeVibeSection />
        </Suspense>
        <PreviewSections />
      </main>
      <PublicFooter />
    </>
  );
}
