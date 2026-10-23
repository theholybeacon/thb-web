import { GlobalStudyDef } from "../globalStudy";

/** Genesis 6–9: the flood, the ark and the first covenant. */
export const NOAHS_ARK: GlobalStudyDef = {
	slug: "story-noahs-ark",
	kind: "story",
	language: "en",
	name: "Noah's Ark",
	description:
		"The world turns violent, God grieves, and one man is told to build a boat. Read the flood from the first warning to the rainbow, and the promise God made to every living creature afterwards.",
	topic: "The story of Noah, the ark and the flood, and the covenant God made after it (Genesis 6–9).",
	length: 2,
	depth: 4,
	sortOrder: 104,
	coversWholeCanon: false,
	steps: [
		{
			title: "Before the flood",
			content: {
				kind: "text",
				body:
					"Ten generations separate Adam from Noah (Genesis 5). In that time people filled the earth, and so did violence: Cain's murder of Abel (Genesis 4:8) became Lamech's boast that he would be avenged seventy-seven times (Genesis 4:23–24).\n\n" +
					"Genesis puts it plainly: \"the earth was corrupt in the sight of God, and full of violence\" (Genesis 6:11). The story that follows is about what God does with a world like that, and with the one man in it who still walked with him (Genesis 6:9).",
			},
		},
		{
			book: "GEN",
			startChapter: 6,
			title: "God sees the earth and calls Noah",
			explanation:
				"Notice two things God feels in this chapter: grief over what people have become (6:6), and favour towards Noah (6:8). Then look at how exact the instructions are: the size of the ark, its door, its decks, and who goes inside. Noah's whole answer is one verse: he did everything God commanded him (6:22).",
		},
		{
			title: "Noah",
			content: {
				kind: "character",
				entitySlug: "noah_2210",
				note:
					"Noah is the only person in Genesis said to be \"righteous, blameless in his generation\" (6:9). The New Testament remembers him for his faith (Hebrews 11:7) and as a preacher of righteousness (2 Peter 2:5).",
			},
		},
		{
			book: "GEN",
			startChapter: 7,
			title: "The flood",
			explanation:
				"Seven days of waiting, then forty days of rain. Watch for the detail in verse 16: after everyone is inside, it is God who shuts the door. Count how often the chapter tells you the waters rose, until even the mountains were covered.",
		},
		{
			title: "The Deluge",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/1280px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
				alt: "An engraving of people and a tiger clinging to a rock as the flood waters rise around them under a dark sky.",
				caption:
					"Doré chose to show the people outside the ark, not the ark itself: the last rock above the water, and those trying to save their children on it.",
				credit: "Gustave Doré, The Deluge, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I,_The_Deluge.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 8,
			title: "God remembers Noah",
			explanation:
				"The turning point is the first verse: \"God remembered Noah.\" Then the waters go down, the ark rests on the mountains of Ararat, and Noah sends out a raven and a dove. The first thing he does on dry ground is build an altar (8:20).",
		},
		{
			title: "The dove returns",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Dove_Sent_Forth_from_the_Ark.png",
				alt: "An engraving of a dove flying away over still water, with the dark ark behind it.",
				caption: "The dove comes back the second time with a freshly plucked olive leaf in its beak (Genesis 8:11).",
				credit: "Gustave Doré, The Dove Sent Forth from the Ark (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Dove_Sent_Forth_from_the_Ark.png",
			},
		},
		{
			book: "GEN",
			startChapter: 9,
			startVerse: 1,
			endVerse: 17,
			title: "The covenant and the rainbow",
			explanation:
				"This is the first time the Bible uses the word covenant for a promise God makes. Notice who it is made with: Noah, his descendants, and \"every living creature\" (9:10). Notice too who the rainbow is for: God says that when he sees it, he will remember (9:16).",
		},
		{
			title: "Noah in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"The flood is not left behind in Genesis. Isaiah hears God compare his promise to Israel with his oath to Noah: \"so I have sworn that I will not be angry with you\" (Isaiah 54:9).\n\n" +
					"Jesus compares his own return to the days of Noah, when people went on eating, drinking and marrying until the day the flood came (Matthew 24:37–39). Peter sees in the eight people brought safely through the water a picture of baptism (1 Peter 3:20–21).",
			},
		},
		{
			title: "A promise kept",
			content: {
				kind: "reflection",
				prompt:
					"God bound himself to a promise and gave a sign to remember it by. Where have you seen God keep a promise, in Scripture or in your own life?",
			},
			anchor: { book: "GEN", chapter: 9, verse: 13 },
		},
	],
};
