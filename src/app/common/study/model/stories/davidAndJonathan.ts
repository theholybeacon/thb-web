import { GlobalStudyDef } from "../globalStudy";

/** 1 Samuel 18–20: the friendship of David and Jonathan, and Saul's jealousy. */
export const DAVID_AND_JONATHAN: GlobalStudyDef = {
	slug: "story-david-and-jonathan",
	kind: "story",
	language: "en",
	name: "David and Jonathan",
	description:
		"The king's son should have been David's rival. Instead Jonathan loved him, defended him against his own father, and risked his life to warn him. Read one of the Bible's great friendships, kept faithfully on both sides.",
	topic: "The friendship of David and Jonathan, and Saul's growing jealousy of David (1 Samuel 18–20).",
	length: 2,
	depth: 4,
	sortOrder: 128,
	coversWholeCanon: false,
	steps: [
		{
			title: "The king's son",
			content: {
				kind: "text",
				body:
					"Jonathan was Saul's son and a brave soldier in his own right. Once he climbed up to a Philistine outpost with only his armour-bearer, saying that nothing can stop the LORD from saving, whether by many or by few (1 Samuel 14:6).\n\n" +
					"But God had rejected Saul as king and had Samuel anoint David instead (1 Samuel 15:26; 16:13). After David killed Goliath, Saul kept him at court and would not let him go home (1 Samuel 18:2). So the young man God had chosen came to live beside the young man who, by birth, expected the throne (1 Samuel 20:31).",
			},
		},
		{
			book: "1SA",
			startChapter: 18,
			title: "Love and jealousy",
			explanation:
				"The chapter opens with Jonathan loving David as his own soul (18:1) and making a covenant with him. Notice what he gives away in verse 4: his robe, armour, sword, bow and belt. Then watch the song the women sing (18:7) and how Saul hears it (18:8–9). Count how many times the chapter says the LORD was with David (18:12, 18:14, 18:28), and how Saul's fear grows each time.",
		},
		{
			title: "Saul's spear",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/072.Saul_Attempts_to_Kill_David.jpg/1280px-072.Saul_Attempts_to_Kill_David.jpg",
				alt: "An engraving of a young man with a harp shrinking back against a palace wall as a man in royal robes hurls a spear at him.",
				caption:
					"While David played the lyre, Saul hurled his spear, meaning to pin David to the wall, but David escaped him twice (1 Samuel 18:10–11).",
				credit: "Gustave Doré, Saul Attempts to Kill David, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:072.Saul_Attempts_to_Kill_David.jpg",
			},
		},
		{
			title: "Jonathan",
			content: {
				kind: "character",
				entitySlug: "jonathan_1692",
				note:
					"Jonathan was the son of King Saul and the heir to his throne (1 Samuel 14:1; 20:31). He loved David and bound himself to him by covenant (18:3; 20:16–17), and he died beside his father in battle on Mount Gilboa (31:1–2).",
			},
		},
		{
			book: "1SA",
			startChapter: 19,
			title: "Saul seeks David's life",
			explanation:
				"Now Saul says it openly: he tells Jonathan and his servants to kill David (19:1). Notice how Jonathan answers, by reminding his father of all the good David has done (19:4–5), and how quickly Saul's oath to spare him is broken (19:6, 19:9–10). Watch how David escapes this time: through a window, helped by Saul's own daughter Michal (19:11–12).",
		},
		{
			book: "1SA",
			startChapter: 20,
			title: "The arrows in the field",
			explanation:
				"David tells Jonathan there is only a step between him and death (20:3). Notice that Jonathan asks David to keep faith with his family for ever, even after the LORD has cut off David's enemies (20:14–17). At the feast, Saul's anger turns on his own son, and Saul throws his spear at Jonathan (20:30–33). Then watch the signal with the arrows (20:35–40), and the farewell in verses 41–42.",
		},
		{
			title: "The farewell",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/073A.David_and_Jonathan.jpg/1280px-073A.David_and_Jonathan.jpg",
				alt: "An engraving of two young men beside a pool in a dense wood, one seated with his head bowed and the other standing close beside him, holding his hand.",
				caption:
					"They kissed one another and wept together, and Jonathan sent David away in peace, under the oath they had sworn in the name of the LORD (1 Samuel 20:41–42).",
				credit: "Gustave Doré, David and Jonathan, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:073A.David_and_Jonathan.jpg",
			},
		},
		{
			title: "The covenant kept",
			content: {
				kind: "text",
				body:
					"They met once more. While Saul hunted David in the wilderness, Jonathan went to him and strengthened his hand in God, telling him he would be king over Israel and Jonathan would be next to him (1 Samuel 23:16–17).\n\n" +
					"It did not happen that way: Jonathan was killed with his father in battle (1 Samuel 31:2). David mourned him in a lament, saying Jonathan's love had been wonderful to him (2 Samuel 1:25–26). Years later, as king, David asked whether anyone was left of Saul's house to whom he could show kindness for Jonathan's sake, and he brought Jonathan's lame son Mephibosheth to eat at his table for the rest of his life (2 Samuel 9:1–7, 9:13).",
			},
		},
		{
			title: "A faithful friend",
			content: {
				kind: "reflection",
				prompt:
					"Jonathan stood to lose a throne by loving David, and he kept faith with him anyway (1 Samuel 20:30–34). Who has been that kind of friend to you, and for whom could you be one?",
			},
			anchor: { book: "1SA", chapter: 20, verse: 42 },
		},
	],
};
