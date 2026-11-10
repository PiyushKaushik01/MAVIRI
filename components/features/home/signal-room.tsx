"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Compass, Dice5, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { AnimeMedia } from "@/lib/anilist";

const moods = ["A new world", "A little chaos", "Soft feelings", "Big energy", "One more episode"];

export function SignalRoom({ anime, profileImage }: { anime: AnimeMedia[]; profileImage: string | null }) {
  const session = authClient.useSession();
  const [active, setActive] = useState(0);
  const [mood, setMood] = useState(0);
  const selected = anime[active % Math.max(anime.length, 1)];
  const title = selected?.title.english ?? selected?.title.romaji ?? "Find your next favorite";
  const art = selected?.bannerImage ?? selected?.coverImage.extraLarge ?? selected?.coverImage.large;

  function tuneNext() {
    setActive((index) => (index + 1) % Math.max(anime.length, 1));
    setMood((index) => (index + 1) % moods.length);
  }

  function moveArt(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--pointer-x", `${x.toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--pointer-y", `${(-y).toFixed(2)}deg`);
  }

  return (
    <section className="signal-room" aria-label="Maviri anime discovery">
      <header className="home-topline" aria-label="Maviri">
        <div className="home-topline-brand">
          <Logo className="home-topline-logo" />
          <span>Anime, together.</span>
        </div>
        <div className="home-topline-actions">
          <ThemeToggle className="home-topline-theme" />
          {session.data?.user && (
            <Link href="/profile" className="home-topline-profile">
              <span className="home-profile-avatar" aria-hidden="true">
                {profileImage ? (
                  <Image src={profileImage} alt="" fill sizes="30px" unoptimized />
                ) : (
                  <svg className="home-profile-lens" viewBox="0 0 32 32" aria-hidden="true" shapeRendering="crispEdges">
                    <path d="M9 1h14v3h4v4h4v14h-4v4h-4v4H9v-4H5v-4H1V8h4V4h4z" fill="#101014" />
                    <path d="M10 4h12v3h4v4h3v10h-3v4h-4v3H10v-3H6v-4H3V11h3V7h4z" fill="#2a8cff" />
                    <path d="M8 8h6v6H8z" fill="#d4f0ff" />
                  </svg>
                )}
              </span>
              <span>{session.data.user.name || "My profile"}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </header>
      <div className="signal-orbit signal-orbit-one" aria-hidden="true" />
      <div className="signal-orbit signal-orbit-two" aria-hidden="true" />
      <div className="signal-copy">
        <p className="signal-eyebrow"><span className="signal-live-dot" /> ANIME, IN EVERY DIRECTION</p>
        <h1>Find your<br /><span>next feeling.</span></h1>
        <p className="signal-description">A place to discover your next obsession, keep the details you care about, and find people who feel the same way.</p>
        <div className="signal-actions">
          <Link href="/discover" className="signal-primary"><Compass size={17} /> Explore the map <ArrowUpRight size={15} /></Link>
          <a href="#signal-mixer" className="signal-secondary">Wander a little <ArrowDown size={15} /></a>
        </div>
        <div className="signal-mood" aria-live="polite">
          <span className="signal-mood-star" aria-hidden="true">✳</span>
          <span><small>THE VIBE RIGHT NOW</small><strong>{moods[mood]}</strong></span>
          <button type="button" onClick={tuneNext} aria-label="Tune to another anime mood"><Dice5 size={17} /></button>
        </div>
      </div>

      {selected ? (
        <div className="signal-art-wrap">
          <a
            href={`https://anilist.co/anime/${selected.id}`}
            target="_blank"
            rel="noreferrer noopener"
            className="signal-art"
            onPointerMove={moveArt}
            onPointerLeave={(event) => {
              event.currentTarget.style.setProperty("--pointer-x", "0deg");
              event.currentTarget.style.setProperty("--pointer-y", "0deg");
            }}
            aria-label={`Explore ${title} on AniList`}
          >
            {art ? <Image src={art} alt={`${title} artwork`} fill priority sizes="(max-width: 760px) 100vw, 62vw" className="signal-art-image" /> : null}
            <span className="signal-art-wash" />
            <span className="signal-sticker"><Sparkles size={13} /> CURRENT TRANSMISSION</span>
            <span className="signal-art-caption"><small>{selected.genres.slice(0, 3).join(" · ") || "TRENDING ANIME"}</small><strong>{title}</strong><span>OPEN ANILIST <ArrowUpRight size={13} /></span></span>
            <span className="signal-art-index" aria-hidden="true">{String((active % Math.max(anime.length, 1)) + 1).padStart(2, "0")}<i> / {String(anime.length).padStart(2, "0")}</i></span>
          </a>
          <button className="signal-tune" type="button" onClick={tuneNext}><Dice5 size={17} /> Tune next</button>
        </div>
      ) : (
        <div className="signal-art-wrap signal-empty"><div className="signal-empty-mark">✳</div><p>Our antenna is looking for fresh anime signals.</p><Link href="/discover">Open discovery <ArrowUpRight size={15} /></Link></div>
      )}
      <div className="signal-coordinates" aria-hidden="true">36°12′N &nbsp; 138°15′E <span>STAY CURIOUS</span></div>
    </section>
  );
}
