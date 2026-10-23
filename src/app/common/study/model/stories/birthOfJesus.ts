import { GlobalStudyDef } from "../globalStudy";

/** Matthew 1–2 and Luke 1–2: the birth of Jesus, as both Gospels tell it. */
export const BIRTH_OF_JESUS: GlobalStudyDef = {
	slug: "story-birth-of-jesus",
	kind: "story",
	language: "en",
	name: "The Birth of Jesus",
	description:
		"An angel visits Mary in Nazareth, Joseph has a dream, shepherds leave their flocks at night and travellers follow a star. Read the Christmas story as the Bible tells it, from Matthew and Luke side by side.",
	topic: "The announcement and birth of Jesus, the shepherds, Simeon and Anna, and the visit of the magi (Luke 1–2; Matthew 1–2).",
	length: 3,
	depth: 4,
	sortOrder: 138,
	coversWholeCanon: false,
	steps: [
		{
			title: "Two Gospels, one birth",
			content: {
				kind: "text",
				body:
					"Two of the four Gospels tell of Jesus' birth, and each tells a different part. Matthew follows Joseph: his dreams, the visit of the magi, King Herod's anger and the escape to Egypt (Matthew 1:18–2:23). Luke follows Mary: the angel's visit, her stay with her relative Elizabeth, the shepherds, and the old man Simeon in the temple (Luke 1:26–2:40).\n\n" +
					"Luke says he investigated everything carefully in order to write an orderly account (Luke 1:3). Matthew opens with Jesus' family line, traced back to David and Abraham (Matthew 1:1). This study reads the two side by side.",
			},
		},
		{
			book: "LUK",
			startChapter: 1,
			startVerse: 26,
			endVerse: 56,
			title: "The angel comes to Mary",
			explanation:
				"Notice where the angel Gabriel is sent: to Nazareth, a town in Galilee, to a virgin engaged to Joseph (1:26–27). Listen to Mary's question in verse 34 and her answer in verse 38. Then she hurries to her relative Elizabeth, and her words become a song of praise (1:46–55); watch who God lifts up in it, and who he brings down (1:52).",
		},
		{
			title: "Mary",
			content: {
				kind: "character",
				entitySlug: "mary_1938",
				note:
					"Mary's answer to the angel is one of the simplest in the Bible: she calls herself the Lord's servant and accepts his word (Luke 1:38). Luke says she treasured up all that happened and pondered it in her heart (Luke 2:19). She was there at the cross (John 19:25) and among the disciples praying after Jesus rose (Acts 1:14).",
			},
		},
		{
			book: "MAT",
			startChapter: 1,
			startVerse: 18,
			endVerse: 25,
			title: "Joseph's dream",
			explanation:
				"Here the story is told from Joseph's side. Notice what kind of man he is: just, and unwilling to put Mary to shame (1:19). Watch what the angel tells him to name the child, and why (1:21). Notice how the passage ends: Joseph does exactly as the angel commanded (1:24).",
		},
		{
			title: "Joseph",
			content: {
				kind: "character",
				entitySlug: "joseph_1715",
				note:
					"Joseph acts at once on every message God sends him in dreams (Matthew 1:24; 2:14; 2:21). He was of the house of David (Luke 2:4), and the people of Nazareth later called Jesus \"the carpenter's son\" (Matthew 13:55).",
			},
		},
		{
			book: "LUK",
			startChapter: 2,
			startVerse: 1,
			endVerse: 20,
			title: "The birth and the shepherds",
			explanation:
				"Notice how plainly the birth itself is told (2:6–7): a firstborn son, wrapped in cloths and laid in a manger, because there was no room for them. Then watch who hears the news first: shepherds at work in the fields at night (2:8). The sign they are given is the manger (2:12). They go with haste, tell what they saw, and return praising God (2:16–20).",
		},
		{
			title: "The shepherds at the manger",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Brooklyn_Museum_-_The_Adoration_of_the_Shepherds_%28L%27adoration_des_bergers%29_-_James_Tissot_-_overall.jpg",
				alt: "A painting of a dim, cave-like shelter: a woman in white kneels over a newborn baby lying on straw, while shepherds crowd in from the left with lambs, birds and baskets; an ox and a donkey look on, and a man watches from the right.",
				caption:
					"Luke mentions a manger (Luke 2:7) and shepherds who came in haste (Luke 2:16). The ox and donkey are the painter's addition; the text does not mention them.",
				credit: "James Tissot, The Adoration of the Shepherds (1886–1894), Brooklyn Museum. Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Adoration_of_the_Shepherds_(L%27adoration_des_bergers)_-_James_Tissot_-_overall.jpg",
			},
		},
		{
			book: "LUK",
			startChapter: 2,
			startVerse: 21,
			endVerse: 40,
			title: "Simeon and Anna",
			explanation:
				"Mary and Joseph bring the child to the temple with the offering of two birds (2:24), which the law allowed for those who could not afford a lamb (Leviticus 12:8). Notice Simeon, who had been waiting for the consolation of Israel (2:25), and what he says about the child: a light for the Gentiles (2:32). Then listen to his hard word to Mary (2:34–35), and watch the old prophetess Anna, who speaks of the child to everyone waiting for redemption (2:38).",
		},
		{
			book: "MAT",
			startChapter: 2,
			title: "The magi and the king",
			explanation:
				"Magi from the east come asking for the newborn king of the Jews (2:1–2). Notice the two kings in this chapter: Herod, troubled and scheming (2:3, 2:16), and the child, worshipped with gold, frankincense and myrrh (2:11). Matthew does not say how long after the birth the magi came; by then the family is in a house (2:11). Watch how often God guides people by dreams (2:12, 2:13, 2:19, 2:22).",
		},
		{
			title: "The magi on the road",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Brooklyn_Museum_-_The_Magi_Journeying_%28Les_rois_mages_en_voyage%29_-_James_Tissot_-_overall.jpg/1280px-Brooklyn_Museum_-_The_Magi_Journeying_%28Les_rois_mages_en_voyage%29_-_James_Tissot_-_overall.jpg",
				alt: "A painting of three riders in yellow cloaks on camels leading a long caravan of people and animals down a winding road through bare desert hills.",
				caption:
					"Tissot painted three riders. Matthew says the magi came \"from the east\" (Matthew 2:1) and brought three kinds of gifts (Matthew 2:11), but he does not say how many they were.",
				credit: "James Tissot, The Magi Journeying (1886–1894), Brooklyn Museum. Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Magi_Journeying_(Les_rois_mages_en_voyage)_-_James_Tissot_-_overall.jpg",
			},
		},
		{
			title: "Treasured in her heart",
			content: {
				kind: "reflection",
				prompt:
					"While everyone around her was amazed and talking, Mary kept these things and pondered them. What part of this story do you want to keep and turn over in your own heart this week?",
			},
			anchor: { book: "LUK", chapter: 2, verse: 19 },
		},
	],
};
