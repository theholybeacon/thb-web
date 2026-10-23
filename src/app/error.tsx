"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ErrorFallback } from "@/components/errors/ErrorFallback";
import { newErrorRef, reportClientError } from "@/lib/posthog-client";

/**
 * Error boundary for every page under the root layout that has no closer one.
 * Server errors arrive here with a digest, already reported by
 * instrumentation.ts under that digest; browser errors are reported from here.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errorPage");
  const errorRef = useMemo(() => error.digest ?? newErrorRef(), [error]);

  useEffect(() => {
    // A digest means the server already reported it (instrumentation.ts), with
    // the real message; the browser only gets a redacted copy.
    if (!error.digest) reportClientError(error, { area: "error_boundary", error_ref: errorRef });
  }, [error, errorRef]);

  return (
    <ErrorFallback
      text={{ title: t("title"), body: t("body"), retry: t("retry"), home: t("home"), reference: t("reference") }}
      errorRef={errorRef}
      onRetry={reset}
    />
  );
}
