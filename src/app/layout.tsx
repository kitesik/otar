import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "ㅊ미 또 눌렀죠? 힐링 하고 가요.",
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
    title: "ㅊ미 또 눌렀죠? 힐링 하고 가요.",
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ㅊ미 오타 랜딩 페이지 미리보기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ㅊ미 또 눌렀죠? 힐링 하고 가요.",
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
