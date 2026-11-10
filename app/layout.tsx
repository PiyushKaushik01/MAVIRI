import type { Metadata } from "next";
import { Geist, Space_Grotesk, Press_Start_2P } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PublicNav } from "@/components/shared/public-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maviri — Anime, together.",
  description:
    "Discover anime, keep the details you care about, and talk about what you love. Maviri is an anime social platform built for fans.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${spaceGrotesk.variable} ${pressStart.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <PublicNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
