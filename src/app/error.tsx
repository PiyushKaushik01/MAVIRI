"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <main className="maviri-error-page" role="alert">
      <span>THE PAGE LOST ITS THREAD / 500</span>
      <h1>That did not go as planned.</h1>
      <p>Your account and saved data are still safe. Retry the page, or return to Maviri’s home.</p>
      <button type="button" onClick={reset}>TRY AGAIN</button>
      <Link href="/">RETURN HOME ↗</Link>
    </main>
  );
}
