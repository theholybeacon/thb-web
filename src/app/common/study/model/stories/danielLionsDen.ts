import { GlobalStudyDef } from "../globalStudy";

/** Daniel 6: a law against prayer, and a night among the lions. */
export const DANIEL_LIONS_DEN: GlobalStudyDef = {
	slug: "story-daniel-lions-den",
	kind: "story",
	language: "en",
	name: "Daniel in the Lions' Den",
	description:
		"Daniel's rivals cannot find a single fault in his work, so they make his prayers illegal. Read how he kept praying at his open window, and what the king found at the lions' den at dawn.",
	topic: "Daniel keeps praying despite King Darius's decree and is kept safe in the lions' den (Daniel 6).",
	length: 1,
	depth: 3,
	sortOrder: 136,
	coversWholeCanon: false,
	steps: [
		{
			title: "A long life in exile",
			content: {
				kind: "text",
				body:
					"Daniel was carried to Babylon as a young man, one of the youths from Judah chosen to serve in the king's palace (Daniel 1:3–6). He stayed there through the reigns of several kings, until the first year of King Cyrus (Daniel 1:21).\n\n" +
					"By chapter 6 Babylon's kingdom has been given to the Medes and Persians (Daniel 5:28), and its king, Belshazzar, has been killed in a single night (Daniel 5:30). A new ruler, Darius, now organises the kingdom, and Daniel, an exile from Judah, is once again among its highest officials (Daniel 6:1–2).",
			},
		},
		{
			book: "DAN",
			startChapter: 6,
			startVerse: 1,
			endVerse: 9,
			title: "A trap made of law",
			explanation:
				"Notice why the officials turn against Daniel: the king plans to set him over the whole kingdom (6:3). Watch how hard they look for a fault and fail (6:4), and what they decide in verse 5: the only way to catch him is through the law of his God. Notice the detail in verse 8: a law of the Medes and Persians cannot be changed.",
		},
		{
			book: "DAN",
			startChapter: 6,
			startVerse: 10,
			endVerse: 15,
			title: "Daniel prays as before",
			explanation:
				"Verse 10 is the centre of the story. Daniel knows the document has been signed, and he goes home and prays with his windows open towards Jerusalem, three times a day, just as he had always done. Then notice the king: he is distressed, and tries until sunset to find a way to save Daniel (6:14).",
		},
		{
			title: "Daniel",
			content: {
				kind: "character",
				entitySlug: "daniel_975",
				note:
					"His enemies could find no error or fault in Daniel, because he was faithful and trustworthy (Daniel 6:4). Through his long life in Babylon he served kings who did not share his faith, and he never stopped praying to his own God.",
			},
		},
		{
			book: "DAN",
			startChapter: 6,
			startVerse: 16,
			endVerse: 24,
			title: "A night in the den",
			explanation:
				"Listen to what the king says as Daniel goes in (6:16), and watch how he spends the night: no food, no entertainment, no sleep (6:18). At dawn he hurries to the den and calls out in anguish (6:20). Notice the reason the text gives for Daniel being unhurt: \"he had trusted in his God\" (6:23). The end of verse 24 is hard to read; the story does not hide it.",
		},
		{
			title: "Daniel in the lions' den",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/131.Daniel_in_the_Lions%27_Den.jpg/1280px-131.Daniel_in_the_Lions%27_Den.jpg",
				alt: "An engraving of a man in a long robe standing in a rocky den, looking up towards a beam of light, surrounded by lions that lie or stand around him; bones lie on the ground.",
				caption:
					"\"My God sent his angel and shut the lions' mouths\" (Daniel 6:22). Doré shows Daniel looking up towards the light, with the lions all around him.",
				credit: "Gustave Doré, Daniel in the Lions' Den, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:131.Daniel_in_the_Lions%27_Den.jpg",
			},
		},
		{
			book: "DAN",
			startChapter: 6,
			startVerse: 25,
			endVerse: 28,
			title: "The living God",
			explanation:
				"The story ends with a decree that is almost a psalm. Notice what Darius now says about Daniel's God: he is the living God, his kingdom will never be destroyed, and he rescues and saves (6:26–27). The last verse tells you Daniel prospered under Darius and under Cyrus (6:28).",
		},
		{
			title: "Darius",
			content: {
				kind: "character",
				entitySlug: "darius_980",
				note:
					"Daniel calls him Darius the Mede (Daniel 11:1). He favours Daniel, signs the law that endangers him, and then spends a sleepless night hoping Daniel's God will save him (6:16–18).",
			},
		},
		{
			title: "Daniel in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Jesus speaks of \"the prophet Daniel\" when he warns his disciples about the future (Matthew 24:15).\n\n" +
					"The letter to the Hebrews, listing people who lived by faith, speaks of some who shut the mouths of lions and quenched the power of fire (Hebrews 11:33–34). It does not give their names, but these words match Daniel 6 and Daniel 3.",
			},
		},
		{
			title: "Praying as before",
			content: {
				kind: "reflection",
				prompt:
					"Daniel did not start praying because of the crisis; he kept the habit he already had. What daily habit of faith would you want to be keeping already when a hard day comes?",
			},
			anchor: { book: "DAN", chapter: 6, verse: 10 },
		},
	],
};
