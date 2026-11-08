import "server-only";
import { NextResponse } from "next/server";
import { isBackendConfigured } from "@/lib/server-session";

export async function requireApiUser() {
  if (!isBackendConfigured()) {
    return { user: null, response: NextResponse.json({ error: "Database and authentication are not configured." }, { status: 503 }) };
  }

  const [{ auth }, requestHeaders] = await Promise.all([
    import("@/lib/auth"),
    import("next/headers").then(({ headers }) => headers()),
  ]);
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    return { user: null, response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  }
  return { user: session.user, response: null };
}
