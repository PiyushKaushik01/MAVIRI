import { Suspense } from "react";
import { PublicNav } from "@/components/shared/public-nav";
import { PublicFooter } from "@/components/shared/public-footer";
import { HeroSection } from "@/components/features/home/hero-section";
import { HeroSkeleton } from "@/components/features/home/hero-skeleton";
import { PreviewSections } from "@/components/features/home/preview-sections";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto w-full max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>
        <PreviewSections />
      </main>
      <PublicFooter />
    </>
  );
}