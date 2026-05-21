import { NextResponse } from "next/server";

type RedisConfig = {
  url: string;
  token: string;
};

type CountResponse = {
  today: number;
  total: number;
  configured: boolean;
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

async function getCounts(): Promise<CountResponse> {
  const config = getRedisConfig();
  const baseTotal = getBaseTotal();

  if (!config) {
    return {
      today: 0,
      total: baseTotal,
      configured: false,
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
    });
  }
}

export async function POST(request: Request) {
  const config = getRedisConfig();
  const baseTotal = getBaseTotal();

  if (!config) {
    return NextResponse.json<CountResponse>({
      today: 0,
      total: baseTotal,
      configured: false,
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { slug?: string };
    const slug = body.slug?.replace(/[^a-z0-9-]/gi, "").slice(0, 80);
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
      total: Number(total ?? 0) + baseTotal,
      configured: true,
    });
  } catch {
    return NextResponse.json(await getCounts());
  }
}
