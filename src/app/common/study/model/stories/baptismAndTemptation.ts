import { GlobalStudyDef } from "../globalStudy";

/** Matthew 3–4: Jesus is baptised by John, tested in the wilderness, and begins to preach. */
export const BAPTISM_AND_TEMPTATION: GlobalStudyDef = {
	slug: "story-baptism-and-temptation",
	kind: "story",
	language: "en",
	name: "The Baptism and Temptation of Jesus",
	description:
		"A voice from heaven calls Jesus his beloved Son, and straight away he is led into the desert to be tested. Read how Jesus' public life began: at the river with John, alone in the wilderness, and on the shore calling his first followers.",
	topic: "John the Baptist's preaching, the baptism of Jesus, his temptation in the wilderness and the start of his ministry in Galilee (Matthew 3–4).",
	length: 2,
	depth: 4,
	sortOrder: 139,
	coversWholeCanon: false,
	steps: [
		{
			title: "A voice in the wilderness",
			content: {
				kind: "text",
				body:
					"Matthew moves from Jesus' childhood in Nazareth (Matthew 2:23) straight to the day he came from Galilee to the Jordan River (Matthew 3:13). Luke says he was about thirty years old when he began his work (Luke 3:23).\n\n" +
					"First comes John, the son of the priest Zechariah and his wife Elizabeth, born to them in their old age (Luke 1:5–7, 1:13). Elizabeth was a relative of Mary, Jesus' mother (Luke 1:36). Matthew introduces him with words from Isaiah about a voice crying in the wilderness: prepare the way of the Lord (Matthew 3:3; Isaiah 40:3).",
			},
		},
		{
			book: "MAT",
			startChapter: 3,
			startVerse: 1,
			endVerse: 12,
			title: "John the Baptist",
			explanation:
				"Notice John's message in one line: repent, for the kingdom of heaven is at hand (3:2). Watch the crowds coming from Jerusalem and all Judea, confessing their sins (3:5–6), and how sharply he speaks to the religious leaders (3:7–10). Then notice who John says is coming after him, someone so much greater that he is not worthy to carry his sandals (3:11).",
		},
		{
			title: "John the Baptist",
			content: {
				kind: "character",
				entitySlug: "john_1676",
				note:
					"John lived in the wilderness, dressed in camel's hair and ate locusts and wild honey (Matthew 3:4). Jesus later said that no one born of women was greater than John (Matthew 11:11).",
			},
		},
		{
			book: "MAT",
			startChapter: 3,
			startVerse: 13,
			endVerse: 17,
			title: "The baptism of Jesus",
			explanation:
				"Notice John's protest: he says he is the one who needs to be baptised by Jesus (3:14). Listen to Jesus' answer about fulfilling all righteousness (3:15). Then watch the three things that happen as he comes up from the water: the heavens open, the Spirit of God descends like a dove, and a voice speaks (3:16–17).",
		},
		{
			title: "John baptises Jesus",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/3/34/Gustave_Dore_-_John_the_Baptist_baptizes_Jesus.jpg",
				alt: "An engraving of Jesus standing knee-deep in a river with a cloth around his waist, while John, dressed in skins, raises his hand beside him; a dove appears in a beam of light above, and people watch from the bank.",
				caption:
					"Doré shows the Spirit descending like a dove (Matthew 3:16), as a voice from heaven calls Jesus his beloved Son, with whom he is well pleased (Matthew 3:17).",
				credit: "Gustave Doré, The Baptism of Jesus, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Gustave_Dore_-_John_the_Baptist_baptizes_Jesus.jpg",
			},
		},
		{
			book: "MAT",
			startChapter: 4,
			startVerse: 1,
			endVerse: 11,
			title: "Tested in the wilderness",
			explanation:
				"Notice who leads Jesus into the wilderness: the Spirit (4:1). After forty days of fasting he is hungry (4:2). Listen to how the devil begins twice: \"If you are the Son of God\" (4:3, 4:6), right after the voice from heaven has said he is. Each time, Jesus answers with Scripture, and the devil even quotes a psalm back at him (4:6).",
		},
		{
			title: "Jesus tempted in the wilderness",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Brooklyn_Museum_-_Jesus_Tempted_in_the_Wilderness_%28J%C3%A9sus_tent%C3%A9_dans_le_d%C3%A9sert%29_-_James_Tissot_-_overall.jpg",
				alt: "A painting of Jesus in a white robe standing at the mouth of a cave, while a kneeling figure outside holds up two stones towards him; a desert valley and a stretch of water lie beyond.",
				caption:
					"Tissot paints the first test: the devil holding up stones and telling Jesus to turn them into bread (Matthew 4:3).",
				credit: "James Tissot, Jesus Tempted in the Wilderness (1886–1894), Brooklyn Museum. Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Jesus_Tempted_in_the_Wilderness_(J%C3%A9sus_tent%C3%A9_dans_le_d%C3%A9sert)_-_James_Tissot_-_overall.jpg",
			},
		},
		{
			title: "Three answers from Deuteronomy",
			content: {
				kind: "text",
				body:
					"All three of Jesus' answers come from the book of Deuteronomy: that man does not live by bread alone (Deuteronomy 8:3), that you shall not put the Lord your God to the test (Deuteronomy 6:16), and that you shall worship the Lord your God and serve him only (Deuteronomy 6:13).\n\n" +
					"In Deuteronomy, Moses spoke those words to Israel about their forty years in the wilderness, when God led them and tested them (Deuteronomy 8:2). Jesus, forty days in the wilderness, holds on to the same words. The letter to the Hebrews says he was tempted in every way as we are, yet without sin (Hebrews 4:15).",
			},
		},
		{
			book: "MAT",
			startChapter: 4,
			startVerse: 12,
			endVerse: 25,
			title: "Follow me",
			explanation:
				"Notice the first words of Jesus' preaching (4:17): they are the same as John's (3:2). Watch how the first disciples answer his call: Peter and Andrew leave their nets \"immediately\" (4:20), and James and John leave the boat and their father (4:22). The chapter ends with crowds coming from every direction (4:25).",
		},
		{
			title: "Not by bread alone",
			content: {
				kind: "reflection",
				prompt:
					"Jesus answered each temptation with words of Scripture he knew by heart. What temptation do you face most often, and what word from God would you want ready for it?",
			},
			anchor: { book: "MAT", chapter: 4, verse: 4 },
		},
	],
};
