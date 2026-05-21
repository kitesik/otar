import { ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { LiveDelightCard } from "@/components/live-delight-card";
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
        <h1 className="min-w-0 max-w-full text-[clamp(1.45rem,5.6vw,3.5rem)] font-black leading-tight tracking-normal">
          <span className="wrap-anywhere block">
            <span className="text-emerald-600">{typoLabel}</span>를 치셨나요?
          </span>
          <span className="block">오늘 기분 좋아지는 사진</span>
          <span className="block">하나 보고 가세요.</span>
        </h1>

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

        <section className="mt-7 max-w-2xl space-y-2 text-xs leading-6 text-zinc-500">
          <h2 className="font-bold text-zinc-700">
            이 페이지로 랜딩되는 오타/검색어
          </h2>
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
