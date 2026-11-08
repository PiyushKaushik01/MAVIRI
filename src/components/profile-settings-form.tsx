"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFields = { name: string; username: string | null; bio: string | null; image: string | null; bannerUrl: string | null; profileTheme: string };

export function ProfileSettingsForm({ profile }: { profile: ProfileFields }) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setIsSaving(true);
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: value("username"), bio: value("bio") || null,
          image: value("image") || null, bannerUrl: value("bannerUrl") || null,
          profileTheme: value("profileTheme"),
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Profile could not be saved.");
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Profile could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="maviri-profile-form" onSubmit={saveProfile}>
      <div className="maviri-profile-form__intro"><span>PROFILE / EDIT</span><h2>Make this space <em>yours.</em></h2><p>Your profile is public. Your anime library stays private.</p></div>
      <label htmlFor="maviri-profile-display-name">DISPLAY NAME<input id="maviri-profile-display-name" type="text" value={profile.name} readOnly /></label>
      <label htmlFor="maviri-profile-username">USERNAME<input id="maviri-profile-username" name="username" defaultValue={profile.username ?? ""} minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" required /><small>3–24 letters, numbers, or underscores.</small></label>
      <label htmlFor="maviri-profile-bio">BIO<textarea id="maviri-profile-bio" name="bio" defaultValue={profile.bio ?? ""} maxLength={280} rows={4} /></label>
      <label htmlFor="maviri-profile-avatar">AVATAR IMAGE URL<input id="maviri-profile-avatar" name="image" type="url" defaultValue={profile.image ?? ""} autoComplete="url" /><small>Use a secure HTTPS image address.</small></label>
      <label htmlFor="maviri-profile-banner">BANNER IMAGE URL<input id="maviri-profile-banner" name="bannerUrl" type="url" defaultValue={profile.bannerUrl ?? ""} autoComplete="url" /><small>Use a secure HTTPS image address.</small></label>
      <label htmlFor="maviri-profile-theme">PROFILE COLOR<select id="maviri-profile-theme" name="profileTheme" defaultValue={profile.profileTheme}><option value="paper">Colorful paper</option><option value="charcoal">Warm charcoal</option><option value="lilac">Lilac print</option><option value="matcha">Matcha paper</option></select></label>
      {error && <p className="maviri-form-error" role="alert">{error}</p>}
      {saved && <p className="maviri-inline-feedback" role="status">Profile saved.</p>}
      <button className="maviri-submit-button" type="submit" disabled={isSaving}>{isSaving ? "SAVING…" : "SAVE PROFILE ↗"}</button>
    </form>
  );
}
