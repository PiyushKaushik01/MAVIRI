"use client";

import dynamic from "next/dynamic";
import type { LibraryStatPoint } from "@/components/library-stats-scene";

const LibraryStatsScene = dynamic(
  () => import("@/components/library-stats-scene").then((module) => module.LibraryStatsScene),
  { ssr: false, loading: () => <div className="maviri-stats-scene__loading" aria-hidden="true" /> },
);

export function LibraryStatsSceneLoader({ points }: { points: LibraryStatPoint[] }) {
  return <LibraryStatsScene points={points} />;
}
