import { GlobalStudyDef } from "../globalStudy";

/** Genesis 1–2: the six days, the seventh day and the garden. */
export const CREATION: GlobalStudyDef = {
	slug: "story-creation",
	kind: "story",
	language: "en",
	name: "The Creation",
	description:
		"Before anything else, there is God, and he speaks. Read the first pages of the Bible: light out of darkness, a world called very good, and a man and a woman made in God's image.",
	topic: "The story of creation, from the first day to the seventh, and the making of the man and the woman in the garden of Eden (Genesis 1–2).",
	length: 2,
	depth: 4,
	sortOrder: 101,
	coversWholeCanon: false,
	steps: [
		{
			title: "In the beginning",
			content: {
				kind: "text",
				body:
					"The Bible opens before there is anything to tell about but God: \"In the beginning, God created the heavens and the earth\" (Genesis 1:1). The earth is without form and empty, darkness covers the deep, and the Spirit of God is hovering over the waters (Genesis 1:2).\n\n" +
					"Genesis tells the creation twice. Chapter 1 tells it day by day, from light to the seventh day of rest. Chapter 2 begins again with \"the heavens and the earth\" (Genesis 2:4) and comes in close: one garden, one man, one woman. Read them side by side and let each fill in what the other leaves out.",
			},
		},
		{
			book: "GEN",
			startChapter: 1,
			title: "Six days, and all of it good",
			explanation:
				"Listen for the refrains: \"And God said\", \"and it was so\", and \"God saw that it was good\" (1:4, 10, 12, 18, 21, 25). Notice how the days answer each other: light on the first day and the lights of the sky on the fourth, sea and sky on the second and the fish and birds on the fifth, dry land on the third and the land animals on the sixth. Only people are made in God's image, male and female (1:27), and only after them does God call everything \"very good\" (1:31).",
		},
		{
			title: "Let there be light",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/001.The_Creation_of_Light.jpg/1280px-001.The_Creation_of_Light.jpg",
				alt: "An engraving of rays of light bursting through heavy clouds above a dark, empty landscape and still water.",
				caption:
					"The first thing God says in the Bible is \"Let there be light,\" and there was light (Genesis 1:3). Doré shows no people and no animals yet: only light breaking over the deep.",
				credit: "Gustave Doré, The Creation of Light, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:001.The_Creation_of_Light.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 2,
			startVerse: 1,
			endVerse: 17,
			title: "The seventh day and the garden",
			explanation:
				"The week ends with rest: God finishes his work, rests on the seventh day, and blesses it and makes it holy (2:2–3). Then watch how close the story comes: the LORD God forms the man from the dust of the ground and breathes into him the breath of life (2:7). He plants a garden, puts the man in it to work it and keep it (2:15), and gives him one command about one tree (2:16–17).",
		},
		{
			title: "Adam",
			content: {
				kind: "character",
				entitySlug: "adam_78",
				note:
					"Adam is the first man, made from the dust and given life by God's own breath (Genesis 2:7). He names the animals (2:19–20) and is the first person whose words the Bible records (2:23). Paul later sets him beside Christ: \"as in Adam all die, so also in Christ shall all be made alive\" (1 Corinthians 15:22).",
			},
		},
		{
			book: "GEN",
			startChapter: 2,
			startVerse: 18,
			endVerse: 25,
			title: "Not good to be alone",
			explanation:
				"After a whole chapter of \"good\", here is the first thing God calls \"not good\": that the man should be alone (2:18). Notice that none of the animals the man names is the partner he needs (2:20). When God brings him the woman, the man's first recorded words are a poem of recognition: \"bone of my bones and flesh of my flesh\" (2:23). The chapter ends in peace: they were naked and not ashamed (2:25).",
		},
		{
			title: "Creation in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"The rest of Scripture keeps coming back to these chapters. A psalm looks up at the moon and the stars God set in place and asks why he cares for people at all (Psalm 8:3–4). When Jesus is asked about marriage, he answers with Genesis 1:27 and 2:24 together: God made them male and female, and the two become one flesh (Matthew 19:4–6).\n\n" +
					"John begins his Gospel with the same words as Genesis, \"In the beginning\", and says that all things were made through the Word (John 1:1–3). And the Bible ends where it began, with a new heaven and a new earth (Revelation 21:1) and the tree of life, which first grew in Eden (Genesis 2:9), standing by the river of the city of God (Revelation 22:1–2).",
			},
		},
		{
			title: "Made in his image",
			content: {
				kind: "reflection",
				prompt:
					"God made people in his own image and called all that he had made very good. What would change in how you see yourself, and the people around you, if you took that seriously?",
			},
			anchor: { book: "GEN", chapter: 1, verse: 27 },
		},
	],
};
