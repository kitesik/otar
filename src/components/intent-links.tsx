import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { typoIntents } from "@/lib/site";

export function IntentLinks({ currentSlug }: { currentSlug?: string }) {
  const uniqueIntents = typoIntents.filter(
    (intent) =>
      intent.indexingMode === "index" && intent.slug !== currentSlug,
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {uniqueIntents.map((intent) => (
        <Link
          key={intent.slug}
          href={`/oops/${intent.slug}`}
          className="group rounded-[8px] border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-black/25"
        >
          <span className="text-sm font-semibold text-rose-700">
            {intent.queries[0]}
          </span>
          <div className="mt-2 flex items-center justify-between gap-3">
            <strong className="text-lg">{intent.intentLabel}</strong>
            <ArrowRight
              aria-hidden="true"
              size={18}
              className="shrink-0 transition group-hover:translate-x-1"
            />
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {intent.intendedService}로 가려던 사람을 위한 페이지
          </p>
        </Link>
      ))}
    </div>
  );
}
