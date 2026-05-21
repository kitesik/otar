"use client";

import { useEffect, useMemo, useState } from "react";
import type { DelightItem } from "@/lib/site";

type LiveDelight = {
  id: string;
  source: "귀여운 사진" | "자연 사진" | "큐레이션";
  title: string;
  caption: string;
  image: string;
  imageAlt: string;
  sourceUrl: string;
  sourceLicense: string;
};

type DelightResponse = {
  active?: LiveDelight | null;
  candidates?: LiveDelight[];
};

function fallbackToLive(item: DelightItem): LiveDelight {
  return {
    id: `fallback-${item.date}`,
    source: "큐레이션",
    title: item.title,
    caption: item.caption,
    image: item.image,
    imageAlt: item.imageAlt,
    sourceUrl: item.sourceUrl,
    sourceLicense: item.sourceLicense,
  };
}

export function LiveDelightCard({ fallback }: { fallback: DelightItem }) {
  const fallbackItem = useMemo(() => fallbackToLive(fallback), [fallback]);
  const [active, setActive] = useState<LiveDelight>(fallbackItem);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let nextItem: LiveDelight | null = null;

      try {
        const response = await fetch("/api/delight");
        const payload = (await response.json()) as DelightResponse;
        nextItem = payload.active ?? payload.candidates?.[0] ?? null;
      } catch {
        // Keep the fallback item when live photo sources are temporarily unavailable.
      }

      if (cancelled) {
        return;
      }

      setActive(nextItem ?? fallbackItem);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [fallbackItem]);

  return (
    <figure className="mt-9 w-full min-w-0 max-w-full overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-sm sm:max-w-xl">
      <div className="aspect-[4/3] bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.image}
          alt={active.imageAlt}
          className="h-full w-full object-cover"
        />
      </div>
      <figcaption className="font-soft space-y-4 px-4 py-4 text-left">
        <p className="text-lg font-black">복이 찾아 올거에요🍀</p>
      </figcaption>
    </figure>
  );
}
