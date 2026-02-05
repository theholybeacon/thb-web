"use client";

import { Verse } from "@/app/common/verse/model/Verse";
import { BookOpen } from "lucide-react";

interface ScriptureReaderProps {
  verses: Verse[];
  bookName: string;
  chapterNumber: number;
}

export function ScriptureReader({ verses, bookName, chapterNumber }: ScriptureReaderProps) {
  return (
    <div className="space-y-6">
      {/* Chapter title */}
      <div className="pb-4 border-b">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-center">
          {bookName} {chapterNumber}
        </h1>
      </div>

      {/* Verses */}
      {verses.length > 0 ? (
        <div className="space-y-4 leading-relaxed">
          {verses.map((verse) => (
            <p
              key={verse.id}
              id={`verse-${verse.verseNumber}`}
              className="text-base md:text-lg scroll-mt-20"
            >
              <sup className="text-xs font-semibold text-primary mr-1.5 select-none">
                {verse.verseNumber}
              </sup>
              <span className="text-foreground">{verse.content}</span>
            </p>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No content available for this chapter.</p>
        </div>
      )}
    </div>
  );
}
