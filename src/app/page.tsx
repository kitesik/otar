import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { LiveDelightCard } from "@/components/live-delight-card";
import { VisitCounter } from "@/components/visit-counter";
import {
  absoluteUrl,
  getFeaturedIntents,
  getTodayDelight,
  siteConfig,
  typoIntents,
} from "@/lib/site";

const featuredIntents = getFeaturedIntents();

export const metadata: Metadata = {
  title: "otar.site | 잘못 친 주소도 괜찮아요",
  description:
    "주소창에 ㅊ미, yoi, chatgtp처럼 잘못 입력한 사람을 위한 오타 랜딩 허브입니다. 귀여운 사진 하나 보고, 원래 가려던 사이트로 바로 돌아가세요.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "otar.site",
    "ㅊ미",
    "ccal",
    "caal",
    "yoi",
    "yoiu",
    "chatgtp",
    "cluade",
  ],
  openGraph: {
    title: "otar.site | 잘못 친 주소도 괜찮아요",
    description:
      "잘못 친 주소도 괜찮아요. 귀여운 사진 하나 보고 원래 가려던 곳으로 돌아가세요.",
    url: siteConfig.url,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "otar.site 오타 쉼터 미리보기",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "otar.site | 잘못 친 주소도 괜찮아요",
    description:
      "잘못 친 주소도 괜찮아요. 귀여운 사진 하나 보고 원래 가려던 곳으로 돌아가세요.",
    images: ["/opengraph-image"],
  },
};

export default function Home() {
  const today = getTodayDelight();

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-zinc-950 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          alternateName: ["오타", "오타 사이트", "주소창 오타 쉼터"],
          url: siteConfig.url,
          description: siteConfig.description,
          inLanguage: "ko-KR",
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.url}/dictionary?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "otar.site 오타 랜딩 허브",
          url: siteConfig.url,
          inLanguage: "ko-KR",
          description:
            "주소창에 잘못 입력한 문자열로 들어온 사람을 위한 오타 의도 사전과 힐링 사진 페이지입니다.",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: typoIntents.length,
            itemListElement: featuredIntents.map((intent, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `${intent.typoExamples[0] ?? intent.slug} → ${intent.intendedService}`,
              url: absoluteUrl(intent.canonicalPath),
            })),
          },
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: absoluteUrl("/opengraph-image"),
            width: 1200,
            height: 630,
          },
        }}
      />

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <p className="font-soft text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
          otar.site
        </p>
        <h1 className="font-gungsuh mt-3 min-w-0 max-w-full text-[clamp(2.1rem,8.5vw,4.8rem)] font-black leading-tight tracking-normal">
          오타여도 괜찮아요
        </h1>
        <h2 className="font-soft mt-3 max-w-full text-[clamp(1.15rem,4.5vw,1.8rem)] font-black leading-tight tracking-normal text-zinc-600">
          힐링 하고 가요.
        </h2>

        <LiveDelightCard fallback={today} />

        <VisitCounter slug="home" />

        <nav
          aria-label="대표 오타 페이지"
          className="font-soft mt-8 grid w-full gap-3 text-left sm:grid-cols-2"
        >
          {featuredIntents.map((intent) => {
            const typoLabel = intent.typoExamples[0] ?? intent.slug;

            return (
              <Link
                key={intent.slug}
                href={intent.canonicalPath}
                className="group rounded-[8px] border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-black/25"
              >
                <span className="text-sm font-black text-emerald-700">
                  {typoLabel}
                </span>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <strong className="text-base font-black text-zinc-950">
                    {intent.intendedService} 오타
                  </strong>
                  <ArrowRight
                    aria-hidden="true"
                    size={18}
                    className="shrink-0 transition group-hover:translate-x-1"
                  />
                </div>
                <p className="mt-2 text-sm font-bold leading-6 text-zinc-500">
                  {intent.queries.slice(0, 4).join(" · ")}
                </p>
              </Link>
            );
          })}
        </nav>

        <div className="font-soft mt-7 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <Link
            href="/dictionary"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[8px] bg-zinc-950 px-5 py-3 text-base font-black text-white transition hover:bg-zinc-800"
          >
            <BookOpen aria-hidden="true" size={18} />
            오타 사전 보기
          </Link>
          <Link
            href="/oops/chmi"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[8px] border border-black/15 bg-white px-5 py-3 text-base font-black text-zinc-950 transition hover:bg-zinc-50"
          >
            <Sparkles aria-hidden="true" size={18} />
            ㅊ미 페이지
          </Link>
        </div>

        <section
          aria-labelledby="home-seo-heading"
          className="font-soft mt-10 w-full text-left text-sm leading-7 text-zinc-650"
        >
          <h2
            id="home-seo-heading"
            className="text-base font-black text-zinc-950"
          >
            주소창 오타를 모아두는 작은 쉼터예요
          </h2>
          <p className="mt-3">
            otar.site는 ㅊ미, ccal, caal, yoi, yoiu, chatgtp처럼 원래 가려던
            사이트를 주소창에 잘못 입력했을 때 잠깐 들를 수 있는 페이지입니다.
            현재 {typoIntents.length.toLocaleString("ko-KR")}개의 서비스 오타
            의도를 정리하고 있고, 각 페이지는 원래 목적지로 바로 이동할 수 있는
            링크와 관련 검색어를 함께 제공합니다.
          </p>
        </section>
      </section>
    </main>
  );
}
