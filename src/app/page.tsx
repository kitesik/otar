import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
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
      <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className="wrap-anywhere max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-6xl">
          {intent.intendedService}로 가고 싶으셨나요?
          <br />
          오늘의 밈 보고 가세요
        </h1>

        <figure className="mt-9 w-full max-w-xl overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-sm">
          <div className="relative aspect-[4/3]">
            <Image
              src={today.image}
              alt={today.imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 92vw, 560px"
              className="object-cover"
              unoptimized
            />
          </div>
          <figcaption className="space-y-2 px-4 py-4 text-left">
            <p className="text-lg font-black">{today.title}</p>
            <p className="text-sm leading-6 text-zinc-650">{today.caption}</p>
          </figcaption>
        </figure>

        <a
          href={intent.destinationUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-[8px] bg-zinc-950 px-5 py-3 text-base font-black text-white transition hover:bg-zinc-800"
        >
          {intent.intendedService}로 가기
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
