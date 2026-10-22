"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";
import { toUsfm } from "@/app/common/studyBuilder/model/draft";

/**
 * Book names as the chosen translation has them ("Juan" in a Spanish Bible),
 * by USFM code. Empty until they load, or when the translation has none: the
 * English names stand in.
 */
export function useBookNames(bibleId: string): Map<string, string> {
	const { data: books } = useQuery({
		queryKey: ["books", bibleId],
		queryFn: () => bookGetAllByBibleIdSS(bibleId),
		enabled: Boolean(bibleId),
		staleTime: Infinity,
	});
	return useMemo(() => {
		const names = new Map<string, string>();
		for (const book of books ?? []) {
			const usfm = toUsfm(book.abbreviation);
			if (usfm && !names.has(usfm)) names.set(usfm, book.name);
		}
		return names;
	}, [books]);
}
