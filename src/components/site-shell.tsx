import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AccountControl } from "@/components/account-control";
import { ThemeToggle } from "@/components/theme-toggle";

type SiteSection = "home" | "discover" | "community" | "library" | "bookmarks" | "profile" | "notifications" | "account";

export function SiteShell({ children, active = "home" }: { children: ReactNode; active?: SiteSection }) {
  return (
    <div className="maviri-site-shell">
      <aside className="maviri-sidebar" aria-label="Main navigation">
        <Link className="maviri-brand" href="/" aria-label="Maviri home">
        <Image src="/maviri-mark.png" alt="" width={66} height={39} priority className="maviri-brand__mark" />
          <span className="maviri-brand__word">MAVIRI<span>®</span></span>
        </Link>
        <div className="maviri-sidebar__caption">YOUR ANIME SPACE</div>
        <nav className="maviri-nav">
          <Link className={`maviri-nav__link ${active === "home" ? "is-active" : ""}`} href="/">
            <span className="maviri-nav__glyph" aria-hidden="true">⌂</span><span>Home</span><span className="maviri-nav__key">01</span>
          </Link>
          <Link className={`maviri-nav__link ${active === "discover" ? "is-active" : ""}`} href="/discover">
            <span className="maviri-nav__glyph" aria-hidden="true">⌕</span><span>Discover</span><span className="maviri-nav__key">02</span>
          </Link>
          <Link className={`maviri-nav__link ${active === "community" ? "is-active" : ""}`} href="/community">
            <span className="maviri-nav__glyph" aria-hidden="true">↗</span><span>Community</span><span className="maviri-nav__key">03</span>
          </Link>
          <Link className={`maviri-nav__link ${active === "library" ? "is-active" : ""}`} href="/library">
            <span className="maviri-nav__glyph" aria-hidden="true">▤</span><span>My library</span><span className="maviri-nav__key">04</span>
          </Link>
          <Link className={`maviri-nav__link ${active === "bookmarks" ? "is-active" : ""}`} href="/bookmarks">
            <span className="maviri-nav__glyph" aria-hidden="true">⌑</span><span>Saved posts</span><span className="maviri-nav__key">05</span>
          </Link>
          <Link className={`maviri-nav__link ${active === "profile" ? "is-active" : ""}`} href="/settings/profile">
            <span className="maviri-nav__glyph" aria-hidden="true">◌</span><span>Profile</span><span className="maviri-nav__key">06</span>
          </Link>
          <Link className={`maviri-nav__link ${active === "notifications" ? "is-active" : ""}`} href="/notifications">
            <span className="maviri-nav__glyph" aria-hidden="true">◇</span><span>Notifications</span><span className="maviri-nav__key">07</span>
          </Link>
        </nav>
        <div className="maviri-sidebar__bottom">
          <span className="maviri-status-dot" /> LIVE CATALOGUE
          <p>Powered by AniList</p>
        </div>
      </aside>
      <div className="maviri-main-column">
        <header className="maviri-topbar">
          <div className="maviri-topbar__breadcrumb"><span>SPACE /</span> {active.toUpperCase()}</div>
          <Link className="maviri-topbar__search" href="/discover"><span>⌕</span> Find your next story <kbd>↵</kbd></Link>
          <div className="maviri-topbar__tools"><AccountControl /><ThemeToggle /><div className="maviri-topbar__edition">INDEPENDENT ANIME CULTURE <span>VOL. 01</span></div></div>
        </header>
        <main className="maviri-content">{children}</main>
        <footer className="maviri-footer"><span>MAVIRI — FOR THE STORIES THAT STAY.</span><span>CATALOGUE DATA BY ANILIST</span></footer>
      </div>
    </div>
  );
}
