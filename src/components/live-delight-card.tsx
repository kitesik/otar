"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { DelightItem } from "@/lib/site";

type LiveDelight = {
  id: string;
  source: "Reddit" | "GIPHY" | "Fallback";
  title: string;
  caption: string;
  image: string;
  imageAlt: string;
  sourceUrl: string;
  sourceLicense: string;
};

type RedditResponse = {
  candidates?: LiveDelight[];
};

type GiphyGif = {
  id: string;
  title?: string;
  url?: string;
  images?: {
    downsized_medium?: {
      url?: string;
    };
    fixed_height?: {
      url?: string;
    };
    original?: {
      url?: string;
    };
  };
  user?: {
    display_name?: string;
    username?: string;
  };
};

type GiphyResponse = {
  data?: GiphyGif[];
};

function fallbackToLive(item: DelightItem): LiveDelight {
  return {
    id: `fallback-${item.date}`,
    source: "Fallback",
    title: item.title,
    caption: item.caption,
    image: item.image,
    imageAlt: item.imageAlt,
    sourceUrl: item.sourceUrl,
    sourceLicense: item.sourceLicense,
  };
}

function pickDaily(items: LiveDelight[]) {
  if (items.length === 0) {
    return null;
  }

  const now = new Date();
  const seed =
    now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
  return items[seed % items.length];
}

export function LiveDelightCard({ fallback }: { fallback: DelightItem }) {
  const fallbackItem = useMemo(() => fallbackToLive(fallback), [fallback]);
  const [items, setItems] = useState<LiveDelight[]>([fallbackItem]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState("라이브 후보를 불러오는 중");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const nextItems: LiveDelight[] = [];

      try {
        const response = await fetch("/api/reddit-delight");
        const payload = (await response.json()) as RedditResponse;
        nextItems.push(...(payload.candidates ?? []));
      } catch {
        // Keep the fallback item when Reddit is temporarily unavailable.
      }

      const giphyKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

      if (giphyKey) {
        try {
          const response = await fetch(
            `https://api.giphy.com/v1/gifs/trending?api_key=${giphyKey}&limit=12&rating=g&bundle=messaging_non_clips`,
          );
          const payload = (await response.json()) as GiphyResponse;
          const gifs =
            payload.data?.map((gif) => ({
              id: `giphy-${gif.id}`,
              source: "GIPHY" as const,
              title: gif.title || "오늘의 트렌딩 GIF",
              caption: `${gif.user?.display_name || gif.user?.username || "GIPHY"} 트렌딩 GIF`,
              image:
                gif.images?.downsized_medium?.url ||
                gif.images?.fixed_height?.url ||
                gif.images?.original?.url ||
                "",
              imageAlt: gif.title || "GIPHY 트렌딩 GIF",
              sourceUrl: gif.url || "https://giphy.com/",
              sourceLicense: "GIPHY API trending result",
            })) ?? [];

          nextItems.push(...gifs.filter((gif) => gif.image));
        } catch {
          // GIPHY is optional for local preview.
        }
      }

      if (cancelled) {
        return;
      }

      const uniqueItems = [fallbackItem, ...nextItems].filter(
        (item, index, all) =>
          item.image && all.findIndex((candidate) => candidate.image === item.image) === index,
      );
      const dailyPick = pickDaily(uniqueItems) ?? fallbackItem;
      const dailyIndex = uniqueItems.findIndex((item) => item.id === dailyPick.id);

      setItems(uniqueItems);
      setActiveIndex(Math.max(0, dailyIndex));
      setStatus(
        nextItems.length > 0
          ? `${nextItems.length}개 라이브 후보 중 오늘의 1개`
          : "API 키 없이 기본 귀여운 사진 표시 중",
      );
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [fallbackItem]);

  const active = items[activeIndex] ?? fallbackItem;

  return (
    <figure className="mt-9 w-full min-w-0 max-w-full overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-sm sm:max-w-xl">
      <div className="relative aspect-[4/3] bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.image}
          alt={active.imageAlt}
          className="h-full w-full object-contain"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-zinc-800 shadow-sm">
          {active.source}
        </div>
      </div>
      <figcaption className="space-y-4 px-4 py-4 text-left">
        <div className="space-y-2">
          <p className="text-lg font-black">{active.title}</p>
          <p className="text-sm leading-6 text-zinc-650">{active.caption}</p>
          <p className="text-xs font-bold text-zinc-500">{status}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={active.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 underline-offset-4 hover:text-black hover:underline"
          >
            출처 보기
            <ExternalLink aria-hidden="true" size={13} />
          </a>
          <button
            type="button"
            onClick={() => setActiveIndex((index) => (index + 1) % items.length)}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-black/10 px-3 py-2 text-xs font-black text-zinc-800 transition hover:bg-zinc-100"
          >
            <RefreshCw aria-hidden="true" size={13} />
            다른 후보 보기
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
