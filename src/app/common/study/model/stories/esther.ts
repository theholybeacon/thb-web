import { GlobalStudyDef } from "../globalStudy";

/** Esther: a Jewish queen in the Persian court and the plot against her people. */
export const ESTHER: GlobalStudyDef = {
	slug: "story-esther",
	kind: "story",
	language: "en",
	name: "Esther",
	description:
		"An orphan in exile becomes queen of Persia, and keeps quiet about who she is, until a powerful man plans to destroy her people. Read how one woman's courage and a king's sleepless night turn the story around.",
	topic: "The story of Queen Esther, her cousin Mordecai and Haman's plot against the Jews, told across the book of Esther (Esther 2–10).",
	length: 3,
	depth: 4,
	sortOrder: 133,
	coversWholeCanon: false,
	steps: [
		{
			title: "A palace in Susa",
			content: {
				kind: "text",
				body:
					"The story takes place in Susa, where King Ahasuerus of Persia sat on his throne and ruled 127 provinces from India to Ethiopia (Esther 1:1–3). Many Jews now lived in that empire, far from Jerusalem. Mordecai, one of them, came from a family carried away from Jerusalem by Nebuchadnezzar, king of Babylon (Esther 2:5–6).\n\n" +
					"Chapter 1 sets the scene. At the end of a great feast the king sent for Queen Vashti to show off her beauty, and she refused to come (Esther 1:11–12). On his advisers' counsel he removed her as queen and looked for another (Esther 1:19; 2:2–4). That is where Esther comes in.",
			},
		},
		{
			book: "EST",
			startChapter: 2,
			title: "Esther becomes queen",
			explanation:
				"Notice who Esther is: an orphan raised by her cousin Mordecai (2:7), who tells her not to reveal her people (2:10). Then watch the short scene at the end of the chapter: Mordecai uncovers a plot against the king, and it is written down in the royal records (2:21–23). It seems a small detail. Keep it in mind.",
		},
		{
			title: "Esther",
			content: {
				kind: "character",
				entitySlug: "esther_1343",
				note:
					"Esther's Hebrew name was Hadassah, and she had lost both her father and her mother (Esther 2:7). She won the favour of everyone who saw her (2:15), and the book that bears her name turns on one choice she makes in chapter 4.",
			},
		},
		{
			book: "EST",
			startChapter: 3,
			title: "Haman's plot",
			explanation:
				"Haman is raised above all the king's officials, and everyone bows to him except Mordecai (3:1–2). Watch how one man's refusal becomes a plan to destroy every Jew in the empire (3:6). The lot, called Pur, is cast to choose the day (3:7). Notice the last verse: the king and Haman sit down to drink while the city is thrown into confusion (3:15).",
		},
		{
			book: "EST",
			startChapter: 4,
			title: "For such a time as this",
			explanation:
				"Mordecai mourns in sackcloth, and messages pass back and forth between him and the queen. Notice what stands in Esther's way: anyone who goes to the king without being called may be put to death (4:11). Read Mordecai's answer slowly (4:13–14), and then Esther's: fast for me three days, and \"if I perish, I perish\" (4:16).",
		},
		{
			title: "Mordecai",
			content: {
				kind: "character",
				entitySlug: "mordecai_2107",
				note:
					"Mordecai was a Jew of the tribe of Benjamin who sat at the king's gate (Esther 2:5, 2:21). He would not bow to Haman (3:2), and the book ends with him second only to the king, seeking the good of his people (10:3).",
			},
		},
		{
			book: "EST",
			startChapter: 5,
			endChapter: 6,
			title: "Two banquets and a sleepless night",
			explanation:
				"The king holds out his golden sceptre, and Esther lives (5:2). Instead of asking at once, she invites him and Haman to a banquet, and then to a second one (5:4, 5:8). Meanwhile Haman builds a gallows for Mordecai (5:14). Then watch chapter 6: the king cannot sleep, the records from chapter 2 are read to him, and Haman arrives at exactly the wrong moment (6:1–4).",
		},
		{
			book: "EST",
			startChapter: 7,
			title: "Esther speaks",
			explanation:
				"At the second banquet Esther finally asks for her own life and the life of her people (7:3–4). Notice how few words she needs to name the enemy: it is Haman (7:6). The last verse turns his own plan back on him (7:10).",
		},
		{
			title: "Esther accuses Haman",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/117.Esther_Accuses_Haman.jpg/1280px-117.Esther_Accuses_Haman.jpg",
				alt: "An engraving in a hall of tall columns: a queen in a long embroidered robe stands and points across a table at a man who hides his face, while a bearded king sits watching.",
				caption:
					"Esther names Haman as the enemy, and Haman, the text says, was terrified before the king and the queen (Esther 7:6).",
				credit: "Gustave Doré, Esther Accuses Haman, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:117.Esther_Accuses_Haman.jpg",
			},
		},
		{
			book: "EST",
			startChapter: 8,
			endChapter: 10,
			title: "Sorrow turned to gladness",
			explanation:
				"A law of the king could not be revoked (8:8), so a second decree lets the Jews defend themselves (8:11). Watch for the line repeated three times in chapter 9: they did not lay a hand on the plunder (9:10, 9:15, 9:16). Then notice how the feast of Purim is named after the lot Haman cast (9:24–26), a month \"turned for them from sorrow into gladness\" (9:22).",
		},
		{
			title: "For such a time as this",
			content: {
				kind: "reflection",
				prompt:
					"Mordecai asked Esther whether she had come to her position \"for such a time as this.\" Where has God placed you, and what might it be for?",
			},
			anchor: { book: "EST", chapter: 4, verse: 14 },
		},
	],
};
