import { GlobalStudyDef } from "../globalStudy";

/** Luke 15: the lost sheep, the lost coin and the two sons. */
export const PRODIGAL_SON: GlobalStudyDef = {
	slug: "story-prodigal-son",
	kind: "story",
	language: "en",
	name: "The Prodigal Son",
	description:
		"A son takes his inheritance, spends it all and comes home hoping to be hired as a servant. His father runs to meet him. Then the story turns to the brother who never left.",
	topic: "The three parables of lost things, ending with the father and his two sons (Luke 15).",
	length: 2,
	depth: 4,
	sortOrder: 144,
	coversWholeCanon: false,
	steps: [
		{
			title: "Who was listening",
			content: {
				kind: "text",
				body:
					"Luke tells us exactly who was in the audience. Tax collectors and sinners were coming near to hear Jesus, and the Pharisees and scribes grumbled, \"This man receives sinners and eats with them\" (Luke 15:1–2).\n\n" +
					"It was not a new complaint. Earlier Jesus had eaten with tax collectors at Levi's house and answered the same grumbling: he had come to call sinners to repentance (Luke 5:29–32). This time he answers with three stories about something lost: a sheep, a coin and a son.",
			},
		},
		{
			book: "LUK",
			startChapter: 15,
			startVerse: 1,
			endVerse: 10,
			title: "The lost sheep and the lost coin",
			explanation:
				"Notice that the shepherd and the woman both search until they find what they lost (15:4, 8). Both call their friends and neighbours to celebrate (15:6, 9). And each story ends the same way: there is joy in heaven over one sinner who repents (15:7, 10). Keep the grumblers of verse 2 in mind as you read.",
		},
		{
			book: "LUK",
			startChapter: 15,
			startVerse: 11,
			endVerse: 24,
			title: "The son who left",
			explanation:
				"The younger son asks for his share early and wastes it all (15:12–13). Feeding pigs, animals the Law called unclean (Leviticus 11:7), he longs to eat what they eat (15:15–16). Watch the turning point, \"he came to himself\" (15:17), and the speech he rehearses (15:18–19). Then notice that the father sees him while he is still far off and runs to him (15:20), and that the son never gets to finish his speech (15:21–22).",
		},
		{
			title: "The son among the pigs",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Brooklyn_Museum_-_The_Prodigal_Son_Begging_%28L%27enfant_prodigue_mendiant%29_-_James_Tissot.jpg",
				alt: "A watercolour of a young man in a torn white robe and a battered straw hat standing on a path, with pigs rooting under the trees behind him.",
				caption:
					"Tissot paints the son at his lowest, sent into the fields to feed pigs, with no one giving him anything (Luke 15:15–16).",
				credit: "James Tissot, The Prodigal Son Begging, from The Life of Our Lord Jesus Christ (1886–1894). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Prodigal_Son_Begging_(L%27enfant_prodigue_mendiant)_-_James_Tissot.jpg",
			},
		},
		{
			book: "LUK",
			startChapter: 15,
			startVerse: 25,
			endVerse: 32,
			title: "The son who stayed",
			explanation:
				"The older brother is angry and will not go in, so the father goes out to him as well (15:28). Listen to how each of them speaks of the younger son: \"this son of yours\" (15:30), and \"this your brother\" (15:32). The story ends without telling us whether the older brother went in. Think back to who was grumbling in verse 2.",
		},
		{
			title: "The Return of the Prodigal Son",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Rembrandt_Harmensz_van_Rijn_-_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg/1280px-Rembrandt_Harmensz_van_Rijn_-_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg",
				alt: "A dark painting of an old man in a red cloak resting both hands on the back of a kneeling young man with a shaved head, worn clothes and one bare foot. A tall man in red stands apart on the right, watching, and other figures look on from the shadows.",
				caption:
					"Rembrandt paints the father's embrace (Luke 15:20), and, standing apart and watching, a tall figure in red, much as the older brother stood outside (15:28).",
				credit: "Rembrandt, The Return of the Prodigal Son (c. 1668). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Rembrandt_Harmensz_van_Rijn_-_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg",
			},
		},
		{
			title: "Jesus, who welcomes sinners",
			content: {
				kind: "character",
				entitySlug: "jesus_905",
				note:
					"Jesus told these stories to people who complained that he welcomed sinners and ate with them (Luke 15:2). A few chapters later he says the same thing about himself in plain words: \"the Son of Man came to seek and to save the lost\" (Luke 19:10).",
			},
		},
		{
			title: "Lost and found in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"The picture of God as a father who has compassion is an old one: \"As a father shows compassion to his children, so the LORD shows compassion to those who fear him\" (Psalm 103:13). So is the picture of the searching shepherd. Isaiah says all of us like sheep have gone astray (Isaiah 53:6), and through Ezekiel God promises, \"I will seek the lost\" (Ezekiel 34:16).\n\n" +
					"Paul puts the father's running welcome into one sentence: God shows his love for us in that while we were still sinners, Christ died for us (Romans 5:8).",
			},
		},
		{
			title: "Which son are you?",
			content: {
				kind: "reflection",
				prompt:
					"Which son do you see more of in yourself today: the one who ran away, or the one who stayed but would not come in? What does the father's welcome say to you?",
			},
			anchor: { book: "LUK", chapter: 15, verse: 20 },
		},
	],
};
