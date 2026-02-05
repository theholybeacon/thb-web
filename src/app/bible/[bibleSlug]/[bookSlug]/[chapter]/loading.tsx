import { Loader2, BookOpen } from "lucide-react";

export default function ChapterLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <div className="h-8 w-20 bg-background/50 rounded animate-pulse" />
              <div className="h-8 w-20 bg-background/50 rounded animate-pulse" />
              <div className="h-8 w-20 bg-background/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Content loading */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Loading chapter...</p>
          </div>

          {/* Verse skeleton lines */}
          <div className="space-y-4 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-full" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur border-t px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
      </footer>
    </div>
  );
}
