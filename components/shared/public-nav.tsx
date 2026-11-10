"use client";

import { useState } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Pokedex } from "@/components/pokedex/pokedex";
import Link from "next/link";

export function PublicNav() {
  const [pokedexOpen, setPokedexOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden items-center gap-6 md:flex">
              <Link href="/discover" className="text-sm font-bold text-ink hover:text-accent-tertiary transition-colors">
                Discover
              </Link>
              <Link href="/community" className="text-sm font-bold text-ink hover:text-accent-tertiary transition-colors">
                Community
              </Link>
              <Link href="/library" className="text-sm font-bold text-ink hover:text-accent-tertiary transition-colors">
                Library
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="border-2 border-ink shadow-[2px_2px_0_0_var(--ink)]" />
            <button
              type="button"
              onClick={() => setPokedexOpen(true)}
              className="inline-flex items-center rounded-xl border-2 border-ink bg-accent-primary px-5 py-2 text-sm font-black text-ink shadow-[3px_3px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-tertiary"
            >
              Sign in
            </button>
          </div>
        </nav>
      </header>

      <Pokedex open={pokedexOpen} onClose={() => setPokedexOpen(false)} mode="auth" />
    </>
  );
}