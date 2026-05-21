import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { LiveDelightCard } from "@/components/live-delight-card";
import { TypoSeoContext } from "@/components/typo-seo-context";
import { VisitCounter } from "@/components/visit-counter";
import {
  absoluteUrl,
  getIntentBySlug,
  getIntentsByCategory,
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

  const typoLabel = intent.typoExamples[0] ?? intent.slug;
  const title = `${typoLabel} 또 눌렀죠? 힐링 하고 가요.`;
  const description = `${typoLabel}는 ${intent.intendedService}로 가려다 생길 수 있는 주소창 오타예요. 귀여운 사진 하나 보고, 원래 목적지는 바로 열어보세요. 검색어: ${intent.queries
    .slice(0, 6)
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
      googleBot: {
        index: intent.indexingMode === "index",
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    keywords: [
      typoLabel,
      `${typoLabel} 오타`,
      `${intent.intendedService} 오타`,
      ...intent.keywordCluster,
    ],
    openGraph: {
      title,
      description,
      url: absoluteUrl(intent.canonicalPath),
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${typoLabel} 오타 힐링 사진 미리보기`,
        },
      ],
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
  const typoLabel = intent.typoExamples[0] ?? intent.slug;
  const relatedIntents = getIntentsByCategory(intent.category);

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-zinc-950 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${typoLabel}는 ${intent.intendedService} 오타예요`,
          url: absoluteUrl(`/oops/${intent.slug}`),
          inLanguage: intent.locale,
          description: `${typoLabel}와 ${intent.intendedService} 관련 주소창 오타를 설명하고, 원래 목적지로 이동할 수 있게 돕는 페이지입니다.`,
          about: {
            "@type": "Thing",
            name: intent.intendedService,
            alternateName: intent.queries.slice(0, 12),
            sameAs: intent.destinationUrl,
          },
          mentions: intent.queries.slice(0, 12).map((query) => ({
            "@type": "DefinedTerm",
            name: query,
            inDefinedTermSet: absoluteUrl("/dictionary"),
          })),
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: absoluteUrl("/opengraph-image"),
            width: 1200,
            height: 630,
          },
          potentialAction: {
            "@type": "ViewAction",
            name: `${intent.intendedService} 바로 열기`,
            target: intent.destinationUrl,
          },
          isPartOf: {
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
          },
        }}
      />
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
            {
              "@type": "ListItem",
              position: 3,
              name: `${typoLabel} 오타`,
              item: absoluteUrl(intent.canonicalPath),
            },
          ],
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

        <TypoSeoContext
          intent={intent}
          typoLabel={typoLabel}
          relatedIntents={relatedIntents}
          queryLimit={16}
        />
      </section>
    </main>
  );
}
