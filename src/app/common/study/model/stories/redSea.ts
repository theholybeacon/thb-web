import { GlobalStudyDef } from "../globalStudy";

/** Exodus 14–15: Israel trapped at the sea, the crossing on dry ground, and the song on the far shore. */
export const RED_SEA: GlobalStudyDef = {
	slug: "story-red-sea",
	kind: "story",
	language: "en",
	name: "Crossing the Red Sea",
	description:
		"Pharaoh's chariots behind them, the sea in front of them, and nowhere left to run. Read how God made a road through the water, and the song his people sang on the other side.",
	topic: "Israel's escape through the sea, the defeat of Pharaoh's army and the song of Moses and Miriam (Exodus 14–15).",
	length: 2,
	depth: 3,
	sortOrder: 115,
	coversWholeCanon: false,
	steps: [
		{
			title: "Led the long way round",
			content: {
				kind: "text",
				body:
					"Israel leaves Egypt in a hurry, the same night Pharaoh tells them to go (Exodus 12:31–33). God does not lead them by the short road along the coast, in case the sight of war sends them back to Egypt; he takes them the long way, through the wilderness toward the Red Sea (13:17–18). They carry Joseph's bones with them, as he had asked (13:19).\n\n" +
					"And they are not alone. The LORD goes ahead of them in a pillar of cloud by day and a pillar of fire by night, and it never leaves them (13:21–22).",
			},
		},
		{
			book: "EXO",
			startChapter: 14,
			startVerse: 1,
			endVerse: 14,
			title: "Trapped by the sea",
			explanation:
				"Notice that God himself tells Israel to turn back and camp by the sea, where Pharaoh will think they are lost (14:2–3). Then Pharaoh changes his mind and chases them with his chariots (14:5–7). Listen to the people's terror (14:11–12), and then to Moses' answer in verses 13 and 14: do not be afraid, stand still, and see what the LORD will do. The LORD will fight for you.",
		},
		{
			book: "EXO",
			startChapter: 14,
			startVerse: 15,
			endVerse: 31,
			title: "Through the sea on dry ground",
			explanation:
				"Now God tells Moses to stop crying out and have the people move on (14:15). Watch the cloud move from the front of the camp to the back, standing between Israel and Egypt all night (14:19–20). The waters stand like a wall on the right and on the left (14:22), and by morning the sea has returned over the army that followed them (14:27–28). Notice the last verse: the people feared the LORD and believed (14:31).",
		},
		{
			title: "The Egyptians drowned in the sea",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/037.The_Egyptians_Drown_in_the_Sea.jpg/1280px-037.The_Egyptians_Drown_in_the_Sea.jpg",
				alt: "An engraving of huge waves crashing down on horses and soldiers in the foreground, while a crowd stands safe on a hill in the distance under a breaking sky.",
				caption:
					"Doré sets the safe shore far off in the light, and the chariots of Egypt in the waves below, as the sea comes back over them (Exodus 14:27–28).",
				credit: "Gustave Doré, The Egyptians Drown in the Sea, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:037.The_Egyptians_Drown_in_the_Sea.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 15,
			startVerse: 1,
			endVerse: 21,
			title: "The song on the shore",
			explanation:
				"Moses and the people sing this song to the LORD (15:1), and it is about what he has done, not about them. Notice the questions in verse 11: who is like you among the gods? Notice too that the song looks forward as well as back, to the nations hearing and trembling (15:14–16) and to God planting his people in his own land (15:17). Then Miriam takes up a tambourine, and the women answer with the first line of the song (15:20–21).",
		},
		{
			title: "Miriam",
			content: {
				kind: "character",
				entitySlug: "miriam_2087",
				note:
					"Exodus calls her a prophet and the sister of Aaron (15:20), and she leads the women in song on the far shore. Centuries later the prophet Micah remembers her, with Moses and Aaron, as one of the three God sent to lead his people out of Egypt (Micah 6:4).",
			},
		},
		{
			title: "The sea in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Israel never forgets this crossing. When they cross the Jordan forty years later, Joshua tells them God dried it up just as he had dried up the Red Sea (Joshua 4:23). The psalms sing of it, and also confess how quickly the people forgot it (Psalm 106:9–13). Isaiah calls God the one who makes a way through the sea (Isaiah 43:16).\n\n" +
					"In the New Testament, Paul says Israel was \"baptized into Moses in the cloud and in the sea\" (1 Corinthians 10:1–2), Hebrews counts the crossing as an act of faith (Hebrews 11:29), and in Revelation those who have overcome sing \"the song of Moses\" and the song of the Lamb (Revelation 15:3).",
			},
		},
		{
			title: "Stand still",
			content: {
				kind: "reflection",
				prompt:
					"Moses told a terrified people that the LORD would fight for them and they only needed to be still. Where are you trapped between something behind you and something in front of you, and what would it look like to trust God to fight for you there?",
			},
			anchor: { book: "EXO", chapter: 14, verse: 14 },
		},
	],
};
