import { GlobalStudyDef } from "../globalStudy";

/** Luke 10:25–42: the lawyer's question, the parable, and Mary and Martha. */
export const GOOD_SAMARITAN: GlobalStudyDef = {
	slug: "story-good-samaritan",
	kind: "story",
	language: "en",
	name: "The Good Samaritan",
	description:
		"A lawyer asks Jesus who counts as his neighbour, and gets a story about a man left half dead on a dangerous road. The hero is the last person his listeners would have picked.",
	topic: "The parable of the Good Samaritan, the question that prompted it, and the visit to Martha and Mary that follows (Luke 10:25–42).",
	length: 1,
	depth: 4,
	sortOrder: 143,
	coversWholeCanon: false,
	steps: [
		{
			title: "On the way to Jerusalem",
			content: {
				kind: "text",
				body:
					"Jesus has set his face to go to Jerusalem (Luke 9:51). On the way, a Samaritan village refuses to welcome him, and James and John offer to call down fire on it; Jesus rebukes them (Luke 9:52–55).\n\n" +
					"Jews and Samaritans were neighbours who kept apart. When Jesus asked a Samaritan woman for a drink, she was surprised, and John explains that Jews had no dealings with Samaritans (John 4:9). Keep that in mind when you meet the traveller in Jesus' story.",
			},
		},
		{
			book: "LUK",
			startChapter: 10,
			startVerse: 25,
			endVerse: 29,
			title: "Who is my neighbour?",
			explanation:
				"Notice that the lawyer stands up to test Jesus (10:25), and that Jesus answers with a question of his own (10:26). The lawyer's answer joins two commands from the Law: love God with everything you are (Deuteronomy 6:5), and love your neighbour as yourself (Leviticus 19:18). Watch why he asks his second question: he wants to justify himself (10:29).",
		},
		{
			book: "LUK",
			startChapter: 10,
			startVerse: 30,
			endVerse: 37,
			title: "The parable",
			explanation:
				"A priest and a Levite both see the wounded man and pass by on the other side (10:31–32). The Samaritan sees him and has compassion (10:33). Count everything he does in verses 34 and 35: it costs him his oil and wine, his animal, his money and his time. Then notice how Jesus turns the lawyer's question around in verse 36.",
		},
		{
			title: "The Good Samaritan",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Brooklyn_Museum_-_The_Good_Samaritan_%28Le_bon_samaritain%29_-_James_Tissot.jpg",
				alt: "A watercolour of a bearded man in a green robe kneeling on a stony roadside and holding up a wounded man stripped to the waist. A saddled animal stands nearby, and a small figure in white walks away along the path in the distance.",
				caption:
					"The Samaritan went to him and bound up his wounds (Luke 10:34). Far up the road, Tissot paints someone walking on, as the priest and the Levite did (10:31–32).",
				credit: "James Tissot, The Good Samaritan, from The Life of Our Lord Jesus Christ (1886–1894). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Good_Samaritan_(Le_bon_samaritain)_-_James_Tissot.jpg",
			},
		},
		{
			title: "Samaritans in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"The Law already asked Israel to love the foreigner living among them \"as yourself\" (Leviticus 19:34). Jesus kept showing what that looks like. Of ten men he healed of leprosy, only one came back to thank him, and Luke notes that he was a Samaritan (Luke 17:15–16).\n\n" +
					"Before he ascended, Jesus told his followers they would be his witnesses in Jerusalem, in all Judea and Samaria, and to the end of the earth (Acts 1:8). Not long after, Philip preached in Samaria, and the apostles heard that Samaria had received the word of God (Acts 8:5, 14).",
			},
		},
		{
			title: "Lifting the stranger",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Vincent_van_Gogh_-_The_Good_Samaritan%2C_1890_-_Google_Art_Project.jpg/1280px-Vincent_van_Gogh_-_The_Good_Samaritan%2C_1890_-_Google_Art_Project.jpg",
				alt: "A painting in swirling brushstrokes of a man in a yellow robe straining to lift a wounded man in blue onto a horse. An open chest lies on the ground, and small figures walk away along a path behind them.",
				caption:
					"Van Gogh shows the hard part: lifting a hurt stranger onto your own animal (Luke 10:34). \"Go, and do likewise\" (10:37) asks for that kind of effort.",
				credit: "Vincent van Gogh, The Good Samaritan (after Delacroix) (1890). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_The_Good_Samaritan,_1890_-_Google_Art_Project.jpg",
			},
		},
		{
			book: "LUK",
			startChapter: 10,
			startVerse: 38,
			endVerse: 42,
			title: "Martha and Mary",
			explanation:
				"Luke sets this visit right after the parable. The lawyer had named two commands: love your neighbour, and love God. Notice Mary sitting at the Lord's feet listening (10:39), and Martha distracted with much serving (10:40). Listen to how gently Jesus answers her, repeating her name (10:41–42).",
		},
		{
			title: "Martha",
			content: {
				kind: "character",
				entitySlug: "martha_1937",
				note:
					"Martha is the one who welcomed Jesus into her house (Luke 10:38). In John's Gospel she is the sister of Lazarus, and at her brother's grave she says to Jesus, \"I believe that you are the Christ, the Son of God\" (John 11:27).",
			},
		},
		{
			title: "Who is on your road?",
			content: {
				kind: "reflection",
				prompt:
					"Jesus turned \"Who is my neighbour?\" into \"Who acted as a neighbour?\" Who has been put on your road lately, and what would showing them mercy look like this week?",
			},
			anchor: { book: "LUK", chapter: 10, verse: 37 },
		},
	],
};
