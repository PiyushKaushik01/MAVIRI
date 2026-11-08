import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";

async function getAuthHandlers() {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    return null;
  }
  const { auth } = await import("@/lib/auth");
  return toNextJsHandler(auth);
}

export async function GET(request: Request) {
  const handlers = await getAuthHandlers();
  if (!handlers) return NextResponse.json({ error: "Authentication is not configured on this server." }, { status: 503 });
  return handlers.GET(request);
}

export async function POST(request: Request) {
  const handlers = await getAuthHandlers();
  if (!handlers) return NextResponse.json({ error: "Authentication is not configured on this server." }, { status: 503 });
  return handlers.POST(request);
}
