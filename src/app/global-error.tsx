"use client";

import "./globals.css";
import { useEffect, useMemo } from "react";
import { ErrorFallback, type ErrorFallbackText } from "@/components/errors/ErrorFallback";
import { newErrorRef, reportClientError } from "@/lib/posthog-client";

// The root layout crashed, so its translations provider is gone with it.
const TEXT: Record<"en" | "es", ErrorFallbackText> = {
  en: {
    title: "Something went wrong",
    body: "We've been notified and will look into it. Try again, or head back home.",
    retry: "Try again",
    home: "Go home",
    reference: "Error reference",
  },
  es: {
    title: "Algo salió mal",
    body: "Ya recibimos el aviso y lo revisaremos. Inténtalo de nuevo o vuelve al inicio.",
    retry: "Intentar de nuevo",
    home: "Ir al inicio",
    reference: "Referencia del error",
  },
};

/**
 * The last-resort fallback: catches what error.tsx can't, errors in the root
 * layout itself. It replaces the whole document, so it renders <html> too.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const errorRef = useMemo(() => error.digest ?? newErrorRef(), [error]);
  const locale = typeof navigator !== "undefined" && navigator.language.startsWith("es") ? "es" : "en";

  useEffect(() => {
    // A digest means the server already reported it (instrumentation.ts), with
    // the real message; the browser only gets a redacted copy.
    if (!error.digest) reportClientError(error, { area: "global_error", error_ref: errorRef });
  }, [error, errorRef]);

  return (
    <html lang={locale} className="dark">
      <body className="font-sans">
        <ErrorFallback text={TEXT[locale]} errorRef={errorRef} onRetry={reset} />
      </body>
    </html>
  );
}
