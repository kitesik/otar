import { NextResponse } from "next/server";
import { getHourlyDelight, localDelightImages } from "@/lib/delight-rotation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const rotation = getHourlyDelight();

  return NextResponse.json(
    {
      updatedAt: new Date().toISOString(),
      active: rotation?.active ?? null,
      currentHour: rotation?.currentHour,
      nextUpdateAt: rotation?.nextUpdateAt,
      repeatWindowHours: rotation?.repeatWindowHours,
      candidates: rotation?.active ? [rotation.active] : localDelightImages,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
