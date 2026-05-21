"use client";

import { useEffect, useState } from "react";

type VisitCounts = {
  today: number;
  total: number;
  configured: boolean;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function getLocalDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function VisitCounter({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<VisitCounts>({
    today: 0,
    total: 0,
    configured: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const storageKey = `otar-visit-counted:${getLocalDate()}:${slug}`;
      const alreadyCounted =
        typeof window !== "undefined" && window.localStorage.getItem(storageKey);
      const response = await fetch("/api/visits", {
        method: alreadyCounted ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: alreadyCounted ? undefined : JSON.stringify({ slug }),
      });
      const payload = (await response.json()) as VisitCounts;

      if (!alreadyCounted) {
        window.localStorage.setItem(storageKey, "1");
      }

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
        오늘 {formatCount(counts.today)}명 / 누적 {formatCount(counts.total)}명
      </p>
      <p className="mt-1 text-xs font-bold text-zinc-500">
        이만큼의 사람들이 비슷한 샛길로 왔어요
      </p>
    </section>
  );
}
