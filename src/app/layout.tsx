import type { Metadata } from "next";
import { Barlow_Condensed, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BicBren Tech Glossary",
  description:
    "A plain-language tech reference for non-programmers. The bridge between Hot Panda Media and KOT Projects.",
  openGraph: {
    title: "BicBren Tech Glossary",
    description:
      "A plain-language tech reference for non-programmers who work closely with developers and AI tools.",
    url: "https://bicbren.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${jetbrainsMono.variable} ${inter.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
      >
        {children}
      </body>
    </html>
  );
}
