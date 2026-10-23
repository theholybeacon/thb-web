import { GlobalStudyDef } from "../globalStudy";

/** Genesis 22: the testing of Abraham on the mountain in Moriah. */
export const ABRAHAM_AND_ISAAC: GlobalStudyDef = {
	slug: "story-abraham-and-isaac",
	kind: "story",
	language: "en",
	name: "Abraham and Isaac",
	description:
		"God asks Abraham for the son he waited a lifetime for, and Abraham rises early and goes. Read one of the hardest chapters in the Bible, and the words a father spoke to his son on the way up the mountain: God will provide.",
	topic: "The story of God's test of Abraham, Isaac on the mountain, and the ram God provided (Genesis 22).",
	length: 1,
	depth: 5,
	sortOrder: 108,
	coversWholeCanon: false,
	steps: [
		{
			title: "The son of the promise",
			content: {
				kind: "text",
				body:
					"Abraham was a hundred years old when Isaac was born (Genesis 21:5), and God had told him that it was through Isaac that his offspring would be named (Genesis 21:12). Every promise God had made to Abraham was now carried by one boy.\n\n" +
					"This is one of the hardest chapters in the Bible to read. Genesis tells you from its first verse that God is testing Abraham (Genesis 22:1), so you know something Abraham does not. Later, God's law forbids the child sacrifice practised by the nations around Israel (Deuteronomy 12:31), and through Jeremiah God says it is something he never commanded, nor did it enter his mind (Jeremiah 7:31).",
			},
		},
		{
			book: "GEN",
			startChapter: 22,
			startVerse: 1,
			endVerse: 8,
			title: "God will provide",
			explanation:
				"Notice how the command lingers on what it costs: \"your son, your only son Isaac, whom you love\" (22:2). Abraham rises early and goes (22:3). Watch what he tells his servants: the boy and I will worship and come back to you (22:5). Then Isaac's question, where is the lamb (22:7), and his father's answer, \"God will provide\" (22:8). Twice you read that the two of them walked on together (22:6, 8).",
		},
		{
			title: "Up the mountain",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/016.The_Testing_of_Abraham%27s_Faith.jpg/1280px-016.The_Testing_of_Abraham%27s_Faith.jpg",
				alt: "An engraving of a boy carrying a large bundle of sticks on his shoulders up a rocky slope, followed by an old bearded man in a hooded cloak holding a staff, with palm trees and distant hills behind them.",
				caption: "Abraham took the wood for the burnt offering and laid it on Isaac his son (Genesis 22:6).",
				credit: "Gustave Doré, The Testing of Abraham's Faith, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:016.The_Testing_of_Abraham%27s_Faith.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 22,
			startVerse: 9,
			endVerse: 19,
			title: "On the mountain",
			explanation:
				"The text is spare at the worst moment (22:9–10), and so is the rescue: the angel of the LORD calls Abraham's name twice (22:11). Notice what the test showed: \"now I know that you fear God\" (22:12). Watch for the ram caught by its horns in a thicket (22:13), and the name Abraham gives the place: \"The LORD will provide\" (22:14). Then God renews every promise with an oath, sworn by himself (22:16–18).",
		},
		{
			title: "Isaac",
			content: {
				kind: "character",
				entitySlug: "isaac_616",
				note:
					"Isaac is the son God promised to Abraham and Sarah long after they could have children (Genesis 18:10–11; 21:2). In this chapter he carries the wood and asks the question (22:6–7). He later marries Rebekah and loves her (24:67), and becomes the father of Esau and Jacob (25:25–26). Paul tells believers that they, like Isaac, are children of promise (Galatians 4:28).",
			},
		},
		{
			title: "Abraham and Isaac in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Hebrews says that Abraham offered Isaac by faith, reasoning that God was able even to raise him from the dead (Hebrews 11:17–19). James points to the same moment as faith shown in action (James 2:21–23).\n\n" +
					"Generations later, Solomon built the temple in Jerusalem on Mount Moriah (2 Chronicles 3:1), and Abraham was told to go to \"the land of Moriah\" (Genesis 22:2). The angel said to Abraham that he had not withheld his son, his only son (Genesis 22:12). Paul writes of God that he did not spare his own Son but gave him up for us all (Romans 8:32).",
			},
		},
		{
			title: "The LORD will provide",
			content: {
				kind: "reflection",
				prompt:
					"Abraham told his son that God would provide before he could see how. Where do you need to trust that God will provide, before you can see how he will?",
			},
			anchor: { book: "GEN", chapter: 22, verse: 14 },
		},
	],
};
