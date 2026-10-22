import { GlobalStudyDef } from "../globalStudy";

/** Exodus 19–20: God meets Israel at Mount Sinai and speaks the Ten Commandments. */
export const TEN_COMMANDMENTS: GlobalStudyDef = {
	slug: "story-ten-commandments",
	kind: "story",
	language: "en",
	name: "The Ten Commandments",
	description:
		"Thunder, fire and smoke on a mountain, and a whole nation trembling at its foot. Read how God brought a people of former slaves to himself, and the words he spoke to them before he gave them anything else.",
	topic: "God's covenant with Israel at Mount Sinai and the giving of the Ten Commandments (Exodus 19–20).",
	length: 2,
	depth: 4,
	sortOrder: 117,
	coversWholeCanon: false,
	steps: [
		{
			title: "Back to the mountain",
			content: {
				kind: "text",
				body:
					"At the burning bush God gave Moses a sign: when he had brought the people out of Egypt, they would worship God on this mountain (Exodus 3:12). Now it happens. In the third month after leaving Egypt, Israel camps in front of Mount Sinai (19:1–2).\n\n" +
					"Behind them are the plagues, the sea, the manna and the water from the rock. What comes next is not a list of rules for strangers. It is God speaking to a people he has already rescued, and he begins by reminding them of that (20:2).",
			},
		},
		{
			book: "EXO",
			startChapter: 19,
			title: "On eagles' wings",
			explanation:
				"Before any commandment, God tells the people what he has done and what they can be: he carried them on eagles' wings and brought them to himself (19:4), and they can be his treasured possession, a kingdom of priests and a holy nation (19:5–6). Notice their answer in verse 8. Then watch the preparations, and the third morning: thunder, lightning, a thick cloud, a trumpet blast, and the whole mountain shaking (19:16–18).",
		},
		{
			title: "The Giving of the Law",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/038.The_Giving_of_the_Law_on_Mount_Sinai.jpg/1280px-038.The_Giving_of_the_Law_on_Mount_Sinai.jpg",
				alt: "An engraving of a crowd of people kneeling and bowing on open ground at the foot of a vast mountain range, under clouds lit from above; some raise their arms.",
				caption: "The people stood at the foot of the mountain, and the whole camp trembled (Exodus 19:16–17).",
				credit: "Gustave Doré, The Giving of the Law on Mount Sinai, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:038.The_Giving_of_the_Law_on_Mount_Sinai.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 20,
			startVerse: 1,
			endVerse: 17,
			title: "The words God spoke",
			explanation:
				"Notice the first sentence: before he tells them what to do, God tells them who he is, the one who brought them out of slavery (20:2). The first commandments are about God himself, his worship, his name and his day (20:3–11); the rest are about how people treat one another, from honouring parents to not even wanting what belongs to a neighbour (20:12–17). Jewish and Christian traditions number them in slightly different ways; the words themselves are the same.",
		},
		{
			book: "EXO",
			startChapter: 20,
			startVerse: 18,
			endVerse: 26,
			title: "The people stand far off",
			explanation:
				"The people are terrified and ask Moses to speak to them instead of God (20:19). Listen to Moses' answer in verse 20: do not be afraid, God has come to test you so that the fear of him will keep you from sinning. Notice the picture in verse 21: the people stay at a distance, while Moses goes near to the thick darkness where God is.",
		},
		{
			title: "Moses",
			content: {
				kind: "character",
				entitySlug: "moses_2108",
				note:
					"Moses goes up and down this mountain as the go-between for God and the people (Exodus 19:3, 7–8). Later the Bible says the LORD spoke with him face to face, as a man speaks with his friend (33:11).",
			},
		},
		{
			title: "Moses comes down from Sinai",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/039.Moses_Comes_Down_from_Mount_Sinai.jpg/1280px-039.Moses_Comes_Down_from_Mount_Sinai.jpg",
				alt: "An engraving of Moses, with beams of light rising from his head, holding two stone tablets and pointing upward as he comes down a dark mountainside; people watch from below at the left.",
				caption:
					"The beams of light around Moses' head recall a later descent, when he came down with the second set of tablets and his face shone because he had been speaking with the LORD (Exodus 34:29).",
				credit: "Gustave Doré, Moses Comes Down from Mount Sinai, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:039.Moses_Comes_Down_from_Mount_Sinai.jpg",
			},
		},
		{
			title: "The commandments in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"God writes these words on two tablets of stone (Exodus 31:18), and the Bible itself calls them the ten commandments (Exodus 34:28; Deuteronomy 4:13). Forty years later Moses repeats them to the next generation (Deuteronomy 1:3; 5:6–21). There, the reason given for the Sabbath is that they were once slaves in Egypt and the LORD brought them out (Deuteronomy 5:15).\n\n" +
					"Asked which commandment is the greatest, Jesus answers: love the Lord your God with all your heart, soul and mind, and love your neighbour as yourself; all the Law and the Prophets hang on these two (Matthew 22:36–40). Paul lists several of the commandments and says they are all summed up in loving your neighbour (Romans 13:9–10).",
			},
		},
		{
			title: "Rescued first",
			content: {
				kind: "reflection",
				prompt:
					"God gave the commandments to people he had already set free, and began by reminding them of it. How does it change the way you hear God's commands to know that he first rescued you?",
			},
			anchor: { book: "EXO", chapter: 20, verse: 2 },
		},
	],
};
