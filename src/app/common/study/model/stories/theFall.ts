import { GlobalStudyDef } from "../globalStudy";

/** Genesis 3: the serpent, the fruit and the way out of Eden. */
export const THE_FALL: GlobalStudyDef = {
	slug: "story-the-fall",
	kind: "story",
	language: "en",
	name: "Adam, Eve and the Fall",
	description:
		"A garden with every good thing in it, and one tree God asked them to leave alone. Read how trust was broken, how God came looking for the people who hid from him, and the promise he made on the way out of Eden.",
	topic: "The story of the serpent, the first sin and Adam and Eve's departure from the garden of Eden (Genesis 3).",
	length: 1,
	depth: 4,
	sortOrder: 102,
	coversWholeCanon: false,
	steps: [
		{
			title: "A garden and one command",
			content: {
				kind: "text",
				body:
					"Genesis 2 ends with the man and the woman in a garden God planted for them (Genesis 2:8). They may eat from every tree in it but one, the tree of the knowledge of good and evil, and God warns that on the day they eat from it they will die (Genesis 2:16–17). They are naked and not ashamed (Genesis 2:25): nothing is hidden, from each other or from God.\n\n" +
					"Then a new voice enters the story. Genesis introduces the serpent as more crafty than any other wild creature the LORD God had made (Genesis 3:1).",
			},
		},
		{
			book: "GEN",
			startChapter: 3,
			startVerse: 1,
			endVerse: 7,
			title: "The serpent's question",
			explanation:
				"Notice that the serpent begins with a question that twists what God said: did God really say you may not eat from any tree (3:1)? God had given them every tree but one (2:16–17). Then comes a flat contradiction: \"You will not surely die\" (3:4). Watch what the woman sees in the fruit (3:6), and what the two of them see once their eyes are opened: only that they are naked (3:7).",
		},
		{
			book: "GEN",
			startChapter: 3,
			startVerse: 8,
			endVerse: 13,
			title: "Where are you?",
			explanation:
				"The LORD God is walking in the garden, and the man and the woman hide among the trees (3:8). Notice that God's first words to them are a question: \"Where are you?\" (3:9). Then watch the blame move: the man blames \"the woman whom you gave to be with me\" (3:12), and the woman blames the serpent (3:13).",
		},
		{
			title: "Eve",
			content: {
				kind: "character",
				entitySlug: "eve_1231",
				note:
					"Eve is the first woman, made by God from the man's side (Genesis 2:21–22). After the fall Adam names her Eve, because she would be the mother of all living (3:20), and when her first son is born she says she has gotten a man with the LORD's help (4:1).",
			},
		},
		{
			book: "GEN",
			startChapter: 3,
			startVerse: 14,
			endVerse: 24,
			title: "Consequences, and a promise",
			explanation:
				"Notice what God curses: the serpent (3:14) and the ground (3:17), not the man or the woman, though pain and toil now mark their lives (3:16–19). In verse 15 God says the woman's offspring will strike the serpent's head; many Christians have read this as the first promise of a rescuer. Watch, too, what God does before he sends them out: he makes them garments of skins and clothes them (3:21).",
		},
		{
			title: "Driven out of Eden",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/003.Adam_and_Eve_Are_Driven_out_of_Eden.jpg/1280px-003.Adam_and_Eve_Are_Driven_out_of_Eden.jpg",
				alt: "An engraving of an angel with a sword standing in a beam of light among the trees, as a man and a woman walk away with their heads bowed, the woman leaning on the man.",
				caption:
					"God sent the man out of the garden, and placed cherubim and a flaming sword to guard the way to the tree of life (Genesis 3:23–24).",
				credit: "Gustave Doré, Adam and Eve Are Driven out of Eden, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:003.Adam_and_Eve_Are_Driven_out_of_Eden.jpg",
			},
		},
		{
			title: "The Fall in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Paul reads the whole human story through this chapter: sin came into the world through one man, and death through sin (Romans 5:12). But he sets Christ against Adam: as one man's disobedience made many sinners, so one man's obedience will make many righteous (Romans 5:19).\n\n" +
					"The serpent is named at the end of the Bible as \"that ancient serpent\", the devil and Satan (Revelation 12:9), and Paul promises that the God of peace will soon crush Satan under the feet of believers (Romans 16:20). The tree of life, guarded at the end of Genesis 3, stands open again in the last chapter of the Bible, where there will no longer be any curse (Revelation 22:2–3).",
			},
		},
		{
			title: "Where are you?",
			content: {
				kind: "reflection",
				prompt:
					"When the man and the woman hid, God came looking for them and asked, \"Where are you?\" If God asked you that question today, what would your honest answer be?",
			},
			anchor: { book: "GEN", chapter: 3, verse: 9 },
		},
	],
};
