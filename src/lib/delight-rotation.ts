export type DelightCandidate = {
  id: string;
  source: "귀여운 사진" | "자연 사진" | "큐레이션";
  title: string;
  caption: string;
  image: string;
  imageAlt: string;
  sourceUrl: string;
  sourceLicense: string;
};

const HOUR_MS = 60 * 60 * 1000;

export const localDelightImages: DelightCandidate[] = [
  "hourly-01.jpg",
  "hourly-02.jpg",
  "hourly-03.jpg",
  "hourly-04.jpg",
  "hourly-05.jpg",
  "hourly-06.jpg",
  "hourly-07.jpg",
  "hourly-08.jpg",
  "hourly-09.jpg",
  "hourly-10.jpg",
  "hourly-11.jpg",
].map((fileName, index) => ({
  id: `local-delight-${index + 1}`,
  source: "큐레이션",
  title: "오늘의 힐링 사진",
  caption: "복이 찾아 올거에요🍀",
  image: `/delight/${fileName}`,
  imageAlt: "기분 좋아지는 오늘의 사진",
  sourceUrl: "/",
  sourceLicense: "Owner-provided local image",
}));

function gcd(left: number, right: number): number {
  return right === 0 ? left : gcd(right, left % right);
}

function coprimeStep(total: number) {
  if (total <= 1) {
    return 1;
  }

  for (let step = Math.floor(total / 2) || 1; step < total; step += 1) {
    if (gcd(step, total) === 1) {
      return step;
    }
  }

  return 1;
}

export function getHourlyDelight(now = new Date()) {
  const total = localDelightImages.length;

  if (total === 0) {
    return null;
  }

  const hourSlot = Math.floor(now.getTime() / HOUR_MS);
  const step = coprimeStep(total);
  const seedOffset = 3;
  const index = ((hourSlot * step + seedOffset) % total + total) % total;

  return {
    active: localDelightImages[index],
    currentHour: new Date(hourSlot * HOUR_MS).toISOString(),
    nextUpdateAt: new Date((hourSlot + 1) * HOUR_MS).toISOString(),
    total,
    repeatWindowHours: Math.min(total, 6),
  };
}
