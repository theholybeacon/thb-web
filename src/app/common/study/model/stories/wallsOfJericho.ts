import { GlobalStudyDef } from "../globalStudy";

/** Joshua 5:13–6:27: the commander of the LORD's army, the march around Jericho and the fall of its walls. */
export const WALLS_OF_JERICHO: GlobalStudyDef = {
	slug: "story-walls-of-jericho",
	kind: "story",
	language: "en",
	name: "The Walls of Jericho",
	description:
		"A walled city shut tight, and an army told to do nothing but walk around it in silence for seven days. Read how Jericho fell, and how in the middle of its destruction one promise to one family was kept.",
	topic: "The fall of Jericho under Joshua and the rescue of Rahab's family (Joshua 5:13–6:27).",
	length: 1,
	depth: 3,
	sortOrder: 121,
	coversWholeCanon: false,
	steps: [
		{
			title: "Across the Jordan",
			content: {
				kind: "text",
				body:
					"Israel crosses the Jordan the way their parents crossed the sea. As soon as the priests carrying the ark step into the river, the water stops and the people walk over on dry ground (Joshua 3:15–17), and Joshua tells them God did it just as he dried up the Red Sea (4:23).\n\n" +
					"They camp at Gilgal, near Jericho (4:19), and keep the Passover there (5:10). The next day they eat food grown in the land, and the manna that fed them for forty years stops (5:11–12). The wilderness is over. Jericho stands in front of them.",
			},
		},
		{
			book: "JOS",
			startChapter: 5,
			startVerse: 13,
			endVerse: 15,
			title: "The commander of the LORD's army",
			explanation:
				"Joshua meets a man with a drawn sword and asks the obvious question: are you for us or for our enemies? (5:13). Notice the answer in verse 14: neither. He has come as commander of the LORD's army, and Joshua falls face down and worships. Notice what Joshua is told to do in verse 15, the same thing Moses was told at the burning bush (Exodus 3:5).",
		},
		{
			book: "JOS",
			startChapter: 6,
			startVerse: 1,
			endVerse: 14,
			title: "Six days of silence",
			explanation:
				"Before a single step is taken, God says he has already given Jericho into Joshua's hand (6:2). Watch the strange plan: once around the city each day for six days, priests with seven rams' horn trumpets, the ark of the covenant in the middle (6:3–4). Notice the command in verse 10: the people are not to shout, or say a word, until the day Joshua tells them.",
		},
		{
			title: "The walls fall",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/046.The_Walls_of_Jericho_Fall_Down.jpg/1280px-046.The_Walls_of_Jericho_Fall_Down.jpg",
				alt: "An engraving of massive stone walls collapsing, with bodies and blocks tumbling in the foreground, while beyond the breach a procession of priests blowing long horns and carrying the ark advances in bright light.",
				caption: "The priests blew the trumpets, the people gave a great shout, and the wall fell down flat (Joshua 6:20).",
				credit: "Gustave Doré, The Walls of Jericho Fall Down, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:046.The_Walls_of_Jericho_Fall_Down.jpg",
			},
		},
		{
			book: "JOS",
			startChapter: 6,
			startVerse: 15,
			endVerse: 27,
			title: "The seventh day",
			explanation:
				"On the seventh day they march around seven times, and at the trumpet blast the people shout and the wall falls (6:15–20). Verse 21 is hard to read: everything in the city is destroyed, and the text does not soften it. Notice that in the middle of the destruction the spies keep their oath: Rahab and her whole family are brought out alive (6:22–25). Joshua also pronounces a curse on anyone who rebuilds the city (6:26).",
		},
		{
			title: "Joshua",
			content: {
				kind: "character",
				entitySlug: "joshua_1727",
				note:
					"Moses' assistant, one of the two faithful spies, and now Israel's leader (Exodus 24:13; Numbers 14:6–9; Joshua 1:1–2). He does exactly what he is told, even when it makes no military sense, and the chapter ends: the LORD was with Joshua, and his fame spread through the land (Joshua 6:27).",
			},
		},
		{
			title: "Jericho in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Joshua's curse on Jericho is remembered centuries later, in the days of King Ahab, when Hiel of Bethel rebuilds the city at the cost of his firstborn and youngest sons, \"according to the word of the LORD\" spoken through Joshua (1 Kings 16:29, 34; Joshua 6:26).\n\n" +
					"The letter to the Hebrews puts the fall of Jericho in its list of what faith has done: by faith the walls fell, after the people had marched around them for seven days (Hebrews 11:30). The very next verse names Rahab, who did not perish with the rest of the city (Hebrews 11:31).",
			},
		},
		{
			title: "Walking in silence",
			content: {
				kind: "reflection",
				prompt:
					"For six days Israel walked around a wall that did not move, trusting a promise that it was already theirs. Where are you being asked to keep doing what God has said, even when you cannot yet see anything change?",
			},
			anchor: { book: "JOS", chapter: 6, verse: 2 },
		},
	],
};
