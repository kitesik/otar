import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { DelightItem } from "@/lib/site";

type DelightCardProps = {
  item: DelightItem;
  compact?: boolean;
};

export function DelightCard({ item, compact = false }: DelightCardProps) {
  return (
    <article className="min-w-0 overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-sm">
      <div className={compact ? "relative aspect-[4/3]" : "relative aspect-[16/10]"}>
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          priority={!compact}
          sizes={compact ? "(max-width: 768px) 100vw, 33vw" : "100vw"}
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-emerald-700">
          <time dateTime={item.date}>{item.date}</time>
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-50 px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          <h2
            className={
              compact
                ? "wrap-anywhere text-xl font-bold [word-break:break-all]"
                : "wrap-anywhere text-3xl font-black [word-break:break-all]"
            }
          >
            {item.title}
          </h2>
          <p className="text-base leading-7 text-zinc-650">{item.caption}</p>
        </div>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 underline-offset-4 hover:text-black hover:underline"
        >
          출처 및 라이선스: {item.sourceLicense}
          <ExternalLink aria-hidden="true" size={14} />
        </a>
      </div>
    </article>
  );
}
