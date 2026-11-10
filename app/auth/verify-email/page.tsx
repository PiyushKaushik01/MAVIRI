// app/auth/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const visibleStatus = token ? status : "success";

  useEffect(() => {
    // If there is no token, it means Better Auth's API already verified it 
    // and redirected the user here. We can assume success.
    if (!token) {
      const redirectTimer = window.setTimeout(() => router.push("/"), 3000);
      return () => window.clearTimeout(redirectTimer);
    }

    let active = true;
    let redirectTimer: number | undefined;
    const verify = async () => {
      // Try to verify the token manually if it IS in the URL
      const { error } = await authClient.verifyEmail({ query: { token } });
      if (!active) return;
      
      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Invalid or expired token.");
        console.error("VERIFICATION ERROR:", error);
      } else {
        setStatus("success");
        redirectTimer = window.setTimeout(() => router.push("/"), 3000);
      }
    };

    void verify();
    return () => {
      active = false;
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer);
    };
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper text-ink font-mono">
      <div className="text-center p-8 border-2 border-ink shadow-[4px_4px_0_var(--ink)] bg-paper-raised">
        {visibleStatus === "loading" && <p>VERIFYING TOKEN...</p>}
        {visibleStatus === "success" && (
          <>
            <h1 className="text-xl font-bold text-green-600">EMAIL VERIFIED!</h1>
            <p className="text-xs mt-2">REDIRECTING TO HOME...</p>
          </>
        )}
        {visibleStatus === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600">VERIFICATION FAILED</h1>
            <p className="text-xs mt-2 text-ink-soft">{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  );
}
