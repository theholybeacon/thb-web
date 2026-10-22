"use client";

import { useCallback, useEffect, useState } from "react";
import { readStored, writeStored } from "@/components/reader/readerPrefs";
import { type DefinitionLanguage, defaultDefinitionLanguage, isDefinitionLanguage } from "@/lib/dictionaryLanguage";

/** Per Bible language: a reader of the RVR and the KJV may want each defined differently. */
const storageKey = (lang: string) => `thb.reader.definitionLang.${lang}`;

/**
 * The language the dictionary writes its definitions in, for a Bible in `lang`.
 *
 * Held by the reader rather than the dictionary section: the panel is mounted
 * twice (desktop column and mobile drawer), and both must agree. Read from
 * storage in an effect — reading it during render would desync SSR.
 */
export function useDefinitionLanguage(lang: string | null) {
	const [definitionLang, setDefinitionLang] = useState<DefinitionLanguage>(() => defaultDefinitionLanguage(lang));

	useEffect(() => {
		const stored = lang ? readStored<string | null>(storageKey(lang), null) : null;
		setDefinitionLang(isDefinitionLanguage(stored) ? stored : defaultDefinitionLanguage(lang));
	}, [lang]);

	const chooseDefinitionLang = useCallback(
		(next: DefinitionLanguage) => {
			setDefinitionLang(next);
			if (lang) writeStored(storageKey(lang), next);
		},
		[lang],
	);

	return { definitionLang, chooseDefinitionLang };
}
