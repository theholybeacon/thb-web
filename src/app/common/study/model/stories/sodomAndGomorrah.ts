import { GlobalStudyDef } from "../globalStudy";

/** Genesis 18–19: the visitors at Mamre, Abraham's plea, and the fall of Sodom. */
export const SODOM_AND_GOMORRAH: GlobalStudyDef = {
	slug: "story-sodom-and-gomorrah",
	kind: "story",
	language: "en",
	name: "Sodom and Gomorrah",
	description:
		"Three strangers eat at Abraham's tent, and before they leave, Abraham is bargaining with God for the life of a city. Read how he pleaded, how Lot was pulled out of Sodom by the hand, and why his wife became a warning.",
	topic: "The story of Abraham's visitors, his plea for Sodom, and the destruction of Sodom and Gomorrah (Genesis 18–19).",
	length: 2,
	depth: 4,
	sortOrder: 107,
	coversWholeCanon: false,
	steps: [
		{
			title: "Lot's choice",
			content: {
				kind: "text",
				body:
					"Years before, Abram and his nephew Lot had grown too rich in flocks to live side by side, and Abram let Lot choose his land first (Genesis 13:6–9). Lot chose the well-watered Jordan valley and moved his tent as far as Sodom (Genesis 13:10–12). Genesis adds at once that the men of Sodom were wicked, great sinners against the LORD (Genesis 13:13).\n\n" +
					"When Lot was later carried off in a war between kings, Abram went after him and brought him back (Genesis 14:12–16). Now, many years on, Lot is living in Sodom itself (Genesis 19:1).",
			},
		},
		{
			book: "GEN",
			startChapter: 18,
			startVerse: 1,
			endVerse: 15,
			title: "Three visitors",
			explanation:
				"Genesis tells you what Abraham does not yet know: it is the LORD who appears to him (18:1), though Abraham sees three men (18:2). Notice his hospitality in the heat of the day: he runs, bows, hurries and serves (18:2–8). Then the promise of a son by this time next year, Sarah's laugh (18:12), and the question that hangs over the rest of the story: \"Is anything too hard for the LORD?\" (18:14).",
		},
		{
			title: "Abraham and the three angels",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/012.Abraham_and_the_Three_Angels.jpg/1280px-012.Abraham_and_the_Three_Angels.jpg",
				alt: "An engraving of three winged figures standing together on a ridge against a wide evening sky, while a robed man with a staff kneels on the ground before them.",
				caption:
					"Abraham looked up and saw three men standing near him, and he ran to meet them and bowed to the ground (Genesis 18:2). Genesis calls them men; Doré gives them wings; the two who go on to Sodom are called angels (19:1).",
				credit: "Gustave Doré, Abraham and the Three Angels, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:012.Abraham_and_the_Three_Angels.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 18,
			startVerse: 16,
			endVerse: 33,
			title: "Abraham pleads for the city",
			explanation:
				"Notice that God chooses to tell Abraham what he is about to do (18:17), and that he says he will go down and see whether the outcry against Sodom and Gomorrah is true (18:20–21). Abraham's question is the heart of the chapter: \"Shall not the Judge of all the earth do what is just?\" (18:25). Watch him ask again and again, from fifty righteous people down to ten, and God agree every time (18:26–32).",
		},
		{
			title: "Lot",
			content: {
				kind: "character",
				entitySlug: "lot_1830",
				note:
					"Lot is Abraham's nephew, the son of his brother Haran (Genesis 11:27). He left Haran with Abram (12:4), chose the land near Sodom (13:11–12), and was rescued twice: by Abram and his men (14:14–16) and by the angels (19:16). Peter calls him \"righteous Lot\", distressed by the lawless deeds he saw around him (2 Peter 2:7–8).",
			},
		},
		{
			book: "GEN",
			startChapter: 19,
			startVerse: 1,
			endVerse: 29,
			title: "Out of the city",
			explanation:
				"This is a hard chapter, and Genesis tells it plainly. The men of the city surround Lot's house and demand that his guests be brought out to them (19:4–5), and Lot's answer is itself shocking (19:8). Notice that even with judgment coming, Lot lingers, and the angels take him by the hand, \"the LORD being merciful to him\" (19:16). Lot's wife looks back and becomes a pillar of salt (19:26). Then verse 29 tells you why Lot was saved: God remembered Abraham. (The chapter closes, in 19:30–38, with a dark account of Lot and his daughters in a cave.)",
		},
		{
			title: "Lot flees",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/013.Lot_Flees_as_Sodom_and_Gomorrah_Burn.jpg/1280px-013.Lot_Flees_as_Sodom_and_Gomorrah_Burn.jpg",
				alt: "An engraving of an old bearded man hurrying across a plain with two young women at his side, while another woman carrying a jar follows behind them and a city burns under billowing smoke in the distance.",
				caption:
					"The LORD rained sulfur and fire on Sodom and Gomorrah; but Lot's wife, behind him, looked back (Genesis 19:24, 26).",
				credit: "Gustave Doré, Lot Flees as Sodom and Gomorrah Burn, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:013.Lot_Flees_as_Sodom_and_Gomorrah_Burn.jpg",
			},
		},
		{
			title: "Sodom in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Sodom becomes the Bible's byword for a city ripe for judgment. Isaiah addresses the leaders of Jerusalem as \"rulers of Sodom\" (Isaiah 1:10). Ezekiel names Sodom's guilt as pride, plenty of food and careless ease, while it did not help the poor and needy (Ezekiel 16:49), and Jude names its sexual immorality (Jude 7).\n\n" +
					"Jesus compares the day of his return to the days of Lot, when people were eating, drinking, buying and building until the day fire and sulfur rained from heaven (Luke 17:28–30). And he gives one of the shortest warnings in the Gospels: \"Remember Lot's wife\" (Luke 17:32).",
			},
		},
		{
			title: "Standing before the LORD",
			content: {
				kind: "reflection",
				prompt:
					"Abraham stood before the LORD and pleaded for a city that was not his own, trusting that the Judge of all the earth would do what is just. Who, or what place, could you pray for in the same way this week?",
			},
			anchor: { book: "GEN", chapter: 18, verse: 25 },
		},
	],
};
