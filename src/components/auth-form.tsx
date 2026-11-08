"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const body: Record<string, string> = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };
    if (mode === "sign-up") body.name = String(formData.get("name") ?? "").trim();

    try {
      const response = await fetch(`/api/auth/${mode === "sign-up" ? "sign-up/email" : "sign-in/email"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.message ?? result.error ?? "Authentication failed.");
      router.push("/library");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="maviri-auth-panel">
      <div className="maviri-kicker"><span>YOUR SPACE /</span> {mode === "sign-up" ? "CREATE ACCOUNT" : "WELCOME BACK"}</div>
      <h1>{mode === "sign-up" ? <>Make yourself<br /><em>at home.</em></> : <>Good to have<br /><em>you back.</em></>}</h1>
      <p className="maviri-auth-panel__intro">Your anime library and conversations, together in one place.</p>
      <form className="maviri-auth-form" onSubmit={handleSubmit}>
        {mode === "sign-up" && <label>DISPLAY NAME<input name="name" type="text" minLength={2} maxLength={60} autoComplete="name" required /></label>}
        <label>EMAIL ADDRESS<input name="email" type="email" autoComplete="email" required /></label>
        <label>PASSWORD<input name="password" type="password" minLength={8} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} required /></label>
        {error && <p className="maviri-form-error" role="alert">{error}</p>}
        <button className="maviri-submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "CONNECTING…" : mode === "sign-up" ? "CREATE YOUR ACCOUNT ↗" : "SIGN IN ↗"}</button>
      </form>
      <button className="maviri-auth-switch" type="button" onClick={() => { setMode(mode === "sign-up" ? "sign-in" : "sign-up"); setError(""); }}>
        {mode === "sign-up" ? "Already have an account? Sign in." : "New to Maviri? Create an account."}
      </button>
      <Link className="maviri-auth-back" href="/">← RETURN HOME</Link>
    </section>
  );
}
