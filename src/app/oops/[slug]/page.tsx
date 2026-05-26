import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { LiveDelightCard } from "@/components/live-delight-card";
import { TrackedDestinationLink } from "@/components/tracked-destination-link";
import { TypoSeoContext } from "@/components/typo-seo-context";
import { VisitCounter } from "@/components/visit-counter";
import { getHourlyDelight } from "@/lib/delight-rotation";
import {
  absoluteUrl,
  type DelightItem,
  getIntentsByCategory,
  getLandingVariantBySlug,
  getLandingVariants,
  getTodayDelight,
  siteConfig,
} from "@/lib/site";
import { getTypoPageCopy, getVariantQueries } from "@/lib/typo-page-copy";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

function getSearchPreviewDelight(): DelightItem {
  const active = getHourlyDelight()?.active;

  if (!active) {
    return getTodayDelight();
  }

  return {
    date: active.id,
    title: active.title,
    caption: active.caption,
    image: active.image,
    imageAlt: active.imageAlt,
    sourceUrl: active.sourceUrl,
    sourceLicense: active.sourceLicense,
    tags: [active.source],
  };
}

export function generateStaticParams() {
  return getLandingVariants().map((variant) => ({ slug: variant.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const variant = getLandingVariantBySlug(slug);

  if (!variant) {
    return {};
  }

  const { intent } = variant;
  const typoLabel = variant.label;
  const typoCopy = getTypoPageCopy(intent, typoLabel);
  const metadataQueries = getVariantQueries(intent, typoLabel, 5);
  const previewDelight = getSearchPreviewDelight();
  const previewImageUrl = absoluteUrl(previewDelight.image);
  const title = `${typoLabel} 아 또 오타났네`;
  const description = `${typoCopy.reason} 귀여운 사진 하나 보고, 원래 목적지는 바로 열어보세요. 관련 입력: ${metadataQueries.join(", ")}`;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: variant.canonicalPath,
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
      ...intent.keywordCluster,
    ],
    openGraph: {
      title,
      description,
      url: absoluteUrl(variant.canonicalPath),
      images: [
        {
          url: previewImageUrl,
          alt: previewDelight.imageAlt,
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImageUrl],
    },
  };
}

export default async function OopsPage({ params }: PageProps) {
  const { slug } = await params;
  const variant = getLandingVariantBySlug(slug);

  if (!variant) {
    notFound();
  }

  const { intent } = variant;
  const today = getSearchPreviewDelight();
  const previewImageUrl = absoluteUrl(today.image);
  const typoLabel = variant.label;
  const relatedIntents = getIntentsByCategory(intent.category);

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-zinc-950 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${typoLabel}는 ${intent.intendedService} 오타예요`,
          url: absoluteUrl(variant.canonicalPath),
          inLanguage: intent.locale,
          description: `${getTypoPageCopy(intent, typoLabel).reason} 원래 목적지로 이동할 수 있게 돕는 페이지입니다.`,
          about: {
            "@type": "Thing",
            name: intent.intendedService,
            alternateName: getVariantQueries(intent, typoLabel, 12),
            sameAs: intent.destinationUrl,
          },
          mentions: getVariantQueries(intent, typoLabel, 12).map((query) => ({
            "@type": "DefinedTerm",
            name: query,
            inDefinedTermSet: absoluteUrl("/dictionary"),
          })),
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: previewImageUrl,
            caption: today.caption,
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
              item: absoluteUrl(variant.canonicalPath),
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

        <TrackedDestinationLink
          href={intent.destinationUrl}
          service={intent.intendedService}
          slug={variant.slug}
          className="font-soft mt-7 inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-[8px] bg-zinc-950 px-5 py-3 text-base font-black text-white transition hover:bg-zinc-800"
        >
          {intent.intendedService} 바로 열기
          <ExternalLink aria-hidden="true" size={18} />
        </TrackedDestinationLink>

        <VisitCounter slug={variant.slug} />

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
