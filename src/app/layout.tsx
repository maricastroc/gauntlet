import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Three typefaces, three jobs — the mock's whole voice lives here.
 *   Fraunces  → display serif for titles, the champion, editorial accents.
 *   Geist     → the calm sans for UI chrome and team names (the Vercel voice).
 *   Geist Mono → every number: scores, tables, stats, mono eyebrow labels.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bracket — Copa Atlas 2026",
    template: "%s · Bracket",
  },
  description:
    "Run a tournament like you're calling it. Standings, tiebreaks and knockout always coherent.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
