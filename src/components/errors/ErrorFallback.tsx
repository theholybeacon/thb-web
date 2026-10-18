import { AlertTriangle } from "lucide-react";

export type ErrorFallbackText = {
  title: string;
  body: string;
  retry: string;
  home: string;
  reference: string;
};

/**
 * The screen a person sees when a page crashes. Plain elements only: it also
 * renders from global-error, where the root layout (and its providers) is gone.
 */
export function ErrorFallback({
  text,
  errorRef,
  onRetry,
}: {
  text: ErrorFallbackText;
  errorRef: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="mb-2 font-heading text-2xl font-bold">{text.title}</h1>
        <p className="mb-6 text-muted-foreground">{text.body}</p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {text.retry}
          </button>
          {/* A full page load, not a client transition: the app's state may be what broke. */}
          <a href="/" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            {text.home}
          </a>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          {text.reference}: <code className="font-mono">{errorRef}</code>
        </p>
      </div>
    </div>
  );
}
