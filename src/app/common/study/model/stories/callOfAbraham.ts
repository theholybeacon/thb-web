import { GlobalStudyDef } from "../globalStudy";

/** Genesis 12 and 15: the call, the setting out and the covenant under the stars. */
export const CALL_OF_ABRAHAM: GlobalStudyDef = {
	slug: "story-call-of-abraham",
	kind: "story",
	language: "en",
	name: "The Call of Abraham",
	description:
		"God tells a childless man of seventy-five to leave his country for a land he has not seen, and promises to bless the whole world through him. Read how Abram set out, stumbled, and was taken outside to count the stars.",
	topic: "The story of God's call and promise to Abram, and the covenant God made with him (Genesis 12 and 15).",
	length: 2,
	depth: 4,
	sortOrder: 106,
	coversWholeCanon: false,
	steps: [
		{
			title: "A family that stopped halfway",
			content: {
				kind: "text",
				body:
					"Abram's father Terah set out from Ur of the Chaldeans with his family to go to the land of Canaan, but they stopped at Haran and settled there (Genesis 11:31). Abram's wife Sarai was barren; she had no child (Genesis 11:30). Stephen, retelling the story centuries later, says that God had already appeared to Abraham in Mesopotamia, before he lived in Haran (Acts 7:2).\n\n" +
					"Everything that follows in the Bible's story of Israel rests on a promise made to this childless couple.",
			},
		},
		{
			book: "GEN",
			startChapter: 12,
			startVerse: 1,
			endVerse: 9,
			title: "Go to the land I will show you",
			explanation:
				"Notice that God names what Abram must leave (his country, his relatives, his father's house) but not where he is going: only \"the land that I will show you\" (12:1). Count the \"I will\"s in verses 2–3, and see how the promise reaches past Abram to all the families of the earth (12:3). Abram is seventy-five when he leaves (12:4), and wherever he stops, he builds an altar to the LORD (12:7–8).",
		},
		{
			title: "Abram sets out",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/011.Abraham_Goes_to_the_Land_of_Canaan.jpg/1280px-011.Abraham_Goes_to_the_Land_of_Canaan.jpg",
				alt: "An engraving of a long caravan of sheep, camels and people on foot crossing open country under an evening sky, with a robed rider on a camel in the foreground.",
				caption:
					"Abram took Sarai his wife, Lot his nephew, and all the possessions and people they had gathered, and set out for the land of Canaan (Genesis 12:5).",
				credit: "Gustave Doré, Abraham Goes to the Land of Canaan, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:011.Abraham_Goes_to_the_Land_of_Canaan.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 12,
			startVerse: 10,
			endVerse: 20,
			title: "A detour into Egypt",
			explanation:
				"Right after the promise comes a famine, and Abram goes down to Egypt (12:10). Notice his fear: he asks Sarai to say she is his sister, so that he will be treated well (12:11–13), and Pharaoh takes her into his house (12:15). He will do the same thing again years later (20:2). Watch who protects Sarai: the LORD strikes Pharaoh's house with plagues (12:17).",
		},
		{
			title: "Abraham",
			content: {
				kind: "character",
				entitySlug: "abraham_58",
				note:
					"Abram is later renamed Abraham, because God has made him the father of many nations (Genesis 17:5). Three times Scripture calls him the friend of God (2 Chronicles 20:7; Isaiah 41:8; James 2:23), and Hebrews remembers that by faith he went out, not knowing where he was going (Hebrews 11:8).",
			},
		},
		{
			book: "GEN",
			startChapter: 15,
			title: "Count the stars",
			explanation:
				"Between chapters 12 and 15, Lot parts from Abram (13:11) and Abram rescues him from captivity (14:14–16). Notice that Abram's first recorded words to God are an honest complaint: what will you give me, when I am still childless (15:2)? God takes him outside to count the stars (15:5), and verse 6 follows: Abram believed the LORD, and he counted it to him as righteousness. Then watch the strange covenant ceremony: while Abram sleeps, a smoking fire pot and a flaming torch pass between the pieces of the animals (15:17).",
		},
		{
			title: "God's promises to Abram",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Tissot_God%27s_Promises_to_Abram.jpg",
				alt: "A painting of a man in a striped cloak lying face down on the patterned floor of a tent, as a shaft of light falls beside him.",
				caption:
					"The word of the LORD came to Abram in a vision: \"Fear not, Abram, I am your shield\" (Genesis 15:1).",
				credit: "James Tissot, God's Promises to Abram (c. 1896–1902). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Tissot_God%27s_Promises_to_Abram.jpg",
			},
		},
		{
			title: "Sarah",
			content: {
				kind: "character",
				entitySlug: "sarah_2473",
				note:
					"Sarai, later renamed Sarah (Genesis 17:15), goes with Abram from the start (12:5), and for most of the story she has no child (11:30). When she hears she will have a son in her old age, she laughs (18:12); when Isaac is born she says that God has made laughter for her (21:6). Isaiah tells Israel to look to Abraham their father and to Sarah who bore them (Isaiah 51:2).",
			},
		},
		{
			title: "Abraham in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Genesis 15:6 is one of the verses the New Testament quotes most. Paul uses it to show that people are made right with God by faith (Romans 4:3; Galatians 3:6), and James quotes it too (James 2:23). Paul even calls God's promise in Genesis 12:3 the gospel announced to Abraham in advance (Galatians 3:8).\n\n" +
					"The New Testament opens by calling Jesus \"the son of David, the son of Abraham\" (Matthew 1:1). And Paul tells believers from every nation that if they belong to Christ, they are Abraham's offspring, heirs according to the promise (Galatians 3:29).",
			},
		},
		{
			title: "Believing a promise",
			content: {
				kind: "reflection",
				prompt:
					"Abram looked up at the stars and believed a promise he could not yet see. What promise of God do you find hardest to believe right now, and why?",
			},
			anchor: { book: "GEN", chapter: 15, verse: 6 },
		},
	],
};
