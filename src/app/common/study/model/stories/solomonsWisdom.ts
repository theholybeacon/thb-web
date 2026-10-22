import { GlobalStudyDef } from "../globalStudy";

/** 1 Kings 3: Solomon's dream at Gibeon and the judgement between two mothers. */
export const SOLOMONS_WISDOM: GlobalStudyDef = {
	slug: "story-solomons-wisdom",
	kind: "story",
	language: "en",
	name: "The Wisdom of Solomon",
	description:
		"God tells a young king to ask for anything he wants, and Solomon asks for wisdom to govern well. Read his request, God's answer, and the case of two mothers and one baby that showed all Israel what that wisdom looked like.",
	topic: "Solomon's dream at Gibeon and his judgement between two women who claimed the same child (1 Kings 3).",
	length: 1,
	depth: 3,
	sortOrder: 130,
	coversWholeCanon: false,
	steps: [
		{
			title: "A young king on David's throne",
			content: {
				kind: "text",
				body:
					"Solomon was the son of David and Bathsheba (2 Samuel 12:24). When David died, Solomon sat on his father's throne, and his kingdom was firmly established (1 Kings 2:10–12). Before he died, David charged him to walk in God's ways and keep his commandments (1 Kings 2:2–3).\n\n" +
					"First Kings is honest about the young king from the start: Solomon loved the LORD, walking in the ways of his father David, except that he offered sacrifices at the high places (1 Kings 3:3), and he made a marriage alliance with Pharaoh, king of Egypt (1 Kings 3:1).",
			},
		},
		{
			book: "1KI",
			startChapter: 3,
			startVerse: 1,
			endVerse: 15,
			title: "The dream at Gibeon",
			explanation:
				"After Solomon offers a thousand burnt offerings at Gibeon, the LORD appears to him in a dream and invites him to ask for whatever he wants (3:4–5). Notice how Solomon sees himself: as a little child who does not know how to go out or come in (3:7). Watch what he asks for in verse 9, a heart able to judge the people and tell good from evil, and how God answers with more than he asked (3:11–13).",
		},
		{
			title: "Solomon",
			content: {
				kind: "character",
				entitySlug: "solomon_2762",
				note:
					"Solomon built the temple in Jerusalem (1 Kings 6:14), and God gave him wisdom greater than all the wise men of the East and of Egypt (4:29–30). The same book tells plainly that when he was old, his many wives turned his heart after other gods (11:4).",
			},
		},
		{
			book: "1KI",
			startChapter: 3,
			startVerse: 16,
			endVerse: 28,
			title: "Two mothers and one child",
			explanation:
				"Two women come before the king, each claiming the living baby as hers, and there is no witness (3:17–22). Notice that Solomon first repeats both claims back (3:23) and then asks for a sword (3:24). Watch for what gives the true mother away in verse 26: her compassion for her son. The last verse tells you what the people saw: the wisdom of God was in him to do justice (3:28).",
		},
		{
			title: "The judgement of Solomon",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/084.The_Judgment_of_Solomon.jpg/1280px-084.The_Judgment_of_Solomon.jpg",
				alt: "An engraving of a king standing before his throne with one arm raised, while a soldier holds a baby aloft with a sword in his other hand and a woman kneels at the soldier's feet reaching up; a second woman stands apart to the left.",
				caption:
					"The real mother begged the king to give the baby to the other woman rather than kill him (1 Kings 3:26).",
				credit: "Gustave Doré, The Judgment of Solomon, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:084.The_Judgment_of_Solomon.jpg",
			},
		},
		{
			title: "The wisdom of Solomon",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Tissot_The_Wisdom_of_Solomon.jpg",
				alt: "A painting of a king on a throne in a pillared hall, leaning towards a kneeling woman in a blue robe who stretches out her arms, while a soldier beside her holds up a small child and raises a sword, and a crowd watches from behind.",
				caption:
					"All Israel heard of the judgement the king had given, and they stood in awe of him (1 Kings 3:28).",
				credit: "James Tissot, The Wisdom of Solomon (c. 1896). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Tissot_The_Wisdom_of_Solomon.jpg",
			},
		},
		{
			title: "Solomon's wisdom in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Solomon's wisdom became famous: he spoke three thousand proverbs, and people came from every nation to hear him (1 Kings 4:32–34). The queen of Sheba travelled to test him with hard questions and went home amazed (1 Kings 10:1–7). The book of Proverbs opens with his name (Proverbs 1:1) and teaches that the fear of the LORD is the beginning of wisdom (Proverbs 9:10).\n\n" +
					"Jesus pointed to that queen's journey and said that something greater than Solomon was now here (Matthew 12:42). And James repeats the invitation Solomon received: if anyone lacks wisdom, let him ask God, who gives generously to all (James 1:5).",
			},
		},
		{
			title: "What would you ask for?",
			content: {
				kind: "reflection",
				prompt:
					"Offered anything he wanted, Solomon asked for an understanding heart to serve the people well (1 Kings 3:9). If God asked you what he should give you, what would you ask for, and why?",
			},
			anchor: { book: "1KI", chapter: 3, verse: 9 },
		},
	],
};
