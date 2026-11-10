import { Logo } from "./logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-border-soft bg-paper-raised">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xs text-ink-muted">Anime, together.</span>
        </div>
        <p className="text-xs text-ink-muted">
          Anime data provided by{" "}
          <a
            href="https://anilist.co"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2 hover:text-ink"
          >
            AniList
          </a>
          .
        </p>
      </div>
    </footer>
  );
}