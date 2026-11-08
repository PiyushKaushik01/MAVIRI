import Link from "next/link";

export default function NotFound() {
  return (
    <main className="maviri-error-page">
      <span>404 / NOT IN THE CATALOGUE</span>
      <h1>This page wandered off.</h1>
      <p>The address may have changed, or this story is no longer here.</p>
      <Link href="/discover">FIND YOUR NEXT STORY ↗</Link>
    </main>
  );
}
