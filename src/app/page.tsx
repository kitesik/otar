import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { LiveDelightCard } from "@/components/live-delight-card";
import { VisitCounter } from "@/components/visit-counter";
import {
  absoluteUrl,
  getIntentBySlug,
  getTodayDelight,
  siteConfig,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "ㅊ미 또 눌렀죠? 힐링 하고 가요.",
  description:
    "cal을 치려다 ㅊ미를 입력한 사람을 위한 작은 오타 쉼터. 귀여운 사진 하나 보고, Google Calendar는 버튼으로 바로 열어보세요.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "ㅊ미",
    "ㅊ미 오타",
    "cal 한영",
    "cal 잘못침",
    "구글 캘린더 오타",
    "Google Calendar 오타",
  ],
  openGraph: {
    title: "ㅊ미 또 눌렀죠? 힐링 하고 가요.",
    description:
      "cal을 치려다 ㅊ미를 입력했다면, 귀여운 사진 하나 보고 원래 목적지로 돌아가세요.",
    url: siteConfig.url,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ㅊ미 오타 랜딩 페이지 미리보기",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ㅊ미 또 눌렀죠? 힐링 하고 가요.",
    description:
      "cal을 치려다 ㅊ미를 입력했다면, 귀여운 사진 하나 보고 원래 목적지로 돌아가세요.",
    images: ["/opengraph-image"],
  },
};

export default function Home() {
  const intent = getIntentBySlug("chmi");
  const today = getTodayDelight();

  if (!intent) {
    return null;
  }

  const typoLabel = intent.typoExamples[0] ?? intent.slug;

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-zinc-950 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          inLanguage: "ko-KR",
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.url}/dictionary?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <h1 className="font-gungsuh min-w-0 max-w-full text-[clamp(1.9rem,8.5vw,4.5rem)] font-black leading-tight tracking-normal">
          <span className="wrap-anywhere block text-emerald-600">{typoLabel}</span>
          <span className="block">또 눌렀죠?</span>
        </h1>
        <h2 className="font-soft mt-3 max-w-full text-[clamp(1.2rem,4.7vw,1.9rem)] font-black leading-tight tracking-normal text-zinc-600">
          힐링 하고 가요.
        </h2>

        <LiveDelightCard fallback={today} />

        <a
          href={intent.destinationUrl}
          target="_blank"
          rel="noreferrer"
          className="font-soft mt-7 inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-[8px] bg-zinc-950 px-5 py-3 text-base font-black text-white transition hover:bg-zinc-800"
        >
          {intent.intendedService} 바로 열기
          <ExternalLink aria-hidden="true" size={18} />
        </a>

        <VisitCounter slug={intent.slug} />

        <section className="font-soft mt-7 max-w-2xl space-y-2 text-xs leading-6 text-zinc-500">
          <h2 className="font-bold text-zinc-700">
            이 페이지로 랜딩되는 오타/검색어
          </h2>
          <p className="text-zinc-600">
            {typoLabel}는 {intent.intendedService}로 가려다 생길 수 있는
            주소창 오타예요. 원래 목적지는 아래 버튼으로 바로 열 수 있습니다.
          </p>
          <p className="wrap-anywhere [word-break:break-all]">
            {intent.queries.slice(0, 28).join(" · ")}
          </p>
        </section>

        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "홈",
                item: absoluteUrl("/"),
              },
            ],
          }}
        />
      </section>
    </main>
  );
}
