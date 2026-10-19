import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { SITE, getSiteUrl, isSiteUrlExplicit } from "@/config/site";
import "@/styles/tokens.css";
import "@/styles/typography.css";
import "@/styles/utilities.css";
import "./globals.css";

// A2F Design System fonts, shared by the public site and the admin.
// Exposed as a variable; styles opt in through the tokens (--font-en / --font-base).
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hanken",
  display: "swap",
});

// Pretendard is not on Google Fonts: official dynamic-subset build (downloads only the
// glyph ranges a page uses). Version pinned.
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

// Absolute URLs from the shared site URL. Until the final domain is set, every page is
// noindex as well (robots.txt alone does not keep a linked page out of the index).
// Icons and the link-preview image are the files icon.svg, apple-icon.png and
// opengraph-image.png in this folder (Next.js file conventions).
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, locale: "ko_KR", title: SITE.name, description: SITE.description },
  ...(isSiteUrlExplicit() ? {} : { robots: { index: false, follow: false } }),
};

// Shared by the public site and the admin; each area adds its own chrome in a nested layout.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={hanken.variable}>
      <head>
        <link rel="stylesheet" href={PRETENDARD_CSS} crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
