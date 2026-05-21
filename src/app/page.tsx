import Link from "next/link";
import { CalendarDays, Clapperboard, ExternalLink, Search } from "lucide-react";
import { DelightCard } from "@/components/delight-card";
import { IntentLinks } from "@/components/intent-links";
import { JsonLd } from "@/components/json-ld";
import {
  absoluteUrl,
  getTodayDelight,
  getFeaturedIntents,
  serviceCategories,
  siteConfig,
  typoIntents,
} from "@/lib/site";

export default function Home() {
  const today = getTodayDelight();
  const featuredIntents = getFeaturedIntents();
  const queryCount = typoIntents.reduce(
    (total, intent) => total + intent.queries.length,
    0,
  );

  return (
    <main>
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
      <section className="border-b border-black/10 bg-[#fffdf7]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-16">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800">
              <Search aria-hidden="true" size={16} />
              cal 치려다 ㅊ미가 된 사람에게
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-normal text-zinc-950 sm:text-7xl">
                ㅊ미
              </h1>
              <p className="wrap-anywhere max-w-2xl text-xl leading-8 text-zinc-700 [word-break:break-all]">
                한영키를 깜빡하고 주소창에 남긴 그 단어, 여기서는 꽤 괜찮은
                입장권입니다. 캘린더는 바로 열어드리고, 먼저 오늘의 기분 전환
                하나 놓고 갈게요.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-2">
              <div className="rounded-[8px] border border-black/10 bg-white p-3">
                <dt className="text-xs font-bold text-zinc-600">서비스</dt>
                <dd className="text-2xl font-black">{typoIntents.length}</dd>
              </div>
              <div className="rounded-[8px] border border-black/10 bg-white p-3">
                <dt className="text-xs font-bold text-zinc-600">검색어</dt>
                <dd className="text-2xl font-black">{queryCount}</dd>
              </div>
              <div className="rounded-[8px] border border-black/10 bg-white p-3">
                <dt className="text-xs font-bold text-zinc-600">분류</dt>
                <dd className="text-2xl font-black">{serviceCategories.length}</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://calendar.google.com/calendar/u/0/r"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-zinc-950 px-5 py-3 font-bold text-white transition hover:bg-zinc-800"
              >
                <CalendarDays aria-hidden="true" size={20} />
                구글 캘린더 열기
                <ExternalLink aria-hidden="true" size={16} />
              </a>
              <Link
                href="/oops/youtube-typo"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] border border-black/15 bg-white px-5 py-3 font-bold text-zinc-950 transition hover:border-black/30 hover:bg-sky-50"
              >
                <Clapperboard aria-hidden="true" size={20} />
                유튜브 오타 보기
              </Link>
            </div>
          </div>
          <DelightCard item={today} />
        </div>
      </section>

      <section className="bg-[#eef8f4]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <p className="text-sm font-black uppercase tracking-normal text-emerald-800">
              Typo intent dictionary
            </p>
            <h2 className="text-3xl font-black">오타도 의도가 있습니다</h2>
            <p className="leading-7 text-zinc-700">
              첫 MVP는 검증된 소수 키워드만 다룹니다. 같은 내용을 얇게
              복제하지 않고, 대표 의도 페이지로 묶어 검색엔진과 사람 모두에게
              덜 피곤하게 설계했습니다.
            </p>
            <Link
              href="/dictionary"
              className="inline-flex items-center gap-2 font-bold text-emerald-900 underline"
            >
              오타 사전 전체 보기
              <Search aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="grid gap-3">
            {featuredIntents.map((intent) => (
              <Link
                key={intent.slug}
                href={`/oops/${intent.slug}`}
                className="rounded-[8px] border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-black/25"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-lg">{intent.queries[0]}</strong>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
                    {intent.indexingMode}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-650">
                  {intent.intentLabel}
                </p>
                <p className="mt-2 text-xs font-bold text-zinc-600">
                  {intent.queries.length}개 검색어 커버
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-12">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-rose-800">
              Service coverage
            </p>
            <h2 className="mt-2 text-3xl font-black">
              한국과 글로벌 주소창 습관을 같이 잡습니다
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {serviceCategories.map((category) => {
              const count = typoIntents.filter(
                (intent) => intent.category === category,
              ).length;

              return (
                <Link
                  href="/dictionary"
                  key={category}
                  className="rounded-[8px] border border-black/10 bg-[#fffdf7] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-black/25"
                >
                  <strong className="block text-base">{category}</strong>
                  <span className="mt-2 block text-sm font-bold text-zinc-600">
                    {count}개 서비스
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ff]">
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-violet-800">
                Keep wandering
              </p>
              <h2 className="mt-2 text-3xl font-black">다른 오타도 구경하기</h2>
            </div>
            <Link href="/archive" className="font-bold text-violet-900 underline">
              지난 기분 전환 보기
            </Link>
          </div>
          <IntentLinks currentSlug="chmi" />
        </div>
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
    </main>
  );
}
