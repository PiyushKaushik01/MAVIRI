"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Sparkles, Star } from "lucide-react";

export function PlayfulMasthead() {
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const playSparkle = () => {
    setPlaying(false);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    window.requestAnimationFrame(() => setPlaying(true));
    timerRef.current = window.setTimeout(() => setPlaying(false), 560);
  };

  return (
    <header className="maviri-masthead" aria-label="Maviri decorative masthead">
      <div className="maviri-wordmark" aria-label="Maviri, anime together">
        <span className="maviri-mark" aria-hidden="true">M</span>
        <span className="font-accent text-lg font-bold tracking-tight">Maviri</span>
        <span className="hidden text-xs text-ink-muted sm:inline">Anime, together.</span>
      </div>

      <div className="maviri-charms" aria-label="Decorative anime charms">
        <Circle aria-hidden="true" size={10} className="fill-accent-secondary/60" />
        <Star aria-hidden="true" size={13} className="fill-accent-primary/60" />
        <button
          type="button"
          className={`maviri-charm${playing ? " is-playing" : ""}`}
          aria-label="Play the decorative sparkle animation"
          onClick={playSparkle}
        >
          <Sparkles aria-hidden="true" size={17} />
        </button>
      </div>
    </header>
  );
}
