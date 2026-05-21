import type { Metadata } from "next";
import { DelightCard } from "@/components/delight-card";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, delightItems, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "오늘의 사진 아카이브",
  description:
    "ㅊ미가 큐레이션한 귀여운 사진, 자연 사진, 짧은 기분 전환 기록을 모아둔 아카이브입니다.",
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: "오늘의 사진 아카이브 | ㅊ미",
    description:
      "자판 입력 실수로 도착한 사람들을 위해 주 3회 큐레이션하는 작은 기분 전환 모음.",
    url: absoluteUrl("/archive"),
    images: ["/opengraph-image"],
  },
};

export default function ArchivePage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "오늘의 사진 아카이브",
          url: absoluteUrl("/archive"),
          inLanguage: "ko-KR",
          isPartOf: {
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
          },
        }}
      />
      <section className="border-b border-black/10 bg-[#fffdf7]">
        <div className="mx-auto max-w-6xl space-y-5 px-5 py-12">
          <p className="text-sm font-black uppercase tracking-normal text-violet-800">
            Mood archive
          </p>
          <h1 className="max-w-3xl text-4xl font-black tracking-normal sm:text-6xl">
            지난 기분 전환
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-700">
            수동 큐레이션으로 고른 이미지와 짧은 문장을 모읍니다. 출처와
            라이선스는 각 항목에 남겨 SEO 실험이 콘텐츠 예의도 챙기도록
            했습니다.
          </p>
        </div>
      </section>

      <section className="bg-[#eef8f4]">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-2">
          {delightItems.map((item) => (
            <DelightCard key={item.date} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
