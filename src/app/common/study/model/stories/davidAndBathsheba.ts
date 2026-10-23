import { GlobalStudyDef } from "../globalStudy";

/** 2 Samuel 11–12: David's sin against Uriah and Bathsheba, and Nathan's rebuke. */
export const DAVID_AND_BATHSHEBA: GlobalStudyDef = {
	slug: "story-david-and-bathsheba",
	kind: "story",
	language: "en",
	name: "David and Bathsheba",
	description:
		"At the height of his power, King David takes another man's wife and then arranges the man's death. Read how God sent a prophet with a simple story, and what David did when he heard the words \"You are the man\".",
	topic: "The story of David, Bathsheba and Uriah, Nathan's rebuke and David's repentance (2 Samuel 11–12).",
	length: 2,
	depth: 5,
	sortOrder: 129,
	coversWholeCanon: false,
	steps: [
		{
			title: "A king at rest",
			content: {
				kind: "text",
				body:
					"By now David was king over all Israel, and the LORD gave him victory wherever he went (2 Samuel 8:6, 8:14–15). God had promised to build him a house, a family line whose kingdom would last for ever (2 Samuel 7:11–16).\n\n" +
					"Chapter 11 opens in spring, the time when kings go out to war. David sent Joab and the army out to fight the Ammonites, but he himself stayed in Jerusalem (2 Samuel 11:1).",
			},
		},
		{
			book: "2SA",
			startChapter: 11,
			title: "What David did",
			explanation:
				"Notice the verbs that follow one another in verses 2–4: David saw, sent, enquired, sent again, and took. Then watch Uriah, a foreign soldier more faithful than the king, refuse to go home while the ark and the army are in tents (11:11). Verse 15 is the letter Uriah carries to his own death. David tells Joab not to let the matter trouble him (11:25), but read the chapter's last line: what David had done displeased the LORD (11:27).",
		},
		{
			title: "Uriah the Hittite",
			content: {
				kind: "character",
				entitySlug: "uriah_2898",
				note:
					"Uriah was Bathsheba's husband (2 Samuel 11:3) and one of David's mighty men, the warriors listed at the end of 2 Samuel (23:39). The text lets his loyalty speak for itself: he would not eat and drink and lie with his wife while his comrades camped in the open field (11:11).",
			},
		},
		{
			book: "2SA",
			startChapter: 12,
			startVerse: 1,
			endVerse: 15,
			title: "You are the man",
			explanation:
				"The LORD sends Nathan to David with a story about a rich man, a poor man and one little lamb (12:1–4). Notice that David passes judgement before he knows he is judging himself (12:5–6). Listen to everything God says he had given David (12:7–8), and to the charge in verse 9. David's confession is short (12:13), and Nathan's answer holds both forgiveness and consequences (12:13–14).",
		},
		{
			title: "Nathan before David",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Eug%C3%A8ne_Siberdt_-_The_Prophet_Nathan_rebukes_King_David.jpg",
				alt: "A painting of a white-bearded man in a white robe pointing at a king who sits on a couch draped in red, while courtiers and armed guards look on.",
				caption: "Nathan said to David, \"You are the man\" (2 Samuel 12:7).",
				credit: "Eugène Siberdt, The Prophet Nathan Rebukes King David (between 1866 and 1931). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Eug%C3%A8ne_Siberdt_-_The_Prophet_Nathan_rebukes_King_David.jpg",
			},
		},
		{
			title: "Nathan",
			content: {
				kind: "character",
				entitySlug: "nathan_2153",
				note:
					"Nathan was the prophet who brought David God's promise of a lasting house (2 Samuel 7:4–17) and, here, God's rebuke (12:1). Later he stood with Bathsheba to see that her son Solomon became king (1 Kings 1:11–14, 1:34).",
			},
		},
		{
			book: "2SA",
			startChapter: 12,
			startVerse: 16,
			endVerse: 31,
			title: "The child, and Solomon",
			explanation:
				"David fasts and lies on the ground while the child is ill (12:16). Notice what he does when he hears the child has died: he gets up, washes and worships (12:20), and explains why in verses 22–23. Then David comforts Bathsheba, and a second son is born. Watch verses 24–25: the LORD loved Solomon, and sent Nathan to give him another name.",
		},
		{
			title: "Bathsheba",
			content: {
				kind: "character",
				entitySlug: "bathsheba_416",
				note:
					"Bathsheba was the daughter of Eliam and the wife of Uriah the Hittite (2 Samuel 11:3), and she mourned for her husband when she heard he was dead (11:26). She became the mother of Solomon (12:24), and Matthew names her in Jesus' family line as \"the wife of Uriah\" (Matthew 1:6).",
			},
		},
		{
			title: "David's sin in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Psalm 51 is headed as David's prayer when Nathan the prophet came to him after he had gone in to Bathsheba (Psalm 51, title). In it David asks God to blot out his transgressions (Psalm 51:1), confesses that his sin is ever before him (51:3), and asks God to create a clean heart in him (51:10).\n\n" +
					"The consequences Nathan foretold came within David's own family (2 Samuel 12:10–11), as the following chapters show (2 Samuel 13:28–29; 15:13–14). Long afterwards, the book of Kings summed up David's life this way: he did what was right in the eyes of the LORD all his days, except in the matter of Uriah the Hittite (1 Kings 15:5).",
			},
		},
		{
			title: "I have sinned",
			content: {
				kind: "reflection",
				prompt:
					"Nathan's story let David see his sin clearly before he knew it was his own, and David answered simply, \"I have sinned against the LORD\" (2 Samuel 12:13). Is there something God may be showing you that you have been explaining away? What would an honest answer to him sound like?",
			},
			anchor: { book: "2SA", chapter: 12, verse: 13 },
		},
	],
};
