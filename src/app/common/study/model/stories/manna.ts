import { GlobalStudyDef } from "../globalStudy";

/** Exodus 16–17: bread from heaven, water from the rock, and the battle with Amalek. */
export const MANNA: GlobalStudyDef = {
	slug: "story-manna",
	kind: "story",
	language: "en",
	name: "Manna and Water from the Rock",
	description:
		"A whole nation in the desert with no food and no water, and a people who quickly wish they were back in Egypt. Read how God fed them one day at a time, and what he was teaching them with every morning's bread.",
	topic: "God's provision of manna and quail, water from the rock at Horeb, and the battle with Amalek (Exodus 16–17).",
	length: 2,
	depth: 3,
	sortOrder: 116,
	coversWholeCanon: false,
	steps: [
		{
			title: "Three days without water",
			content: {
				kind: "text",
				body:
					"The song by the sea is barely over when the trouble starts. Three days into the wilderness they find no water, and when they do, at Marah, it is too bitter to drink (Exodus 15:22–23). The people grumble against Moses, God shows him how to make the water sweet, and they move on to Elim, with its twelve springs and seventy palm trees (15:24–27).\n\n" +
					"By the middle of the second month after leaving Egypt they are in the wilderness of Sin, and now it is food they lack (16:1–3). This is the pattern of these chapters: a real need, a frightened complaint, and God's answer.",
			},
		},
		{
			book: "EXO",
			startChapter: 16,
			title: "Bread from heaven",
			explanation:
				"Listen to the complaint in verse 3: the people remember Egypt as a place of full pots of meat, not of slavery. Notice that God answers with food, not punishment, and that the bread comes with a test: gather enough for one day (16:4). When they first see it, they do not know what it is (16:15); they call it manna (16:31). Watch what happens to those who keep it overnight (16:20), and how on the sixth day there is enough for two (16:22–26).",
		},
		{
			title: "The gathering of the manna",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Tissot_The_Gathering_of_the_Manna.jpg",
				alt: "A painting of men and women bent low over the ground, gathering something small into baskets and bowls, with tents behind them; a woman stands in the middle carrying a full basket on her head.",
				caption: "Each morning the people gathered what they needed: some gathered more, some less, and no one had too much or too little (Exodus 16:17–18).",
				credit: "James Tissot, The Gathering of the Manna (about 1896–1902). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Tissot_The_Gathering_of_the_Manna.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 17,
			startVerse: 1,
			endVerse: 7,
			title: "Water from the rock",
			explanation:
				"Again there is no water, and this time the people are close to stoning Moses (17:4). Notice that God tells Moses to take the same staff he used on the Nile (17:5), and that God himself will stand before him on the rock (17:6). The place is named for what the people did there, testing God with a question: \"Is the LORD among us or not?\" (17:7).",
		},
		{
			title: "Moses strikes the rock",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/041.Moses_Strikes_the_Rock_at_Horeb.jpg/1280px-041.Moses_Strikes_the_Rock_at_Horeb.jpg",
				alt: "An engraving of a crowd of people pressing down to a stream at the foot of tall rocks, drinking, filling jars and lifting children, while a small figure stands with raised arm against the bright cliff in the distance.",
				caption: "Moses strikes the rock at Horeb in front of the elders of Israel, and water flows for the people to drink (Exodus 17:6).",
				credit: "Gustave Doré, Moses Strikes the Rock at Horeb, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:041.Moses_Strikes_the_Rock_at_Horeb.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 17,
			startVerse: 8,
			endVerse: 16,
			title: "Hands held up",
			explanation:
				"Israel's first battle in the wilderness. Notice how it is won: Joshua fights in the valley, but the outcome follows Moses' raised hands on the hill (17:11). When Moses grows tired, Aaron and Hur sit him on a stone and hold his hands up until sunset (17:12). Moses builds an altar and names it for the LORD, his banner (17:15).",
		},
		{
			title: "Joshua",
			content: {
				kind: "character",
				entitySlug: "joshua_1727",
				note:
					"This is the first time the Bible mentions Joshua, leading Israel's fighters against Amalek (Exodus 17:9). He becomes Moses' assistant (24:13), and after Moses' death he leads the people into the promised land (Joshua 1:1–2).",
			},
		},
		{
			title: "Manna in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"The manna lasted forty years, until Israel reached the edge of Canaan (Exodus 16:35). It stopped the day after they first ate the produce of the land (Joshua 5:12). Moses later told the people what it had been for: to teach them that people do not live on bread alone, but on every word that comes from the mouth of the LORD (Deuteronomy 8:3). Jesus answers the devil with those words in the wilderness (Matthew 4:4).\n\n" +
					"Paul uses the gathering of the manna to teach generous sharing (2 Corinthians 8:15), and speaks of the spiritual food and drink Israel received in the wilderness, saying \"the rock was Christ\" (1 Corinthians 10:3–4). After feeding five thousand people (John 6:10–11), Jesus tells the crowd that their ancestors ate manna and died, but he is the living bread that came down from heaven (John 6:49–51).",
			},
		},
		{
			title: "Daily bread",
			content: {
				kind: "reflection",
				prompt:
					"God gave the manna one day at a time, and it could not be stored up. Where are you being asked to trust God for today's needs rather than for next month's, and what makes that hard?",
			},
			anchor: { book: "EXO", chapter: 16, verse: 4 },
		},
	],
};
