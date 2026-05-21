import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "ㅊ미 - 오타가 데려온 작은 샛길",
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
    title: "ㅊ미 - 오타가 데려온 작은 샛길",
    description: siteConfig.description,
    url: siteConfig.url,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ㅊ미 - 오타가 데려온 작은 샛길",
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
      <body className="min-h-full bg-white">{children}</body>
    </html>
  );
}
