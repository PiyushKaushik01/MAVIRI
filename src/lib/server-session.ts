import "server-only";
import { headers } from "next/headers";

export function isBackendConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);
}

export async function getCurrentSession() {
  if (!isBackendConfigured()) return null;
  const [{ auth }, requestHeaders] = await Promise.all([
    import("@/lib/auth"),
    headers(),
  ]);
  return auth.api.getSession({ headers: requestHeaders });
}
