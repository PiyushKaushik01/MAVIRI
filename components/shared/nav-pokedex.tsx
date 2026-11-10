"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type NavPokedexProps = {
  onOpenAuth: () => void;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.setTimeout(resolve, reducedMotion ? 0 : ms);
  });

export function NavPokedex({ onOpenAuth }: NavPokedexProps) {
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);
  const [veilOpen, setVeilOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rigRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const transitioningRef = useRef(false);
  const session = authClient.useSession();
  const user = session.data?.user;
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const fit = () => {
      if (!rigRef.current) return;
      const width = document.documentElement.clientWidth;
      const height = window.visualViewport?.height ?? window.innerHeight;
      const mobile = width < 680;
      const scale = Math.min(
        1,
        (height - 24) / 566,
        mobile ? (width - 24) / 300 : (width - 40) / 640
      );
      rigRef.current.style.setProperty("--navdex-scale", Math.max(0.45, scale).toFixed(3));
    };

    fit();
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, []);

  const openDex = useCallback(async () => {
    if (transitioningRef.current || open) return;
    transitioningRef.current = true;
    setLifted(true);
    setVeilOpen(true);
    await wait(650);
    setOpen(true);
    await wait(900);
    closeRef.current?.focus();
    transitioningRef.current = false;
  }, [open]);

  const closeDex = useCallback(async (handoffToAuth = false) => {
    if (transitioningRef.current || !open) return;
    transitioningRef.current = true;
    setOpen(false);
    await wait(900);
    setLifted(false);
    setVeilOpen(false);
    await wait(350);
    transitioningRef.current = false;
    if (handoffToAuth) {
      onOpenAuth();
    } else {
      peekRef.current?.focus({ preventScroll: true });
    }
  }, [onOpenAuth, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        void closeDex();
        return;
      }

      if (event.key !== "Tab" || !rigRef.current) return;
      const focusable = Array.from(
        rigRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled):not([tabindex="-1"])'
        )
      ).filter((element) => !element.closest(".navdex-front"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDex, open]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("[NavPokedex] sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  };

  const closeAfterNavigation = () => {
    void closeDex();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        aria-hidden={!veilOpen}
        tabIndex={veilOpen ? 0 : -1}
        className={cn("navdex-veil", veilOpen && "is-visible")}
        onClick={() => void closeDex()}
      />

      <div
        ref={rigRef}
        className={cn("navdex-rig", lifted && "is-lifted", open && "is-open")}
      >
        <div className="navdex-bob">
          <div className="navdex-device">
            <section
              className="navdex-panel"
              aria-label="Maviri navigation device"
              aria-hidden={!open}
              inert={!open}
            >
              <div className="navdex-top" aria-hidden="true">
                <i className="navdex-led green" />
                <i className="navdex-led yellow" />
                <i className="navdex-led red" />
                <b className="navdex-lens" />
              </div>

              <svg className="navdex-seam" viewBox="0 0 340 40" aria-hidden="true">
                <path d="M100 34V30H108V26H116V22H124V18H340V34Z" fill="#b61f1f" />
                <path d="M0 34H100V30H108V26H116V22H124V18H340" fill="none" stroke="#120303" strokeWidth="4" />
              </svg>

              <button
                ref={closeRef}
                type="button"
                aria-label="Close navigation device"
                className="navdex-key navdex-close"
                onClick={() => void closeDex()}
              >
                X
              </button>

              <div className="navdex-bezel">
                <div className="navdex-screen" inert={!open} aria-hidden={!open}>
                  <div className="navdex-screen-heading">
                    <span>MAVIRI NAV</span>
                    <b aria-hidden="true">▮</b>
                  </div>

                  <div className="navdex-trainer">
                    <span className="navdex-trainer-icon" aria-hidden="true">M</span>
                    <span className="navdex-trainer-copy">
                      <strong>{session.isPending ? "SYNCING..." : user?.name || "GUEST TRAINER"}</strong>
                      <small>{user ? "DEX CONNECTED" : "WELCOME TO MAVIRI"}</small>
                    </span>
                  </div>

                  <nav aria-label="Pokedex navigation" className="navdex-menu">
                    <Link href="/" onClick={closeAfterNavigation} className="navdex-menu-link">
                      <span>HOME</span><span aria-hidden="true">›</span>
                    </Link>
                    <Link href="/discover" onClick={closeAfterNavigation} className="navdex-menu-link">
                      <span>DISCOVER</span><span aria-hidden="true">›</span>
                    </Link>
                    <div className="navdex-menu-link is-locked" aria-disabled="true">
                      <span>COMMUNITY</span><small>SOON</small>
                    </div>
                    <div className="navdex-menu-link is-locked" aria-disabled="true">
                      <span>LIBRARY</span><small>SOON</small>
                    </div>
                    {user ? (
                      <button type="button" className="navdex-menu-link navdex-action" onClick={handleSignOut} disabled={signingOut}>
                        <span>{signingOut ? "SIGNING OUT..." : "SIGN OUT"}</span><span aria-hidden="true">↗</span>
                      </button>
                    ) : (
                      <button type="button" className="navdex-menu-link navdex-action" onClick={() => void closeDex(true)}>
                        <span>SIGN IN / JOIN</span><span aria-hidden="true">↗</span>
                      </button>
                    )}
                  </nav>

                  <button
                    type="button"
                    className="navdex-theme"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle color theme"}
                  >
                    <span>THEME</span><span>{mounted ? (isDark ? "NIGHT" : "DAY") : "MODE"}</span>
                  </button>
                </div>
                <i className="navdex-dot" aria-hidden="true" />
              </div>

              <i className="navdex-ribbon ribbon-one" aria-hidden="true" />
              <i className="navdex-ribbon ribbon-two" aria-hidden="true" />
              <i className="navdex-square" aria-hidden="true" />
              <button
                type="button"
                className="navdex-key navdex-enter"
                onClick={() => (open ? void closeDex() : void openDex())}
                aria-label={open ? "Close navigation" : "Open navigation"}
              >
                {open ? "CLOSE" : "OPEN DEX"}
              </button>
              <div className="navdex-dpad" aria-hidden="true">
                <i className="up" /><i className="down" /><i className="left" /><i className="right" />
              </div>
            </section>

            <div className="navdex-cover">
              <div className="navdex-panel navdex-face navdex-front" aria-hidden="true">
                <div className="navdex-top">
                  <i className="navdex-led green" /><i className="navdex-led yellow" /><i className="navdex-led red" /><b className="navdex-lens" />
                </div>
                <svg className="navdex-seam" viewBox="0 0 340 40">
                  <path d="M100 34V30H108V26H116V22H124V18H340V34Z" fill="#b61f1f" />
                  <path d="M0 34H100V30H108V26H116V22H124V18H340" fill="none" stroke="#120303" strokeWidth="4" />
                </svg>
                <i className="navdex-gloss" /><i className="navdex-arrow" /><i className="navdex-slot" />
              </div>
              <div className="navdex-panel navdex-face navdex-back" aria-hidden="true">
                <i className="navdex-grille" /><span className="navdex-tag">MAVIRI<br />TRAINER DEX</span>
              </div>
            </div>
          </div>
        </div>

        <button
          ref={peekRef}
          type="button"
          aria-label="Open Maviri navigation"
          aria-expanded={open}
          className="navdex-peek"
          onClick={() => void (open ? closeDex() : openDex())}
          tabIndex={lifted ? -1 : 0}
        />
        <div className="navdex-hint" aria-hidden="true">TAP TO OPEN</div>
      </div>
    </>
  );
}
