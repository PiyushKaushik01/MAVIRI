"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle, RefreshCw } from "lucide-react";
import type { AnimeMedia } from "@/lib/anilist";

const prompts = [
  "Which scene lives in your head rent-free?",
  "What show changed your mind after three episodes?",
  "Who had the most satisfying character arc?",
  "What are you watching one episode at a time to savor?",
];

export function AfterCredits({ anime }: { anime: AnimeMedia[] }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const picks = anime.slice(0, 4);

  return (
    <section className="after-credits" aria-labelledby="after-credits-title">
      <div className="after-note">
        <span className="after-kicker"><MessageCircle size={14} /> AFTER THE CREDITS</span>
        <div className="after-prompt-wrap">
          <span className="after-quote-mark" aria-hidden="true">“</span>
          <h2 id="after-credits-title">{prompts[promptIndex]}</h2>
          <button type="button" className="after-shuffle" onClick={() => setPromptIndex((index) => (index + 1) % prompts.length)} aria-label="Give me another conversation prompt"><RefreshCw size={16} /><span>Another one</span></button>
        </div>
        <p>Big theories, tiny details, rankings you will defend forever. Good conversations start with one question.</p>
        <Link href="/discover" className="after-link">Find a show to talk about <ArrowRight size={16} /></Link>
        <span className="after-scribble" aria-hidden="true">✳</span>
      </div>

      <div className="after-gallery" aria-label="Trending anime to explore">
        <div className="after-gallery-heading"><span>SCENES FROM THE SIGNAL</span><span>SWIPE TO WANDER →</span></div>
        <div className="after-cards">
          {picks.map((item, index) => {
            const title = item.title.english ?? item.title.romaji ?? "Anime pick";
            const cover = item.coverImage.extraLarge ?? item.coverImage.large;
            return (
              <a key={item.id} href={`https://anilist.co/anime/${item.id}`} target="_blank" rel="noreferrer noopener" className={`after-card after-card-${index + 1}`} aria-label={`Explore ${title} on AniList`}>
                {cover ? <Image src={cover} alt="" fill sizes="(max-width: 640px) 42vw, 180px" className="after-card-image" /> : <span className="after-card-placeholder">✳</span>}
                <span className="after-card-shade" />
                <span className="after-card-title">{title}<ArrowUpRight size={13} /></span>
              </a>
            );
          })}
          {!picks.length && <div className="after-no-picks"><p>Fresh picks are temporarily out of range.</p><Link href="/discover">Open discovery <ArrowUpRight size={14} /></Link></div>}
        </div>
      </div>
    </section>
  );
}
