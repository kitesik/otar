import { NextResponse } from "next/server";

type DelightCandidate = {
  id: string;
  source: "귀여운 사진" | "자연 사진" | "큐레이션";
  title: string;
  caption: string;
  image: string;
  imageAlt: string;
  sourceUrl: string;
  sourceLicense: string;
};

type CatApiImage = {
  id?: string;
  url?: string;
};

type DogApiResponse = {
  message?: string[];
  status?: string;
};

type UnsplashPhoto = {
  id: string;
  alt_description?: string | null;
  description?: string | null;
  links?: {
    html?: string;
  };
  urls?: {
    regular?: string;
    small?: string;
  };
  user?: {
    name?: string;
  };
};

type UnsplashResponse = {
  results?: UnsplashPhoto[];
};

const photoQueries = ["cute animals", "peaceful nature", "happy dog", "cozy cat"];

function fileNameFromUrl(url: string) {
  return decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "photo");
}

async function getCatCandidates(): Promise<DelightCandidate[]> {
  const response = await fetch(
    "https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg,png,webp&limit=6",
    {
      next: {
        revalidate: 60 * 30,
      },
    },
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as CatApiImage[];

  return payload
    .filter((item) => item.url)
    .map((item) => ({
      id: `cat-${item.id ?? item.url}`,
      source: "귀여운 사진",
      title: "오늘의 조용한 귀여움",
      caption: "주소창이 잠깐 돌아온 김에, 표정부터 풀고 가세요.",
      image: item.url ?? "",
      imageAlt: "오늘의 귀여운 사진",
      sourceUrl: "https://thecatapi.com/",
      sourceLicense: "The Cat API result",
    }));
}

async function getDogCandidates(): Promise<DelightCandidate[]> {
  const response = await fetch("https://dog.ceo/api/breeds/image/random/6", {
    next: {
      revalidate: 60 * 30,
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as DogApiResponse;

  return (payload.message ?? []).map((image) => ({
    id: `dog-${fileNameFromUrl(image)}`,
    source: "귀여운 사진",
    title: "오늘의 기분 좋은 얼굴",
    caption: "원래 가려던 곳은 잠시 뒤에. 지금은 3초만 웃고 가요.",
    image,
    imageAlt: "오늘의 귀여운 강아지 사진",
    sourceUrl: "https://dog.ceo/dog-api/",
    sourceLicense: "Dog CEO Dog API result",
  }));
}

async function getUnsplashCandidates(): Promise<DelightCandidate[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;

  if (!key) {
    return [];
  }

  const query = photoQueries[new Date().getUTCDate() % photoQueries.length];
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query,
    )}&orientation=landscape&per_page=8&content_filter=high`,
    {
      headers: {
        Authorization: `Client-ID ${key}`,
      },
      next: {
        revalidate: 60 * 60,
      },
    },
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as UnsplashResponse;

  return (payload.results ?? [])
    .filter((photo) => photo.urls?.regular || photo.urls?.small)
    .map((photo) => ({
      id: `unsplash-${photo.id}`,
      source: "자연 사진",
      title: "오늘의 숨 고르기",
      caption: `${photo.user?.name ?? "Unsplash"}의 사진. 잠깐 시선을 멀리 두고 가세요.`,
      image: photo.urls?.regular ?? photo.urls?.small ?? "",
      imageAlt: photo.alt_description ?? photo.description ?? "오늘의 자연 사진",
      sourceUrl: photo.links?.html ?? "https://unsplash.com/",
      sourceLicense: "Unsplash API result",
    }));
}

export async function GET() {
  const settled = await Promise.allSettled([
    getCatCandidates(),
    getDogCandidates(),
    getUnsplashCandidates(),
  ]);

  const candidates = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  const uniqueCandidates = candidates.filter(
    (item, index, all) =>
      item.image && all.findIndex((candidate) => candidate.image === item.image) === index,
  );

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    candidates: uniqueCandidates.slice(0, 20),
  });
}
