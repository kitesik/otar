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
        <h1 className="min-w-0 max-w-full text-[clamp(2.25rem,10vw,4.75rem)] font-black leading-tight tracking-normal">
          <span className="block">항상</span>
          <span className="wrap-anywhere block text-emerald-600">{typoLabel}</span>
          <span className="block">를 누르는 당신,</span>
        </h1>
        <h2 className="mt-3 max-w-full text-[clamp(1.25rem,5vw,2rem)] font-black leading-tight tracking-normal text-zinc-600">
          당신을 위한 힐링 사진이에요
        </h2>

        <LiveDelightCard fallback={today} />

        <a
          href={intent.destinationUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-[8px] bg-zinc-950 px-5 py-3 text-base font-black text-white transition hover:bg-zinc-800"
        >
          {intent.intendedService} 바로 열기
          <ExternalLink aria-hidden="true" size={18} />
        </a>

        <VisitCounter slug={intent.slug} />

        <section className="mt-7 max-w-2xl space-y-2 text-xs leading-6 text-zinc-500">
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
