import Link from "next/link";
import type { TypoIntent } from "@/lib/site";
import { getTypoPageCopy, getVariantQueries } from "@/lib/typo-page-copy";

type TypoSeoContextProps = {
  intent: TypoIntent;
  typoLabel: string;
  relatedIntents: TypoIntent[];
  queryLimit?: number;
};

export function TypoSeoContext({
  intent,
  typoLabel,
  relatedIntents,
  queryLimit = 14,
}: TypoSeoContextProps) {
  const sectionId = `typo-context-${intent.slug}`;
  const typoCopy = getTypoPageCopy(intent, typoLabel);
  const relatedQueries = getVariantQueries(intent, typoLabel);
  const visibleQueries = relatedQueries.slice(0, queryLimit);
  const remainingQueries = relatedQueries.slice(queryLimit);
  const related = relatedIntents
    .filter((relatedIntent) => relatedIntent.slug !== intent.slug)
    .slice(0, 5);

  return (
    <section
      aria-labelledby={sectionId}
      className="font-soft mt-7 max-w-2xl space-y-4 text-left text-xs leading-6 text-zinc-500"
    >
      <div className="space-y-2">
        <h2 id={sectionId} className="text-sm font-black text-zinc-800">
          {typoLabel}는 {intent.intendedService} 오타예요
        </h2>
        <p className="text-zinc-600">
          주소창에서 {intent.intendedService}를 열려고 하다가 {typoLabel}
          처럼 입력된 경우를 위한 페이지입니다. {intent.explanation}
        </p>
        <p className="text-zinc-600">
          {typoCopy.reason} {typoCopy.reassurance}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-zinc-700">현재 페이지의 오타/검색어</h3>
        <ul className="flex flex-wrap gap-2" aria-label={`${typoLabel} 현재 검색어`}>
          <li className="wrap-anywhere rounded-[6px] border border-emerald-200 bg-emerald-50 px-2 py-1 font-black text-emerald-700 [word-break:break-all]">
            {typoLabel}
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-zinc-700">
          같은 목적지로 이어지는 관련 입력
        </h3>
        <ul className="flex flex-wrap gap-2" aria-label={`${typoLabel} 관련 입력`}>
          {visibleQueries.map((query) => (
            <li
              key={query}
              className="wrap-anywhere rounded-[6px] border border-zinc-200 px-2 py-1 text-zinc-600 [word-break:break-all]"
            >
              {query}
            </li>
          ))}
        </ul>
        {remainingQueries.length > 0 ? (
          <details className="group rounded-[8px] border border-zinc-200 bg-zinc-50 p-3">
            <summary className="cursor-pointer text-xs font-black text-zinc-700">
              오타 후보 {remainingQueries.length}개 더 보기
            </summary>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${typoLabel} 추가 검색어`}>
              {remainingQueries.slice(0, 96).map((query) => (
                <li
                  key={query}
                  className="wrap-anywhere rounded-[6px] bg-white px-2 py-1 text-zinc-500 [word-break:break-all]"
                >
                  {query}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>

      {related.length > 0 ? (
        <nav aria-label="비슷한 오타" className="space-y-2">
          <h3 className="font-bold text-zinc-700">비슷한 오타도 있어요</h3>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {related.map((relatedIntent) => {
              const relatedLabel =
                relatedIntent.typoExamples[0] ?? relatedIntent.slug;

              return (
                <li key={relatedIntent.slug}>
                  <Link
                    href={relatedIntent.canonicalPath}
                    className="text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition hover:text-emerald-700"
                  >
                    {relatedLabel} → {relatedIntent.intendedService}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}
