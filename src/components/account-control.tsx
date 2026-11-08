"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";

type AccountUser = { name?: string; username?: string | null };

export function AccountControl() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/get-session", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) return null;
        const result = await response.json() as { user?: AccountUser } | null;
        return result?.user ?? null;
      })
      .then((result) => { if (active) { setUser(result); setChecked(true); } })
      .catch(() => { if (active) setChecked(true); });
    return () => { active = false; };
  }, []);

  if (!checked || !user) return <Link className="maviri-signin-link" href="/sign-in">ACCOUNT <span>↗</span></Link>;
  return <div className="maviri-account-control"><Link className="maviri-signin-link" href={user.username ? `/profile/${user.username}` : "/settings/profile"}>{user.username ? `@${user.username}` : user.name ?? "MY PROFILE"}</Link><SignOutButton /></div>;
}
