import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { isBackendConfigured } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isBackendConfigured()) {
    return NextResponse.json({ status: "degraded", database: "not_configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    await getPrismaClient().$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
