import { NextResponse } from "next/server";

type RedisConfig = {
  url: string;
  token: string;
};

type CountResponse = {
  today: number;
  total: number;
  configured: boolean;
  provider: "redis" | "external" | "fallback";
};

function getRedisConfig(): RedisConfig | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), token };
}

function getBaseTotal() {
  return Number(process.env.VISIT_COUNTER_BASE_TOTAL ?? 5);
}

function fallbackCounts({
  counted = false,
}: {
  counted?: boolean;
} = {}): CountResponse {
  const baseTotal = getBaseTotal();

  return {
    today: counted ? 1 : 0,
    total: baseTotal + (counted ? 1 : 0),
    configured: false,
    provider: "fallback",
  };
}

function getSeoulDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function keyPath(key: string) {
  return encodeURIComponent(key);
}

async function redisCommand<T>(
  config: RedisConfig,
  command: "get" | "incr",
  key: string,
) {
  const response = await fetch(`${config.url}/${command}/${keyPath(key)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis ${command} failed`);
  }

  const payload = (await response.json()) as { result: T | null };
  return payload.result;
}

type ExternalCountResponse = {
  value?: string | number;
};

function getExternalCounterBaseUrl() {
  return (
    process.env.VISIT_COUNTER_EXTERNAL_BASE_URL ??
    "https://countapi.mileshilliard.com/api/v1"
  ).replace(/\/$/, "");
}

function getExternalCounterNamespace() {
  return process.env.VISIT_COUNTER_NAMESPACE ?? "otar_site_live";
}

function isExternalCounterEnabled() {
  return process.env.VISIT_COUNTER_EXTERNAL_DISABLED !== "1";
}

function counterKey(...parts: string[]) {
  const safeParts = parts
    .join(":")
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180);

  return encodeURIComponent(`${getExternalCounterNamespace()}:${safeParts}`);
}

async function externalCounter(
  command: "get" | "hit",
  ...parts: string[]
): Promise<number> {
  const response = await fetch(
    `${getExternalCounterBaseUrl()}/${command}/${counterKey(...parts)}`,
    {
      cache: "no-store",
    },
  );

  if (command === "get" && response.status === 404) {
    return 0;
  }

  if (!response.ok) {
    throw new Error(`External counter ${command} failed`);
  }

  const payload = (await response.json()) as ExternalCountResponse;
  return Number(payload.value ?? 0);
}

async function getExternalCounts(): Promise<CountResponse> {
  const baseTotal = getBaseTotal();
  const todayKey = getSeoulDate();
  const [today, total] = await Promise.all([
    externalCounter("get", "daily", todayKey),
    externalCounter("get", "total"),
  ]);

  return {
    today,
    total: total + baseTotal,
    configured: true,
    provider: "external",
  };
}

async function hitExternalCounts(slug?: string): Promise<CountResponse> {
  const baseTotal = getBaseTotal();
  const todayKey = getSeoulDate();
  const commands = [
    externalCounter("hit", "daily", todayKey),
    externalCounter("hit", "total"),
  ];

  if (slug) {
    commands.push(
      externalCounter("hit", "slug", slug, "daily", todayKey),
      externalCounter("hit", "slug", slug, "total"),
    );
  }

  const [today, total] = await Promise.all(commands);

  return {
    today,
    total: total + baseTotal,
    configured: true,
    provider: "external",
  };
}

async function getCounts(): Promise<CountResponse> {
  const config = getRedisConfig();
  const baseTotal = getBaseTotal();

  if (!config) {
    if (isExternalCounterEnabled()) {
      return getExternalCounts();
    }

    return {
      today: 0,
      total: baseTotal,
      configured: false,
      provider: "fallback",
    };
  }

  const todayKey = `otar:visits:daily:${getSeoulDate()}`;
  const [today, total] = await Promise.all([
    redisCommand<string | number>(config, "get", todayKey),
    redisCommand<string | number>(config, "get", "otar:visits:total"),
  ]);

  return {
    today: Number(today ?? 0),
    total: Number(total ?? 0) + baseTotal,
    configured: true,
    provider: "redis",
  };
}

export async function GET() {
  try {
    return NextResponse.json(await getCounts());
  } catch {
    return NextResponse.json<CountResponse>({
      today: 0,
      total: getBaseTotal(),
      configured: false,
      provider: "fallback",
    });
  }
}

export async function POST(request: Request) {
  const config = getRedisConfig();
  const body = (await request.json().catch(() => ({}))) as { slug?: string };
  const slug = body.slug?.replace(/[^a-z0-9-]/gi, "").slice(0, 80);

  if (!config) {
    if (isExternalCounterEnabled()) {
      try {
        return NextResponse.json<CountResponse>(await hitExternalCounts(slug));
      } catch {
        return NextResponse.json<CountResponse>(fallbackCounts({ counted: true }));
      }
    }

    return NextResponse.json<CountResponse>(fallbackCounts({ counted: true }));
  }

  try {
    const todayKey = `otar:visits:daily:${getSeoulDate()}`;
    const totalKey = "otar:visits:total";
    const commands = [
      redisCommand<number>(config, "incr", todayKey),
      redisCommand<number>(config, "incr", totalKey),
    ];

    if (slug) {
      commands.push(
        redisCommand<number>(config, "incr", `otar:visits:${slug}:daily:${getSeoulDate()}`),
        redisCommand<number>(config, "incr", `otar:visits:${slug}:total`),
      );
    }

    const [today, total] = await Promise.all(commands);

    return NextResponse.json<CountResponse>({
      today: Number(today ?? 0),
      total: Number(total ?? 0) + getBaseTotal(),
      configured: true,
      provider: "redis",
    });
  } catch {
    return NextResponse.json(fallbackCounts({ counted: true }));
  }
}
