import { GlobalStudyDef } from "../globalStudy";

/** Exodus 3–4: God calls Moses from the burning bush and sends him back to Egypt. */
export const BURNING_BUSH: GlobalStudyDef = {
	slug: "story-burning-bush",
	kind: "story",
	language: "en",
	name: "Moses and the Burning Bush",
	description:
		"An old shepherd sees a bush on fire that does not burn up, and God speaks to him by name. Read how God tells Moses who he is, sends him back to Egypt, and answers every excuse Moses can think of.",
	topic: "God's call of Moses at the burning bush, the revelation of his name, and Moses' return to Egypt (Exodus 3–4).",
	length: 2,
	depth: 4,
	sortOrder: 113,
	coversWholeCanon: false,
	steps: [
		{
			title: "Forty years in the wilderness",
			content: {
				kind: "text",
				body:
					"When we last saw Moses he was running for his life. He had killed an Egyptian, and Pharaoh wanted him dead (Exodus 2:12, 15). He settled in Midian, married Zipporah, and named his son Gershom, because he felt like a foreigner in a foreign land (2:21–22).\n\n" +
					"Stephen's speech in Acts fills in the time: Moses was forty when he left Egypt's court to visit his people (Acts 7:23), and forty more years passed in Midian before God appeared to him (Acts 7:30). Meanwhile, back in Egypt, the Israelites groaned under their slavery, and God heard them (Exodus 2:23–24).",
			},
		},
		{
			book: "EXO",
			startChapter: 3,
			startVerse: 1,
			endVerse: 12,
			title: "A bush that does not burn up",
			explanation:
				"Notice that Moses is at work, keeping someone else's sheep, when God meets him (3:1). It is his curiosity that brings him close (3:3), and God calls him by name, twice (3:4). Listen to what God has seen, heard and known about his people (3:7), and then to Moses' first question, \"Who am I?\" (3:11). God does not answer by telling Moses who he is, but by promising to be with him (3:12).",
		},
		{
			title: "Holy ground",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Domenico_Fetti_004.jpg",
				alt: "A painting of a bearded shepherd seated on a rock with a sheep beside him, untying his sandal as he stares at a bright fire rising out of a bush.",
				caption: "Fetti paints the moment Moses obeys the command to take off his sandals, for the place he is standing on is holy ground (Exodus 3:5).",
				credit: "Domenico Fetti, Moses before the Burning Bush (about 1615–1617). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Domenico_Fetti_004.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 3,
			startVerse: 13,
			endVerse: 22,
			title: "I AM WHO I AM",
			explanation:
				"Moses asks for God's name (3:13), and the answer in verse 14 is one of the most important sentences in the Bible: \"I AM WHO I AM\" (older translations say \"I AM THAT I AM\"). In verse 15, God ties that name to the God of Abraham, Isaac and Jacob. Many English Bibles print it as \"the LORD\" in small capitals. Notice that God tells Moses in advance that Pharaoh will refuse (3:19) and that Israel will not leave empty-handed (3:21).",
		},
		{
			title: "Moses",
			content: {
				kind: "character",
				entitySlug: "moses_2108",
				note:
					"The man God calls here is eighty years old by the time he stands before Pharaoh (Exodus 7:7), and slow of speech by his own account (4:10). Later the Bible says no prophet arose in Israel like Moses, whom the LORD knew face to face (Deuteronomy 34:10).",
			},
		},
		{
			book: "EXO",
			startChapter: 4,
			startVerse: 1,
			endVerse: 17,
			title: "But what if they will not believe me?",
			explanation:
				"Count Moses' objections: they will not believe me (4:1), I am not a good speaker (4:10), and finally, please send someone else (4:13). God answers each one: three signs to show (4:2–9), a reminder of who made the human mouth (4:11), and Aaron to speak for him (4:14–16). Notice the staff in Moses' hand in verse 2, an ordinary shepherd's tool that verse 20 will call the staff of God.",
		},
		{
			title: "Aaron",
			content: {
				kind: "character",
				entitySlug: "aaron_1",
				note:
					"Moses' older brother by three years (Exodus 7:7), a Levite, whom God describes as one who can speak well and who was already on his way to meet Moses (Exodus 4:14). He becomes Moses' spokesman before the people and before Pharaoh (4:16; 7:1–2).",
			},
		},
		{
			book: "EXO",
			startChapter: 4,
			startVerse: 18,
			endVerse: 31,
			title: "Back to Egypt",
			explanation:
				"Jethro sends Moses off in peace, and he sets out with his family (4:18–20). Verses 24–26, where Zipporah circumcises their son on the road, are among the hardest in Exodus to understand, and the text explains very little; read them slowly and let them stand. Then watch the ending: Aaron meets Moses at the mountain of God (4:27), and when the people hear that God has seen their misery, they bow down and worship (4:31).",
		},
		{
			title: "The bush in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"God's sign to Moses was that the people would worship him on this same mountain (Exodus 3:12). In the third month after leaving Egypt they camp in front of it (Exodus 19:1–2). When Joshua later meets the commander of the LORD's army near Jericho, he hears the same words Moses heard: take off your sandals, for the place is holy (Joshua 5:15).\n\n" +
					"Jesus points to the account of the bush when he answers a question about the resurrection: God called himself the God of Abraham, Isaac and Jacob, and \"he is not the God of the dead, but of the living\" (Mark 12:26–27). Stephen retells the whole scene in Acts 7:30–35.",
			},
		},
		{
			title: "Who am I?",
			content: {
				kind: "reflection",
				prompt:
					"Moses asked \"Who am I?\" and God answered \"I will be with you.\" What is God asking of you that feels too big, and what difference does his promise to be with you make to it?",
			},
			anchor: { book: "EXO", chapter: 3, verse: 12 },
		},
	],
};
