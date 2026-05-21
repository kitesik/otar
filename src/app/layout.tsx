import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clapperboard, Search } from "lucide-react";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "ㅊ미 - cal 잘못 친 사람을 위한 오타 쉼터",
    template: "%s | ㅊ미",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: siteConfig.name,
    title: "ㅊ미 - 오타가 열어준 작은 쉼터",
    description: siteConfig.description,
    url: siteConfig.url,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ㅊ미 - 오타가 열어준 작은 쉼터",
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  keywords: [
    "ㅊ미",
    "cal 한영",
    "cal 잘못침",
    "구글 캘린더 오타",
    "youtube 오타",
    "유튜브 오타",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-[#fffdf7]/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-2 font-black">
              <span className="grid size-9 place-items-center rounded-[8px] bg-black text-lg text-white">
                ㅊ
              </span>
              <span>ㅊ미</span>
            </Link>
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                className="nav-link inline-flex"
                href="/dictionary"
                aria-label="오타 사전"
              >
                <Search aria-hidden="true" size={16} />
                <span className="hidden sm:inline">사전</span>
              </Link>
              <Link
                className="nav-link inline-flex"
                href="/archive"
                aria-label="아카이브"
              >
                <Clapperboard aria-hidden="true" size={16} />
                <span className="hidden sm:inline">아카이브</span>
              </Link>
              <a
                className="nav-link inline-flex"
                href="https://calendar.google.com/calendar/u/0/r"
                target="_blank"
                rel="noreferrer"
                aria-label="구글 캘린더 열기"
              >
                <CalendarDays aria-hidden="true" size={16} />
                <span className="hidden sm:inline">캘린더</span>
              </a>
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-black/10 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <p>오타를 놀리지 않고, 잠깐 웃게 만드는 작은 SEO 실험.</p>
            <p>{siteConfig.domain} 준비용 MVP</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
