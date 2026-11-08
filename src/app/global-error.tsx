"use client";

import "./globals.css";
import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="maviri-error-page" role="alert">
          <span>MAVIRI / SYSTEM ERROR</span>
          <h1>The space needs a moment.</h1>
          <p>A page failed to load. Your saved collection and account remain in the database.</p>
          <button type="button" onClick={reset}>RELOAD THIS PAGE</button>
          <Link href="/">RETURN HOME ↗</Link>
        </main>
      </body>
    </html>
  );
}
