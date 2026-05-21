import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "otar.site | 오타 치고 들어온 사람을 위한 작은 쉼터",
    template: "%s | otar.site",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: siteConfig.name,
    title: "otar.site | 오타 치고 들어온 사람을 위한 작은 쉼터",
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "otar.site 오타 쉼터 미리보기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "otar.site | 오타 치고 들어온 사람을 위한 작은 쉼터",
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "otar.site",
    "오타",
    "주소창 오타",
    "한영키 오타",
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
      <body className="min-h-full bg-white">{children}</body>
    </html>
  );
}
