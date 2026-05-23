import type { TypoIntent } from "@/lib/site";

function compact(value: string) {
  return value.toLowerCase().replace(/[\s._-]+/g, "");
}

function hashString(value: string) {
  return value.split("").reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 7);
}

function hasJamo(value: string) {
  return /[ㄱ-ㅎㅏ-ㅣ]/.test(value);
}

function isSingleDeletion(source: string, target: string) {
  if (source.length !== target.length + 1) {
    return false;
  }

  return source.split("").some((_, index) => {
    return `${source.slice(0, index)}${source.slice(index + 1)}` === target;
  });
}

function isSingleDuplication(source: string, target: string) {
  return isSingleDeletion(target, source);
}

function isSingleSwap(source: string, target: string) {
  if (source.length !== target.length) {
    return false;
  }

  for (let index = 0; index < source.length - 1; index += 1) {
    const swapped = `${source.slice(0, index)}${source[index + 1]}${source[index]}${source.slice(index + 2)}`;

    if (swapped === target) {
      return true;
    }
  }

  return false;
}

function differentLetterCount(source: string, target: string) {
  if (source.length !== target.length) {
    return Number.POSITIVE_INFINITY;
  }

  return source.split("").reduce((count, char, index) => {
    return count + (char === target[index] ? 0 : 1);
  }, 0);
}

function bestAlias(intent: TypoIntent, typoLabel: string) {
  const typo = compact(typoLabel);
  const candidates = [intent.intendedService, ...intent.aliases].map(compact);
  const patternMatch = candidates.find((alias) => {
    return (
      isSingleDuplication(alias, typo) ||
      isSingleDeletion(alias, typo) ||
      isSingleSwap(alias, typo) ||
      differentLetterCount(alias, typo) === 1
    );
  });

  if (patternMatch) {
    return patternMatch;
  }

  return candidates.reduce(
    (best, alias) => {
      const distance = Math.abs(alias.length - typo.length) + differentLetterCount(
        alias.slice(0, Math.min(alias.length, typo.length)),
        typo.slice(0, Math.min(alias.length, typo.length)),
      );

      return distance < best.distance ? { alias, distance } : best;
    },
    { alias: candidates[0] ?? intent.slug, distance: Number.POSITIVE_INFINITY },
  ).alias;
}

export function getTypoPageCopy(intent: TypoIntent, typoLabel: string) {
  const typo = compact(typoLabel);
  const alias = bestAlias(intent, typoLabel);
  const service = intent.intendedService;

  if (hasJamo(typoLabel)) {
    return {
      reason: `${typoLabel}는 ${service}를 열려던 손이 자판 상태를 미처 바꾸지 못했을 때 생기기 쉬운 입력이에요.`,
      reassurance: "주소창이 잠깐 엇나갔을 뿐이고, 목적지는 바로 아래 버튼으로 이어집니다.",
    };
  }

  if (typoLabel.includes(".") || /\bcom\b/i.test(typoLabel)) {
    return {
      reason: `${typoLabel}는 ${service}를 주소처럼 끝까지 치다가 점이나 com이 섞인 형태로 보입니다.`,
      reassurance: "검색 결과에서는 이런 주소형 입력도 따로 알아볼 수 있게 정리해 둡니다.",
    };
  }

  if (isSingleDuplication(alias, typo)) {
    return {
      reason: `${typoLabel}는 ${service}로 가는 이름에서 글자 하나가 한 번 더 눌린 형태예요.`,
      reassurance: "급하게 입력하면 충분히 생길 수 있는 작은 반복이라, 여기서 바로 쉬어가면 됩니다.",
    };
  }

  if (isSingleDeletion(alias, typo)) {
    return {
      reason: `${typoLabel}는 ${service}로 가는 이름에서 글자 하나가 빠진 형태예요.`,
      reassurance: "주소창 자동완성을 믿고 빠르게 치다 보면 이런 짧은 입력이 자주 생깁니다.",
    };
  }

  if (isSingleSwap(alias, typo)) {
    return {
      reason: `${typoLabel}는 ${service}로 가는 이름에서 가까운 두 글자의 순서가 바뀐 형태예요.`,
      reassurance: "손이 머리보다 조금 빨랐던 흔적이라, 원래 목적지는 바로 이어드립니다.",
    };
  }

  if (differentLetterCount(alias, typo) === 1) {
    return {
      reason: `${typoLabel}는 ${service}를 치는 중 근처 글자 하나가 대신 들어간 형태로 보입니다.`,
      reassurance: "딱 한 키 차이의 입력도 별도 페이지로 구분해 원래 목적지를 찾기 쉽게 했습니다.",
    };
  }

  if (typo.length <= 3) {
    return {
      reason: `${typoLabel}는 ${service}를 자동완성으로 열려고 짧게 입력하다가 남은 흔적일 수 있어요.`,
      reassurance: "짧은 검색어일수록 의도가 섞이기 쉬워서 이 페이지에서 목적지를 분명히 보여줍니다.",
    };
  }

  return {
    reason: `${typoLabel}는 ${service}를 빠르게 입력하는 과정에서 생길 수 있는 변형 문자열이에요.`,
    reassurance: "큰 설명은 줄이고, 같은 목적지로 이어지는 입력만 조용히 모아두었습니다.",
  };
}

export function getVariantQueries(
  intent: TypoIntent,
  typoLabel: string,
  limit?: number,
) {
  const relatedQueries = intent.queries.filter((query) => query !== typoLabel);
  const offset = relatedQueries.length > 0
    ? hashString(`${intent.slug}:${typoLabel}`) % relatedQueries.length
    : 0;
  const rotated = [
    ...relatedQueries.slice(offset),
    ...relatedQueries.slice(0, offset),
  ];

  return typeof limit === "number" ? rotated.slice(0, limit) : rotated;
}
