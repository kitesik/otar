import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, Home, Play } from "lucide-react";
import Link from "next/link";
import { DelightCard } from "@/components/delight-card";
import { IntentLinks } from "@/components/intent-links";
import { JsonLd } from "@/components/json-ld";
import {
  absoluteUrl,
  delightItems,
  getIntentBySlug,
  getTodayDelight,
  siteConfig,
  typoIntents,
} from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return typoIntents.map((intent) => ({ slug: intent.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const intent = getIntentBySlug(slug);

  if (!intent) {
    return {};
  }

  const canonical = intent.canonicalPath;
  const shouldIndex = intent.indexingMode === "index";
  const title = `${intent.queries[0]} - ${intent.intendedService} 오타 쉼터`;
  const description = `${intent.explanation} 바로 ${intent.intendedService}로 이동하거나 오늘의 작은 기분 전환을 보고 가세요.`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: shouldIndex,
      follow: true,
    },
    keywords: intent.keywordCluster,
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      images: ["/opengraph-image"],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function OopsPage({ params }: PageProps) {
  const { slug } = await params;
  const intent = getIntentBySlug(slug);

  if (!intent) {
    notFound();
  }

  const today = getTodayDelight();
  const isCalendar = intent.intendedService === "Google Calendar";
  const relatedItems = delightItems.filter((item) =>
    item.tags.some((tag) => intent.keywordCluster.join(" ").includes(tag)),
  );

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${intent.queries[0]} 오타 쉼터`,
          url: absoluteUrl(`/oops/${intent.slug}`),
          inLanguage: intent.locale,
          description: intent.explanation,
          isPartOf: {
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
          },
        }}
      />
      <section className="border-b border-black/10 bg-[#fffdf7]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="space-y-7">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-bold text-zinc-700"
            >
              <Home aria-hidden="true" size={16} />
              ㅊ미 홈
            </Link>
            <div className="space-y-4">
              <p className="text-sm font-black uppercase tracking-normal text-rose-800">
                {intent.intentLabel}
              </p>
              <h1 className="text-5xl font-black leading-[1.05] tracking-normal sm:text-6xl">
                {intent.queries[0]}
              </h1>
              <p className="wrap-anywhere max-w-2xl text-xl leading-8 text-zinc-700 [word-break:break-all]">
                {intent.explanation} {intent.wink}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={intent.destinationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-zinc-950 px-5 py-3 font-bold text-white transition hover:bg-zinc-800"
              >
                {isCalendar ? (
                  <CalendarDays aria-hidden="true" size={20} />
                ) : (
                  <Play aria-hidden="true" size={20} />
                )}
                {intent.intendedService} 열기
                <ExternalLink aria-hidden="true" size={16} />
              </a>
              <Link
                href="/dictionary"
                className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-black/15 bg-white px-5 py-3 font-bold transition hover:border-black/30 hover:bg-sky-50"
              >
                오타 사전 보기
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {intent.queries.slice(0, 14).map((query) => (
                <span
                  key={query}
                  className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-950"
                >
                  {query}
                </span>
              ))}
            </div>
            <div className="grid gap-3 rounded-[8px] border border-black/10 bg-white p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold text-zinc-600">인덱싱</p>
                <p className="font-black">{intent.indexingMode}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-600">검색어 커버</p>
                <p className="font-black">{intent.queries.length}개</p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-600">지역</p>
                <p className="font-black">{intent.region}</p>
              </div>
            </div>
          </div>
          <DelightCard item={today} />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            <p className="text-sm font-black uppercase tracking-normal text-rose-800">
              SEO coverage
            </p>
            <h2 className="text-3xl font-black">이 페이지가 커버하는 검색어</h2>
            <p className="leading-7 text-zinc-700">{intent.audienceNote}</p>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black">주소창 alias</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {intent.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-900"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black">대표 오타 후보</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {intent.typoExamples.map((query) => (
                  <span
                    key={query}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-700"
                  >
                    {query}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef8f4]">
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-12">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-emerald-800">
              Related mood
            </p>
            <h2 className="mt-2 text-3xl font-black">이 오타에 어울리는 것들</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {(relatedItems.length ? relatedItems : delightItems.slice(1, 4)).map(
              (item) => (
                <DelightCard key={item.date} item={item} compact />
              ),
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ff]">
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-12">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-violet-800">
              More typos
            </p>
            <h2 className="mt-2 text-3xl font-black">다른 오타 구경하기</h2>
          </div>
          <IntentLinks currentSlug={intent.slug} />
        </div>
      </section>
    </main>
  );
}
