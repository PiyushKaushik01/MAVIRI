"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Sign out could not be completed.");
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign out could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="maviri-signout"><button type="button" onClick={signOut} disabled={busy}>{busy ? "SIGNING OUT…" : "SIGN OUT"}</button>{error && <p role="alert">{error}</p>}</div>;
}
