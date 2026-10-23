import { GlobalStudyDef } from "../globalStudy";

/** Jonah 1–4: the prophet who ran from God, and the city God would not give up on. */
export const JONAH: GlobalStudyDef = {
	slug: "story-jonah",
	kind: "story",
	language: "en",
	name: "Jonah and the Great Fish",
	description:
		"God sends a prophet to the enemy's capital, and the prophet buys a ticket in the opposite direction. Read the whole of Jonah's short book: the storm, the fish, a city that repents, and a question God leaves hanging at the end.",
	topic: "Jonah's flight from God, the great fish, the repentance of Nineveh and God's mercy (Jonah 1–4).",
	length: 2,
	depth: 4,
	sortOrder: 137,
	coversWholeCanon: false,
	steps: [
		{
			title: "A prophet and an enemy city",
			content: {
				kind: "text",
				body:
					"Jonah, son of Amittai, was a prophet in the northern kingdom of Israel. He is mentioned in the history books too, in the reign of King Jeroboam II (2 Kings 14:23–25).\n\n" +
					"Nineveh, \"that great city\" (Jonah 1:2), was where the king of Assyria lived (2 Kings 19:36). In time Assyria would conquer Israel and carry its people away (2 Kings 17:6). That is the city God tells Jonah to go to.",
			},
		},
		{
			book: "JON",
			startChapter: 1,
			title: "Running from God",
			explanation:
				"Notice how the chapter keeps saying Jonah went \"down\": down to Joppa, down into the ship, down into its hold (1:3, 1:5). While the sailors pray to their gods, Jonah sleeps. Watch the sailors closely: they try hard to save him (1:13), and by the end they are the ones who fear the LORD and offer him sacrifices (1:16).",
		},
		{
			title: "Jonah",
			content: {
				kind: "character",
				entitySlug: "jonah_1689",
				note:
					"Jonah is honest about himself. He tells the sailors that he worships the God who made the sea and the dry land (Jonah 1:9), and later he tells God exactly why he ran: he knew God was gracious and merciful (4:2).",
			},
		},
		{
			book: "JON",
			startChapter: 2,
			title: "A prayer from the deep",
			explanation:
				"This chapter is a prayer, written like a psalm, spoken from inside the fish. Notice the images of drowning: the deep, the waves, weeds wrapped around his head. Notice also where the prayer ends: salvation comes from the LORD. Then one short verse brings him back to dry land.",
		},
		{
			title: "Jonah cast up on the shore",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/137.Jonah_Is_Spewed_Forth_by_the_Whale.jpg/1280px-137.Jonah_Is_Spewed_Forth_by_the_Whale.jpg",
				alt: "An engraving of a man lying on a wave-washed rocky shore under a stormy sky, while a huge sea creature turns back into the water behind him.",
				caption:
					"Doré drew a whale; the book of Jonah speaks of \"a great fish\" (Jonah 1:17), which at God's word threw Jonah up onto dry land (Jonah 2:10).",
				credit: "Gustave Doré, Jonah Is Spewed Forth by the Whale, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:137.Jonah_Is_Spewed_Forth_by_the_Whale.jpg",
			},
		},
		{
			book: "JON",
			startChapter: 3,
			title: "Nineveh repents",
			explanation:
				"The word of the LORD comes to Jonah \"a second time\" (3:1). Notice how short his message is (3:4), and how great the response: everyone, from the greatest to the least, fasts and puts on sackcloth, even the king (3:5–6). Listen to the king's \"Who knows?\" (3:9), and to what God does when he sees them turn (3:10).",
		},
		{
			title: "Jonah preaches to Nineveh",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/138.Jonah_Preaches_to_the_Ninevites.jpg/1280px-138.Jonah_Preaches_to_the_Ninevites.jpg",
				alt: "An engraving of a robed man standing on a stone platform with his arms spread, preaching to a crowd that kneels and bows before him in a city of great palaces, columns and a winged statue.",
				caption:
					"Jonah warned that in forty days Nineveh would be overthrown (Jonah 3:4), and the people of Nineveh believed God (Jonah 3:5).",
				credit: "Gustave Doré, Jonah Preaches to the Ninevites, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:138.Jonah_Preaches_to_the_Ninevites.jpg",
			},
		},
		{
			book: "JON",
			startChapter: 4,
			title: "Jonah's anger and God's question",
			explanation:
				"This is the surprise of the book: the city is saved and Jonah is furious (4:1). Read his reason in verse 2. Then watch God teach him with a plant, a worm and a hot east wind (4:6–8). The book ends not with Jonah's answer but with God's question (4:10–11).",
		},
		{
			title: "Jonah in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"When some of the religious leaders asked Jesus for a sign, he said the only sign they would get was the sign of the prophet Jonah: as Jonah was three days and three nights in the belly of the great fish, so the Son of Man would be three days and three nights in the heart of the earth (Matthew 12:38–40).\n\n" +
					"He added that the people of Nineveh would rise up at the judgment and condemn his own generation, because they repented at Jonah's preaching, and \"something greater than Jonah is here\" (Matthew 12:41).",
			},
		},
		{
			title: "Should I not pity Nineveh?",
			content: {
				kind: "reflection",
				prompt:
					"God's last question to Jonah is left for the reader to answer. Who are the people you would rather God did not show mercy to, and what would it mean to share his concern for them?",
			},
			anchor: { book: "JON", chapter: 4, verse: 11 },
		},
	],
};
