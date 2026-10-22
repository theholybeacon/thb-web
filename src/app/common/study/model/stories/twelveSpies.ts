import { GlobalStudyDef } from "../globalStudy";

/** Numbers 13–14: the spies' report, Israel's refusal to enter the land, and forty years in the wilderness. */
export const TWELVE_SPIES: GlobalStudyDef = {
	slug: "story-twelve-spies",
	kind: "story",
	language: "en",
	name: "The Twelve Spies",
	description:
		"Twelve men explore the land God promised and come back with the same facts and opposite conclusions. Read how fear spread through a whole people, and how two men who trusted God were the only ones of their generation to enter the land.",
	topic: "The spies sent into Canaan, the people's refusal to enter, and the faith of Caleb and Joshua (Numbers 13–14).",
	length: 2,
	depth: 4,
	sortOrder: 119,
	coversWholeCanon: false,
	steps: [
		{
			title: "At the edge of the promise",
			content: {
				kind: "text",
				body:
					"At the burning bush God promised to bring his people into \"a land flowing with milk and honey\" (Exodus 3:8). Now, after Sinai, they are camped at Kadesh in the wilderness of Paran (Numbers 13:3, 26), and Moses tells them they have reached the hill country God is giving them (Deuteronomy 1:19–21). By the road from Horeb, Kadesh Barnea is only eleven days away (Deuteronomy 1:2).\n\n" +
					"Before they go in, twelve men are sent ahead, one leader from each tribe (Numbers 13:2), to see the land and bring back some of its fruit (13:20).",
			},
		},
		{
			book: "NUM",
			startChapter: 13,
			title: "Two reports",
			explanation:
				"Notice that Moses gives Hoshea son of Nun a new name, Joshua (13:16). Watch the fruit they carry back: a single cluster of grapes so big it takes two men on a pole (13:23). Then listen carefully to the report. All twelve agree the land is good (13:27); the question is what to do about the strong people and walled cities (13:28). Caleb says, Let us go up at once (13:30); the others say, We cannot, spread a bad report about the land, and end by saying they seemed like grasshoppers (13:31–33).",
		},
		{
			title: "The return of the spies",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Dore_Return_of_the_Spies_From_the_Land_of_Promise.jpg",
				alt: "An engraving of two men carrying a huge cluster of grapes hanging from a pole between them, with other men walking behind carrying fruit, and a crowd and camp in the distance.",
				caption: "At the valley of Eshcol they cut a branch with one cluster of grapes and carried it on a pole between two of them (Numbers 13:23).",
				credit: "Gustave Doré, The Return of the Spies from the Land of Promise, Bible illustration (19th century). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Dore_Return_of_the_Spies_From_the_Land_of_Promise.jpg",
			},
		},
		{
			title: "Caleb",
			content: {
				kind: "character",
				entitySlug: "caleb_537",
				note:
					"The spy from the tribe of Judah (Numbers 13:6). God says Caleb had a different spirit and followed him fully (14:24), and forty-five years later, at eighty-five, he asks for the hill country where the Anakim lived and receives Hebron (Joshua 14:10–14).",
			},
		},
		{
			book: "NUM",
			startChapter: 14,
			startVerse: 1,
			endVerse: 25,
			title: "A night of weeping",
			explanation:
				"The whole community weeps all night and talks of choosing a leader to take them back to Egypt (14:1–4). Notice Joshua and Caleb in verses 6–9: the land is very good, and if the LORD is pleased with us he will bring us in, so do not be afraid. The people's answer is to pick up stones (14:10). Then Moses prays again, using the very words God spoke to him at Sinai (14:18; Exodus 34:6–7).",
		},
		{
			book: "NUM",
			startChapter: 14,
			startVerse: 26,
			endVerse: 45,
			title: "Forty years",
			explanation:
				"God gives the people what they said they wanted: they had wished to die in the wilderness (14:2), and there they will die (14:28–29). Notice the children they feared for in verse 3 are the ones who will enter the land (14:31). Forty days of spying become forty years of wandering (14:34). Then watch the people try to go up after all, without the LORD and against Moses' warning, and fail (14:40–45).",
		},
		{
			title: "The spies in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Moses never lets the next generation forget Kadesh. He tells the story again to the next generation (Numbers 32:8–13) and as they stand ready to enter the land (Deuteronomy 1:19–40).\n\n" +
					"Psalm 95 warns, Do not harden your hearts as in the wilderness, where God was grieved for forty years (Psalm 95:8–11), and the letter to the Hebrews quotes that psalm to its readers, concluding that the wilderness generation could not enter \"because of unbelief\" (Hebrews 3:7–19). Of the twelve, only Joshua and Caleb lived to see the land (Numbers 14:38; 32:12).",
			},
		},
		{
			title: "Giants and grasshoppers",
			content: {
				kind: "reflection",
				prompt:
					"Ten spies looked at the giants and felt like grasshoppers; Caleb and Joshua looked at the same giants and remembered God. What in your life looks too big right now, and what would it look like to see it the way Caleb did?",
			},
			anchor: { book: "NUM", chapter: 14, verse: 9 },
		},
	],
};
