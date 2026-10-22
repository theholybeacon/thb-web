import { GlobalStudyDef } from "../globalStudy";

/** Genesis 4: two brothers, two offerings and the first murder. */
export const CAIN_AND_ABEL: GlobalStudyDef = {
	slug: "story-cain-and-abel",
	kind: "story",
	language: "en",
	name: "Cain and Abel",
	description:
		"Two brothers bring gifts to God, and one is angry that his was not accepted. Read how God warned Cain before he struck, what he asked him afterwards, and how he still protected him.",
	topic: "The story of Cain and Abel, the first murder, and the generations that followed (Genesis 4).",
	length: 1,
	depth: 3,
	sortOrder: 103,
	coversWholeCanon: false,
	steps: [
		{
			title: "Outside the garden",
			content: {
				kind: "text",
				body:
					"Adam and Eve now live outside Eden (Genesis 3:23–24). Their first son is Cain, and their second is Abel (Genesis 4:1–2). Abel keeps sheep and Cain works the ground (Genesis 4:2), the same ground God had said would now yield its food only through painful toil (Genesis 3:17).\n\n" +
					"In Genesis 3 sin came between people and God. In Genesis 4 it comes between brothers.",
			},
		},
		{
			book: "GEN",
			startChapter: 4,
			startVerse: 1,
			endVerse: 7,
			title: "Two offerings",
			explanation:
				"Notice how the two gifts are described: Cain brings some of the fruit of the ground, and Abel brings firstborn animals from his flock and their fat portions (4:3–4). Genesis does not say exactly why God regarded Abel's offering and not Cain's; Hebrews says Abel offered his by faith (Hebrews 11:4). Watch what God does when Cain is angry: he comes to him with a question and a warning, that sin is crouching at the door and Cain must rule over it (4:6–7).",
		},
		{
			title: "Cain and Abel offer their sacrifices",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/004.Cain_and_Abel_Offer_Their_Sacrifices.jpg/1280px-004.Cain_and_Abel_Offer_Their_Sacrifices.jpg",
				alt: "An engraving of two men in a rocky valley: one kneels in prayer beside a fire whose smoke rises straight up, while the other sits apart with his hand to his chin, watching, as thick smoke rolls along the ground in front of him.",
				caption:
					"The LORD had regard for Abel and his offering, but for Cain and his offering he had no regard (Genesis 4:4–5). Doré shows the difference with the smoke; Genesis itself does not describe it.",
				credit: "Gustave Doré, Cain and Abel Offer Their Sacrifices, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:004.Cain_and_Abel_Offer_Their_Sacrifices.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 4,
			startVerse: 8,
			endVerse: 16,
			title: "Am I my brother's keeper?",
			explanation:
				"The murder takes one verse (4:8). Then, as he did with Adam (3:9), God comes with a question: \"Where is Abel your brother?\" (4:9). Notice that Abel's blood cries out to God from the ground (4:10). And notice the mercy at the end: when Cain fears that anyone who finds him will kill him, God puts a mark on him so that no one will (4:14–15).",
		},
		{
			title: "Abel",
			content: {
				kind: "character",
				entitySlug: "abel_13",
				note:
					"Abel is Adam and Eve's second son, a keeper of sheep (Genesis 4:2). He never speaks in Genesis, yet Hebrews says that through his faith he still speaks (Hebrews 11:4), and Jesus calls him \"righteous Abel\", the first of the righteous whose blood was shed (Matthew 23:35).",
			},
		},
		{
			title: "Cain",
			content: {
				kind: "character",
				entitySlug: "cain_533",
				note:
					"Cain is Adam and Eve's firstborn and a worker of the ground (Genesis 4:1–2). After the murder he goes away from the presence of the LORD to live in the land of Nod, east of Eden (4:16), and builds a city (4:17). John holds him up as a warning: he murdered his brother because his own deeds were evil and his brother's were righteous (1 John 3:12).",
			},
		},
		{
			title: "Cain slays Abel",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/005.Cain_Slays_Abel.jpg/1280px-005.Cain_Slays_Abel.jpg",
				alt: "An engraving of a man lying still on a rocky slope under a stormy sky, while another man with a club in his hand stands bent beside a boulder, looking down at him.",
				caption: "God tells Cain that his brother's blood is crying out to him from the ground (Genesis 4:10).",
				credit: "Gustave Doré, Cain Slays Abel, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:005.Cain_Slays_Abel.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 4,
			startVerse: 17,
			endVerse: 26,
			title: "After Cain",
			explanation:
				"Watch two things grow side by side in Cain's family. Skill grows: a city, tents and livestock, music, and tools of bronze and iron (4:17–22). So does violence: Lamech boasts that he killed a man for wounding him, and that he will be avenged seventy-seven times (4:23–24). Notice how the chapter ends instead: a new son, Seth, and people beginning to call on the name of the LORD (4:25–26).",
		},
		{
			title: "Cain and Abel in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Jesus traces anger back to the same root as murder: whoever is angry with his brother is liable to judgment (Matthew 5:21–22). John uses Cain as the opposite of love: \"we should love one another\", not be like Cain (1 John 3:11–12), and Jude warns of those who walk in \"the way of Cain\" (Jude 11).\n\n" +
					"Abel's blood cried out from the ground (Genesis 4:10). Hebrews calls Jesus the mediator of a new covenant, whose blood \"speaks a better word than the blood of Abel\" (Hebrews 12:24).",
			},
		},
		{
			title: "Sin at the door",
			content: {
				kind: "reflection",
				prompt:
					"God warned Cain that sin was crouching at his door, and that he must rule over it. What is crouching at your door right now, and what would it look like to master it before it masters you?",
			},
			anchor: { book: "GEN", chapter: 4, verse: 7 },
		},
	],
};
