import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import {
  absoluteUrl,
  getIntentsByCategory,
  serviceCategories,
  siteConfig,
  typoIntents,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "오타 의도 사전",
  description:
    "ㅊ미, yoi, yoiu, youtub처럼 주소창에서 자주 생기는 오타와 원래 의도를 정리한 사전입니다.",
  alternates: {
    canonical: "/dictionary",
  },
  openGraph: {
    title: "오타 의도 사전 | ㅊ미",
    description:
      "주소창 오타와 한영 전환 실수를 모아 원래 의도와 바로가기까지 정리합니다.",
    url: absoluteUrl("/dictionary"),
    images: ["/opengraph-image"],
  },
};

export default function DictionaryPage() {
  const queryCount = typoIntents.reduce(
    (total, intent) => total + intent.queries.length,
    0,
  );

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "홈",
              item: siteConfig.url,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "오타 의도 사전",
              item: absoluteUrl("/dictionary"),
            },
          ],
        }}
      />
      <section className="border-b border-black/10 bg-[#fffdf7]">
        <div className="mx-auto max-w-6xl space-y-5 px-5 py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
            <Search aria-hidden="true" size={16} />
            Typo intent dictionary
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-normal sm:text-6xl">
            오타에도 목적지가 있습니다
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-700">
            MVP에서는 대량 자동 생성 대신, 검색 의도와 실제 유머 경험을 함께
            만들 수 있는 오타만 다룹니다. 비슷한 오타는 대표 페이지로
            canonical을 모아 얇은 페이지 문제를 줄입니다.
          </p>
          <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
            <div className="rounded-[8px] border border-black/10 bg-white p-4">
              <strong className="block text-2xl">{typoIntents.length}</strong>
              <span className="text-sm font-bold text-zinc-600">대표 서비스</span>
            </div>
            <div className="rounded-[8px] border border-black/10 bg-white p-4">
              <strong className="block text-2xl">{queryCount}</strong>
              <span className="text-sm font-bold text-zinc-600">검색어 후보</span>
            </div>
            <div className="rounded-[8px] border border-black/10 bg-white p-4">
              <strong className="block text-2xl">{serviceCategories.length}</strong>
              <span className="text-sm font-bold text-zinc-600">카테고리</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef8f4]">
        <div className="mx-auto max-w-6xl space-y-10 px-5 py-12">
          {serviceCategories.map((category) => {
            const intents = getIntentsByCategory(category);

            return (
              <section key={category} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-normal text-emerald-800">
                      {category}
                    </p>
                    <h2 className="text-3xl font-black">{intents.length}개 서비스</h2>
                  </div>
                  <p className="text-sm font-bold text-zinc-600">
                    대표 페이지는 index, 변형 검색어는 본문/사전에서 커버
                  </p>
                </div>
                <div className="grid gap-4">
                  {intents.map((intent) => (
                    <Link
                      key={intent.slug}
                      href={`/oops/${intent.slug}`}
                      className="rounded-[8px] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-black/25"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-2xl">
                              {intent.intendedService}
                            </strong>
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-950">
                              {intent.indexingMode}
                            </span>
                            <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700">
                              {intent.region}
                            </span>
                          </div>
                          <p className="text-base leading-7 text-zinc-700">
                            {intent.explanation}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {intent.queries.slice(0, 18).map((query) => (
                              <span
                                key={query}
                                className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700"
                              >
                                {query}
                              </span>
                            ))}
                            {intent.queries.length > 18 ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
                                +{intent.queries.length - 18}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <ArrowRight
                          aria-hidden="true"
                          className="shrink-0"
                          size={22}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
