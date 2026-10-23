import { GlobalStudyDef } from "../globalStudy";

/** Judges 6–7: Gideon's call, the fleece and the three hundred. */
export const GIDEON: GlobalStudyDef = {
	slug: "story-gideon",
	kind: "story",
	language: "en",
	name: "Gideon",
	description:
		"A frightened farmer threshing wheat in hiding is greeted as a mighty warrior. Read how God turned Gideon's doubts, and an army cut down to three hundred men, into a victory no one could boast about.",
	topic: "The story of Gideon's call, the fleece, and the defeat of Midian with three hundred men (Judges 6–7).",
	length: 2,
	depth: 4,
	sortOrder: 123,
	coversWholeCanon: false,
	steps: [
		{
			title: "Seven years of Midian",
			content: {
				kind: "text",
				body:
					"After Deborah's victory the land had rest for forty years (Judges 5:31). Then Israel again did what was evil in the sight of the LORD, and he gave them into the hand of Midian for seven years (Judges 6:1).\n\n" +
					"The raiders came with their camels and tents, as many as locusts, destroying the crops and leaving no food or livestock behind, so that Israel hid in caves and strongholds in the mountains (Judges 6:2–5). When Israel cried out, God first sent a prophet to remind them who had brought them out of Egypt and how they had not listened (Judges 6:7–10).",
			},
		},
		{
			book: "JDG",
			startChapter: 6,
			startVerse: 1,
			endVerse: 24,
			title: "The angel at the winepress",
			explanation:
				"Notice where Gideon is: threshing wheat in a winepress to hide it from the Midianites (6:11), and how the angel greets him anyway, as a mighty man (6:12). Gideon answers with honest questions and with his weakness: his clan is the weakest in Manasseh, and he is the least in his family (6:13, 6:15). Watch for the fire from the rock (6:21) and the altar he names \"The LORD is peace\" (6:24).",
		},
		{
			book: "JDG",
			startChapter: 6,
			startVerse: 25,
			endVerse: 40,
			title: "Baal's altar and the fleece",
			explanation:
				"Gideon's first task is at home: to tear down his father's altar to Baal, and he does it at night because he is afraid (6:25–27). Notice his father's answer to the angry town: if Baal is a god, let him defend himself (6:31). Then the Spirit of the LORD comes on Gideon (6:34), and still he asks for a sign with a fleece, twice, and God answers both times (6:36–40).",
		},
		{
			title: "Gideon",
			content: {
				kind: "character",
				entitySlug: "gideon_1314",
				note:
					"Gideon was the son of Joash the Abiezrite, from Ophrah (Judges 6:11), and was also called Jerubbaal after he pulled down Baal's altar (6:32). The letter to the Hebrews names him among those who through faith conquered kingdoms (Hebrews 11:32–33).",
			},
		},
		{
			book: "JDG",
			startChapter: 7,
			title: "Three hundred men",
			explanation:
				"Read verse 2 carefully: God says the army is too large, so that Israel cannot boast that its own hand saved it. Watch the numbers fall from thirty-two thousand to ten thousand to three hundred (7:3, 7:6–7). Before the battle God lets Gideon overhear a Midianite's dream, and Gideon worships (7:13–15). The weapons are trumpets, empty jars and torches (7:16), and verse 22 tells you who gave the victory.",
		},
		{
			title: "At the water",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/054.Gideon_Chooses_300_Soldiers.jpg/1280px-054.Gideon_Chooses_300_Soldiers.jpg",
				alt: "An engraving of a wide stretch of still water at dusk, with many men kneeling and bending to drink at its edge while riders on horses and camels look on.",
				caption:
					"God tested the men at the water and kept the three hundred who lapped it from their hands (Judges 7:5–7).",
				credit: "Gustave Doré, Gideon Chooses 300 Soldiers, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:054.Gideon_Chooses_300_Soldiers.jpg",
			},
		},
		{
			title: "The camp of Midian runs",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/055.The_Midianites_Are_Routed.jpg/1280px-055.The_Midianites_Are_Routed.jpg",
				alt: "An engraving of a night scene: torches blaze on a hilltop while below a mass of riders, horses and camels scatter in confusion.",
				caption:
					"The three hundred blew their trumpets, broke their jars and held up their torches around the camp, and the whole army of Midian ran (Judges 7:19–21).",
				credit: "Gustave Doré, The Midianites Are Routed, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:055.The_Midianites_Are_Routed.jpg",
			},
		},
		{
			title: "Gideon in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"After the victory the people asked Gideon to rule over them, and he refused: \"the LORD will rule over you\" (Judges 8:23). The same chapter honestly adds that the golden ephod he made became a snare to him and his family (Judges 8:27).\n\n" +
					"The day of Midian became a picture of rescue for later generations. Isaiah promises that God will break the oppressor's rod \"as on the day of Midian\" (Isaiah 9:4), and a psalm prays that Israel's enemies be dealt with as Midian's princes Oreb and Zeeb were (Psalm 83:9–11; Judges 7:25). Hebrews remembers Gideon among the people of faith (Hebrews 11:32).",
			},
		},
		{
			title: "Not by our own hand",
			content: {
				kind: "reflection",
				prompt:
					"God called a frightened man a mighty warrior, then made his army small so that Israel could not boast that it had saved itself (Judges 7:2). Where might God be asking you to rely on him rather than on your own strength?",
			},
			anchor: { book: "JDG", chapter: 7, verse: 2 },
		},
	],
};
