"use client";

import { useEffect, useRef, useState } from "react";

type VisitCounts = {
  today: number;
  total: number;
  configured: boolean;
  source?: string;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function VisitCounter({ slug }: { slug: string }) {
  const countedRef = useRef(false);
  const [counts, setCounts] = useState<VisitCounts>({
    today: 0,
    total: 0,
    configured: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (countedRef.current) {
        return;
      }

      countedRef.current = true;
      const response = await fetch("/api/visits", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          path: window.location.pathname,
          referrer: document.referrer,
          screen: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }),
      });
      const payload = (await response.json()) as VisitCounts;

      if (!cancelled) {
        setCounts(payload);
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setCounts({ today: 0, total: 0, configured: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <section className="font-soft mt-5 w-full max-w-sm rounded-[8px] border border-black/10 bg-zinc-50 px-4 py-3 text-center">
      <p className="text-sm font-black text-zinc-800">
        오늘{" "}
        <span className="text-emerald-700">{formatCount(counts.today)}명</span>
        {" / "}누적 {formatCount(counts.total)}명
      </p>
      <p className="mt-1 text-xs font-bold text-zinc-500">
        오타 동료들이 많아요
      </p>
    </section>
  );
}
