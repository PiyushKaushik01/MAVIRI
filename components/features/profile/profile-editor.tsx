"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ImagePlus, Save, Sparkles, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type ProfileFields = {
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
};

export function ProfileWelcome() {
  return (
    <section className="profile-guest-gate">
      <span className="profile-kicker"><Sparkles size={14} /> YOUR MAVIRI CORNER</span>
      <div className="profile-guest-art" aria-hidden="true"><span>M</span><i>✳</i><b>✦</b></div>
      <div className="profile-guest-copy">
        <p className="profile-eyebrow">A PLACE WITH YOUR NAME ON IT</p>
        <h1>Make your<br /><span>anime corner yours.</span></h1>
        <p>Bring your own colors, avatar, and anime-person one-liner to Maviri. Sign in through the Pokédex to set up your profile.</p>
        <div className="profile-guest-actions">
          <button type="button" onClick={() => window.dispatchEvent(new Event("maviri:open-auth"))}>Open Pokédex <ArrowRight size={16} /></button>
          <Link href="/discover">Wander first <ArrowRight size={15} /></Link>
        </div>
      </div>
      <span className="profile-guest-footnote">YOUR STORY STARTS WITH A HELLO</span>
    </section>
  );
}

export function ProfileEditor({
  user,
  saved,
}: {
  user: { name: string | null; image: string | null };
  saved: ProfileFields;
}) {
  const [fields, setFields] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { refetch: refreshSession } = authClient.useSession();
  const displayName = fields.displayName.trim() || user.name || "Anime fan";
  const avatar = fields.avatarUrl || user.image || "";

  function update<K extends keyof ProfileFields>(field: K, value: ProfileFields[K]) {
    setFields((current) => ({ ...current, [field]: value }));
    setFeedback("");
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save your profile.");
      await refreshSession();
      setFeedback("Your profile is updated.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-workbench">
      <header className="profile-heading">
        <span className="profile-kicker"><Sparkles size={14} /> YOUR MAVIRI CORNER</span>
        <h1>A profile with<br /><span>your kind of energy.</span></h1>
        <p>Give your anime corner a face, a little color, and a line that sounds like you.</p>
      </header>

      <section className="profile-stage" aria-label="Profile preview">
        <div className="profile-portrait-panel">
          <div className="profile-portrait-halo" aria-hidden="true" />
          <div className="profile-avatar-large" role={avatar ? "img" : undefined} aria-label={avatar ? `${displayName}'s avatar` : undefined} style={avatar ? { backgroundImage: `url("${avatar}")` } : undefined}>
            {!avatar && <span>{displayName.slice(0, 1).toUpperCase() || <UserRound size={64} />}</span>}
          </div>
          <span className="profile-caption profile-caption-top">MAIN CHARACTER ENERGY</span>
          <span className="profile-caption profile-caption-bottom"><span className="profile-caption-dot" /> TRAINER ONLINE</span>
          <span className="profile-star profile-star-one" aria-hidden="true">✳</span>
          <span className="profile-star profile-star-two" aria-hidden="true">✦</span>
        </div>

        <article className="profile-showcase" style={fields.bannerUrl ? { backgroundImage: `linear-gradient(90deg,rgba(33,24,20,.84),rgba(33,24,20,.18)),url("${fields.bannerUrl}")` } : undefined}>
          <div className="profile-showcase-top"><span>ANIME FRIEND · MAVIRI</span><span className="profile-showcase-signal">✳ &nbsp; PROFILE SIGNAL</span></div>
          <div className="profile-showcase-copy">
            <span className="profile-eyebrow">WELCOME TO MY CORNER</span>
            <h2>{displayName}</h2>
            <p>{fields.bio.trim() || "Currently collecting stories, favorite scenes, and people to talk about them with."}</p>
            <div className="profile-tags"><span>ANIME FAN</span><span>HERE FOR THE STORY</span></div>
          </div>
          <div className="profile-showcase-mark" aria-hidden="true">M</div>
        </article>
        <div className="profile-stage-note"><ImagePlus size={14} /> YOUR STORY, YOUR ART DIRECTION</div>
      </section>

      <section className="profile-settings-layout" aria-label="Edit profile details">
        <div className="profile-settings-intro">
          <span className="profile-kicker">MAKE IT YOURS</span>
          <h2>Set the scene.</h2>
          <p>Your profile is private to you for now. Shape it here, then it will be ready as the social spaces open up.</p>
          <div className="profile-settings-doodle" aria-hidden="true">⌁</div>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label className="profile-field">
            <span>DISPLAY NAME</span>
            <input value={fields.displayName} onChange={(event) => update("displayName", event.target.value)} maxLength={40} placeholder={user.name || "What should we call you?"} autoComplete="nickname" />
            <small>Up to 40 characters. This also updates the name shown in your Dex.</small>
          </label>
          <label className="profile-field">
            <span>YOUR ONE-LINER</span>
            <textarea value={fields.bio} onChange={(event) => update("bio", event.target.value)} maxLength={220} rows={3} placeholder="Tell people what kind of stories you love…" />
            <small>{fields.bio.length}/220</small>
          </label>
          <div className="profile-url-fields">
            <label className="profile-field">
              <span>AVATAR IMAGE URL</span>
              <input type="url" value={fields.avatarUrl} onChange={(event) => update("avatarUrl", event.target.value)} placeholder={user.image ? "Using your sign-in avatar" : "https://…"} inputMode="url" />
            </label>
            <label className="profile-field">
              <span>BANNER IMAGE URL</span>
              <input type="url" value={fields.bannerUrl} onChange={(event) => update("bannerUrl", event.target.value)} placeholder="https://…" inputMode="url" />
            </label>
          </div>
          <div className="profile-form-footer">
            <p className="profile-feedback" role="status" aria-live="polite">{feedback}</p>
            <button className="profile-save" type="submit" disabled={saving}>
              {feedback === "Your profile is updated." && !saving ? <Check size={17} /> : <Save size={16} />}
              {saving ? "SAVING…" : "SAVE PROFILE"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
