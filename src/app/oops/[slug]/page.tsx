import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { LiveDelightCard } from "@/components/live-delight-card";
import {
  absoluteUrl,
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

  const title = `${intent.intendedService}로 가고 싶으셨나요?`;
  const description = `${intent.intendedService} 주소창 오타로 들어온 사람을 위한 오늘의 밈과 바로가기 페이지입니다. 검색어: ${intent.queries
    .slice(0, 8)
    .join(", ")}`;

  return {
    title,
    description,
    alternates: {
      canonical: intent.canonicalPath,
    },
    robots: {
      index: intent.indexingMode === "index",
      follow: true,
    },
    keywords: intent.keywordCluster,
    openGraph: {
      title,
      description,
      url: absoluteUrl(intent.canonicalPath),
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

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-zinc-950 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${intent.intendedService} 오타 랜딩`,
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

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <h1 className="min-w-0 max-w-full text-[clamp(1.65rem,6.4vw,3.75rem)] font-black leading-tight tracking-normal">
          <span className="block break-words">{intent.intendedService}로 가고</span>
          <span className="block">싶으셨나요?</span>
          <span className="block whitespace-nowrap">오늘의 밈 보고 가세요</span>
        </h1>

        <LiveDelightCard fallback={today} />

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
            {intent.queries.slice(0, 32).join(" · ")}
          </p>
        </section>
      </section>
    </main>
  );
}
