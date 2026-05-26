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
  source?: TrafficSource;
  analytics?: AnalyticsSummary;
};

type TrafficSource =
  | "direct"
  | "internal"
  | "google"
  | "naver"
  | "daum"
  | "bing"
  | "social"
  | "ai"
  | "other";

type DeviceKind = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

type VisitPayload = {
  slug?: string;
  path?: string;
  referrer?: string;
  screen?: {
    width?: number;
    height?: number;
  };
};

type AnalyticsItem = {
  name: string;
  today: number;
  total: number;
};

type AnalyticsSummary = {
  sources: AnalyticsItem[];
  devices: AnalyticsItem[];
  countries: AnalyticsItem[];
};

const trackedSources: TrafficSource[] = [
  "direct",
  "internal",
  "google",
  "naver",
  "daum",
  "bing",
  "social",
  "ai",
  "other",
];

const trackedDevices: DeviceKind[] = [
  "desktop",
  "mobile",
  "tablet",
  "bot",
  "unknown",
];

const trackedCountries = [
  "KR",
  "US",
  "JP",
  "CN",
  "SG",
  "VN",
  "ID",
  "TH",
  "PH",
  "IN",
  "UNKNOWN",
];

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
  source,
}: {
  counted?: boolean;
  source?: TrafficSource;
} = {}): CountResponse {
  const baseTotal = getBaseTotal();

  return {
    today: counted ? 1 : 0,
    total: baseTotal + (counted ? 1 : 0),
    configured: false,
    provider: "fallback",
    source,
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

function safeDimension(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function getReferrerHost(referrer?: string) {
  if (!referrer) {
    return "direct";
  }

  try {
    return safeDimension(new URL(referrer).hostname) || "unknown";
  } catch {
    return "unknown";
  }
}

function getTrafficSource(referrer?: string): TrafficSource {
  const host = getReferrerHost(referrer);

  if (host === "direct") {
    return "direct";
  }

  if (host === "otar.site" || host.endsWith(".otar.site")) {
    return "internal";
  }

  if (host.includes("google.")) {
    return "google";
  }

  if (host.includes("naver.")) {
    return "naver";
  }

  if (host.includes("daum.") || host.includes("kakao.")) {
    return "daum";
  }

  if (host.includes("bing.") || host.includes("microsoft.")) {
    return "bing";
  }

  if (
    host.includes("chatgpt.") ||
    host.includes("openai.") ||
    host.includes("perplexity.") ||
    host.includes("claude.") ||
    host.includes("gemini.")
  ) {
    return "ai";
  }

  if (
    host.includes("facebook.") ||
    host.includes("instagram.") ||
    host.includes("threads.") ||
    host.includes("x.com") ||
    host.includes("twitter.") ||
    host.includes("reddit.") ||
    host.includes("linkedin.")
  ) {
    return "social";
  }

  return "other";
}

function getDeviceKind(userAgent: string | null): DeviceKind {
  const ua = userAgent?.toLowerCase() ?? "";

  if (!ua) {
    return "unknown";
  }

  if (/bot|crawl|spider|slurp|bingpreview|google-inspectiontool/.test(ua)) {
    return "bot";
  }

  if (/ipad|tablet/.test(ua)) {
    return "tablet";
  }

  if (/mobile|iphone|android/.test(ua)) {
    return "mobile";
  }

  return "desktop";
}

function getCountry(request: Request) {
  return (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    "UNKNOWN"
  )
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2) || "UNKNOWN";
}

function analyticsParts({
  source,
  device,
  country,
  referrerHost,
}: {
  source: TrafficSource;
  device: DeviceKind;
  country: string;
  referrerHost: string;
}) {
  return [
    ["source", source],
    ["device", device],
    ["country", country],
    ["referrer", referrerHost],
  ];
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

async function getExternalDimension(
  dimension: string,
  value: string,
): Promise<AnalyticsItem> {
  const todayKey = getSeoulDate();
  const [today, total] = await Promise.all([
    externalCounter("get", dimension, value, "daily", todayKey),
    externalCounter("get", dimension, value, "total"),
  ]);

  return { name: value, today, total };
}

async function getExternalAnalytics(): Promise<AnalyticsSummary> {
  const [sources, devices, countries] = await Promise.all([
    Promise.all(trackedSources.map((source) => getExternalDimension("source", source))),
    Promise.all(trackedDevices.map((device) => getExternalDimension("device", device))),
    Promise.all(trackedCountries.map((country) => getExternalDimension("country", country))),
  ]);

  return { sources, devices, countries };
}

async function hitExternalCounts({
  slug,
  source,
  device,
  country,
  referrerHost,
}: {
  slug?: string;
  source: TrafficSource;
  device: DeviceKind;
  country: string;
  referrerHost: string;
}): Promise<CountResponse> {
  const baseTotal = getBaseTotal();
  const todayKey = getSeoulDate();
  const commands = [
    externalCounter("hit", "daily", todayKey),
    externalCounter("hit", "total"),
    ...analyticsParts({ source, device, country, referrerHost }).flatMap(
      ([dimension, value]) => [
        externalCounter("hit", dimension, value, "daily", todayKey),
        externalCounter("hit", dimension, value, "total"),
      ],
    ),
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
    source,
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

async function getRedisDimension(
  config: RedisConfig,
  dimension: string,
  value: string,
): Promise<AnalyticsItem> {
  const todayKey = `chimi:visits:${dimension}:${value}:daily:${getSeoulDate()}`;
  const totalKey = `chimi:visits:${dimension}:${value}:total`;
  const [today, total] = await Promise.all([
    redisCommand<string | number>(config, "get", todayKey),
    redisCommand<string | number>(config, "get", totalKey),
  ]);

  return {
    name: value,
    today: Number(today ?? 0),
    total: Number(total ?? 0),
  };
}

async function getRedisAnalytics(config: RedisConfig): Promise<AnalyticsSummary> {
  const [sources, devices, countries] = await Promise.all([
    Promise.all(trackedSources.map((source) => getRedisDimension(config, "source", source))),
    Promise.all(trackedDevices.map((device) => getRedisDimension(config, "device", device))),
    Promise.all(trackedCountries.map((country) => getRedisDimension(config, "country", country))),
  ]);

  return { sources, devices, countries };
}

async function getAnalytics(): Promise<AnalyticsSummary | undefined> {
  const config = getRedisConfig();

  if (config) {
    return getRedisAnalytics(config);
  }

  if (isExternalCounterEnabled()) {
    return getExternalAnalytics();
  }

  return undefined;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const counts = await getCounts();

    if (url.searchParams.get("details") === "1") {
      return NextResponse.json({
        ...counts,
        analytics: await getAnalytics(),
      });
    }

    return NextResponse.json(counts);
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
  const body = (await request.json().catch(() => ({}))) as VisitPayload;
  const slug = body.slug?.replace(/[^a-z0-9-]/gi, "").slice(0, 80);
  const source = getTrafficSource(body.referrer);
  const device = getDeviceKind(request.headers.get("user-agent"));
  const country = getCountry(request);
  const referrerHost = getReferrerHost(body.referrer);

  if (!config) {
    if (isExternalCounterEnabled()) {
      try {
        return NextResponse.json<CountResponse>(
          await hitExternalCounts({
            slug,
            source,
            device,
            country,
            referrerHost,
          }),
        );
      } catch {
        return NextResponse.json<CountResponse>(
          fallbackCounts({ counted: true, source }),
        );
      }
    }

    return NextResponse.json<CountResponse>(
      fallbackCounts({ counted: true, source }),
    );
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

    for (const [dimension, value] of analyticsParts({
      source,
      device,
      country,
      referrerHost,
    })) {
      commands.push(
        redisCommand<number>(
          config,
          "incr",
          `chimi:visits:${dimension}:${value}:daily:${getSeoulDate()}`,
        ),
        redisCommand<number>(
          config,
          "incr",
          `chimi:visits:${dimension}:${value}:total`,
        ),
      );
    }

    const [today, total] = await Promise.all(commands);

    return NextResponse.json<CountResponse>({
      today: Number(today ?? 0),
      total: Number(total ?? 0) + getBaseTotal(),
      configured: true,
      provider: "redis",
      source,
    });
  } catch {
    return NextResponse.json(fallbackCounts({ counted: true, source }));
  }
}
