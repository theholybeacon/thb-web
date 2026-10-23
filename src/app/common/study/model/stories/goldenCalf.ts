import { GlobalStudyDef } from "../globalStudy";

/** Exodus 32 (with 34:1–10): the golden calf, Moses' prayer, the broken tablets and the covenant renewed. */
export const GOLDEN_CALF: GlobalStudyDef = {
	slug: "story-golden-calf",
	kind: "story",
	language: "en",
	name: "The Golden Calf",
	description:
		"Weeks after promising to obey God, the people melt down their earrings and bow to a calf of gold. Read what happened at the foot of Sinai, the man who stood between them and God's anger, and the name God proclaimed afterwards.",
	topic: "Israel's worship of the golden calf, Moses' intercession and the renewal of the covenant (Exodus 32; 34:1–10).",
	length: 2,
	depth: 4,
	sortOrder: 118,
	coversWholeCanon: false,
	steps: [
		{
			title: "Waiting at the foot of the mountain",
			content: {
				kind: "text",
				body:
					"After hearing God's words at Sinai, the people answered twice with one voice: everything the LORD has said, we will do (Exodus 24:3, 7). Then Moses went up the mountain to receive the stone tablets, leaving Aaron and Hur in charge (24:12–14).\n\n" +
					"He was gone forty days and forty nights (24:18). On the mountain God gave him instructions for a tent where he would live among his people (25:8). At the bottom of the mountain, the people were growing tired of waiting.",
			},
		},
		{
			book: "EXO",
			startChapter: 32,
			startVerse: 1,
			endVerse: 14,
			title: "The calf, and Moses' prayer",
			explanation:
				"Notice how quickly it happens: the people ask for gods to go before them (32:1), Aaron collects their gold (32:2–4), and they say the calf is what brought them out of Egypt (32:4). Aaron even calls the next day a feast to the LORD (32:5). Then listen to Moses pray in verses 11–13. He does not defend the people; he appeals to God's own name and his promise to Abraham, Isaac and Israel.",
		},
		{
			title: "The Adoration of the Golden Calf",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/1/16/Nicolas_Poussin_-_The_Adoration_of_the_Golden_Calf_-_WGA18293.jpg",
				alt: "A painting of men and women dancing in a ring around a golden calf standing on a tall pedestal, while a man in white robes gestures toward it and others kneel and raise their hands.",
				caption: "The people rose early, offered sacrifices, sat down to eat and drink, and got up to play (Exodus 32:6).",
				credit: "Nicolas Poussin, The Adoration of the Golden Calf (about 1634). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Nicolas_Poussin_-_The_Adoration_of_the_Golden_Calf_-_WGA18293.jpg",
			},
		},
		{
			title: "Aaron",
			content: {
				kind: "character",
				entitySlug: "aaron_1",
				note:
					"Moses' brother and spokesman, left in charge of the people (Exodus 24:14). He made the calf with his own hands (32:4), and then told Moses he had only thrown the gold into the fire and \"out came this calf\" (32:24). Even so, he and his sons were afterwards ordained as Israel's priests (Leviticus 8), as God had commanded (Exodus 28:1).",
			},
		},
		{
			book: "EXO",
			startChapter: 32,
			startVerse: 15,
			endVerse: 35,
			title: "Broken tablets",
			explanation:
				"Notice what Moses is carrying as he comes down: tablets that were God's own work, written by God (32:16). When he sees the dancing, he breaks them at the foot of the mountain (32:19). The middle of this passage is hard to read: Moses calls for those on the LORD's side, and the Levites kill about three thousand people (32:26–28). The text does not soften it. Then watch Moses go back up to pray again, and offer to be blotted out of God's book for the people's sake (32:31–32).",
		},
		{
			title: "Moses breaks the tablets",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/041A.Moses_Breaks_the_Tables_of_the_Law.jpg/1280px-041A.Moses_Breaks_the_Tables_of_the_Law.jpg",
				alt: "An engraving of Moses holding a stone tablet high above his head with both arms, his cloak blowing in the wind, while frightened people below shield themselves or cower; lightning flashes behind him.",
				caption: "When Moses saw the calf and the dancing, his anger burned, and he threw the tablets down and broke them (Exodus 32:19).",
				credit: "Gustave Doré, Moses Breaks the Tables of the Law, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:041A.Moses_Breaks_the_Tables_of_the_Law.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 34,
			startVerse: 1,
			endVerse: 10,
			title: "New tablets, and God's name",
			explanation:
				"God tells Moses to cut two new tablets like the first (34:1). The story does not end with the broken ones. Then read verses 6 and 7 slowly: this is how God describes himself, right after the calf. He is merciful and gracious, slow to anger and abounding in steadfast love, forgiving sin, and yet he does not pretend that sin does not matter. Notice Moses' prayer in verse 9, and God's answer: I am making a covenant (34:10).",
		},
		{
			title: "The calf in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Israel's later worship songs and prayers come back to this day. Psalm 106 says they exchanged their glory for the image of a grass-eating ox, and that God would have destroyed them had Moses not stood in the breach before him (Psalm 106:19–23). When the people confess their history after the exile, they remember the calf and also that God did not abandon them in the wilderness (Nehemiah 9:17–19).\n\n" +
					"The words God spoke to Moses in Exodus 34:6 echo through the Bible (Numbers 14:18; Psalm 103:8; Jonah 4:2). In the New Testament, Stephen recalls the calf (Acts 7:39–41), and Paul quotes Exodus 32:6 as a warning against idolatry (1 Corinthians 10:7).",
			},
		},
		{
			title: "What we put in God's place",
			content: {
				kind: "reflection",
				prompt:
					"The people wanted a god they could see while they waited for the one they could not. When God seems slow, what are you tempted to put in his place, and what do Exodus 34:6–7 tell you about who he really is?",
			},
			anchor: { book: "EXO", chapter: 34, verse: 6 },
		},
	],
};
