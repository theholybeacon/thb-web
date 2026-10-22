import { GlobalStudyDef } from "../globalStudy";

/** 2 Kings 5: a foreign general, a servant girl, a prophet and a river. */
export const NAAMAN: GlobalStudyDef = {
	slug: "story-naaman",
	kind: "story",
	language: "en",
	name: "Elisha and Naaman",
	description:
		"A great general from an enemy nation is sick, and the only one who knows where to find help is a girl taken captive from Israel. Read how pride, a muddy river and a prophet who refused payment changed his life.",
	topic: "The healing of Naaman the Syrian by washing in the Jordan, and the greed of Elisha's servant Gehazi (2 Kings 5).",
	length: 1,
	depth: 3,
	sortOrder: 132,
	coversWholeCanon: false,
	steps: [
		{
			title: "Two enemy nations",
			content: {
				kind: "text",
				body:
					"Elisha was the prophet who followed Elijah. God told Elijah to anoint him as prophet in his place (1 Kings 19:16), and when Elijah was taken up, Elisha asked for a double share of his spirit (2 Kings 2:9).\n\n" +
					"In Elisha's day Israel was often at war with its northern neighbour Aram, also called Syria. Raiding bands from Aram crossed the border and carried people away (2 Kings 5:2), and the king of Aram made war against Israel (2 Kings 6:8). This story begins on the enemy's side of that border, in the house of Aram's most honoured soldier.",
			},
		},
		{
			book: "2KI",
			startChapter: 5,
			startVerse: 1,
			endVerse: 14,
			title: "Go and wash in the Jordan",
			explanation:
				"Notice who points the way: not a king or a priest, but a captive girl who serves Naaman's wife (5:2–3). Watch Naaman's anger in verses 11–12: he expected the prophet to come out and do something impressive. And notice what turns him round: his own servants, asking him why he would not do a simple thing (5:13).",
		},
		{
			title: "Naaman",
			content: {
				kind: "character",
				entitySlug: "naaman_2122",
				note:
					"Naaman was commander of the army of the king of Aram, a great man and a mighty warrior, but he had leprosy (2 Kings 5:1). The same verse says it was the LORD who had given Aram victory through him.",
			},
		},
		{
			title: "Naaman washes in the Jordan",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/6/60/Naaman_washes_in_Jordan.jpg",
				alt: "An engraving of a bearded man kneeling waist-deep in a river while a servant kneels on the bank holding a cloth; soldiers with spears, horses and a covered carriage wait behind them under a palm tree.",
				caption:
					"After the seventh time in the water, his skin was restored and became clean, like a little child's (2 Kings 5:14).",
				credit: "Unknown artist, Naaman Washes in Jordan, from The Story of the Bible from Genesis to Revelation (1873). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Naaman_washes_in_Jordan.jpg",
			},
		},
		{
			book: "2KI",
			startChapter: 5,
			startVerse: 15,
			endVerse: 19,
			title: "No God in all the earth but in Israel",
			explanation:
				"Naaman comes back to Elisha a different man, and says so in verse 15. Notice that Elisha will not take a single gift (5:16). Then listen to Naaman's two unusual requests: earth from Israel to take home (5:17), and pardon for when his duty takes him into the temple of Rimmon (5:18). Elisha's answer is three words: \"Go in peace\" (5:19).",
		},
		{
			title: "Elisha refuses the gifts",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Pieter_Fransz._de_Grebber_-_Elisha_Refusing_Gifts_from_Naaman_-_WGA10388.jpg",
				alt: "A painting of a richly dressed man in a turban standing before an old bearded man in a red cloak, who raises one hand as if declining; young attendants look on from both sides.",
				caption:
					"Elisha swore by the LORD he served that he would accept nothing (2 Kings 5:16). Naaman had brought silver, gold and ten changes of clothing (5:5).",
				credit: "Pieter de Grebber, Elisha Refusing Gifts from Naaman (about 1630). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Pieter_Fransz._de_Grebber_-_Elisha_Refusing_Gifts_from_Naaman_-_WGA10388.jpg",
			},
		},
		{
			book: "2KI",
			startChapter: 5,
			startVerse: 20,
			endVerse: 27,
			title: "Gehazi runs after him",
			explanation:
				"The story does not end with Naaman. Watch Elisha's own servant, Gehazi, decide that his master was too easy on the foreigner (5:20). Count his lies: one to Naaman (5:22) and one to Elisha (5:25). Elisha's question in verse 26 is the heart of it: was this a time to take money and clothes?",
		},
		{
			title: "Elisha",
			content: {
				kind: "character",
				entitySlug: "elisha_1153",
				note:
					"Elisha was ploughing a field when Elijah threw his cloak over him (1 Kings 19:19). Before Naaman he had helped a poor widow pay her debts (2 Kings 4:1–7) and raised a Shunammite woman's son (2 Kings 4:32–35). Here he heals a foreigner without even coming out to meet him (2 Kings 5:10–11).",
			},
		},
		{
			title: "Naaman in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Jesus brought Naaman up in the synagogue of his home town, Nazareth (Luke 4:16). There were many lepers in Israel in Elisha's time, he said, but none of them was cleansed, only Naaman the Syrian (Luke 4:27). He set it beside Elijah being sent to a widow outside Israel, in Sidon (Luke 4:25–26).\n\n" +
					"His hearers were filled with anger and drove him out of the town (Luke 4:28–29). Both of the people Jesus named were foreigners whom God helped through Israel's prophets.",
			},
		},
		{
			title: "A simple thing",
			content: {
				kind: "reflection",
				prompt:
					"Naaman almost walked away because the cure was too plain and too humble. Is there something simple God may be asking of you that you have been reluctant to do?",
			},
			anchor: { book: "2KI", chapter: 5, verse: 13 },
		},
	],
};
