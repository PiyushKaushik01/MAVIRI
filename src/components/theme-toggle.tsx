"use client";

import { useEffect, useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "maviri-theme";
type Theme = "light" | "dark";

const themeListeners = new Set<() => void>();

function getTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function applyTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  if (persist) {
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* Storage can be disabled by the browser. */ }
  }
  themeListeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "light");
  const isDark = theme === "dark";

  useEffect(() => {
    let storedTheme: string | null = null;
    try { storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY); } catch { /* Use the light theme when storage is disabled. */ }
    applyTheme(storedTheme === "dark" ? "dark" : "light", false);
  }, []);

  function toggleTheme() {
    applyTheme(isDark ? "light" : "dark");
  }

  return (
    <button className="maviri-theme-toggle" type="button" onClick={toggleTheme} aria-pressed={isDark}>
      <span aria-hidden="true">{isDark ? "◐" : "◑"}</span>
      {isDark ? "DARK" : "LIGHT"}
    </button>
  );
}
