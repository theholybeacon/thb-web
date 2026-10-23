import { GlobalStudyDef } from "../globalStudy";

/** Luke 22 and John 13: the Passover meal and the washing of the feet. */
export const LAST_SUPPER: GlobalStudyDef = {
	slug: "story-last-supper",
	kind: "story",
	language: "en",
	name: "The Last Supper",
	description:
		"On the night before he dies, Jesus shares the Passover with his friends, gives them bread and a cup to remember him by, and kneels to wash their feet, knowing one will betray him and another will deny him.",
	topic: "Jesus' last Passover meal with his disciples and the washing of their feet (Luke 22:7–38; John 13).",
	length: 2,
	depth: 4,
	sortOrder: 147,
	coversWholeCanon: false,
	steps: [
		{
			title: "The night of the Passover",
			content: {
				kind: "text",
				body:
					"Every year Israel kept the Passover, remembering the night God brought them out of Egypt and the lamb whose blood marked their doors (Exodus 12:3–13). God told them their children would ask what the meal meant, and they were to tell the story (Exodus 12:26–27).\n\n" +
					"This year, as the feast drew near, the chief priests were looking for a way to put Jesus to death, and Judas, one of the Twelve, went to them and agreed to hand him over for money (Luke 22:1–6). That is the shadow over the meal you are about to read.",
			},
		},
		{
			book: "LUK",
			startChapter: 22,
			startVerse: 7,
			endVerse: 23,
			title: "The Passover meal",
			explanation:
				"Notice how much Jesus wanted this meal: he has earnestly desired to eat this Passover with them before he suffers (22:15). Watch what he does with the bread and the cup, and what he says over each (22:19–20): a body given for them, a new covenant in his blood, and \"do this in remembrance of me.\" Then notice who is still at the table (22:21).",
		},
		{
			book: "LUK",
			startChapter: 22,
			startVerse: 24,
			endVerse: 38,
			title: "Who is the greatest?",
			explanation:
				"Right after the meal, the disciples argue about which of them is the greatest (22:24). Notice how Jesus answers: \"I am among you as the one who serves\" (22:27). Then he turns to Simon: he has prayed for him, and tells him to strengthen his brothers once he has turned back (22:31–32). Peter's answer, and Jesus' reply, are in verses 33 and 34.",
		},
		{
			title: "The Last Supper",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Jesus_and_the_disciples_at_the_Last_Supper.jpg",
				alt: "An engraving of Jesus seated at the centre of a long table covered with a cloth, his disciples gathered around him in a room with columns and heavy curtains. A cup stands on the table in front of him.",
				caption:
					"Jesus took bread, gave thanks, broke it and gave it to them (Luke 22:19).",
				credit: "Gustave Doré, Jesus and his disciples at the Last Supper, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Jesus_and_the_disciples_at_the_Last_Supper.jpg",
			},
		},
		{
			book: "JHN",
			startChapter: 13,
			startVerse: 1,
			endVerse: 20,
			title: "The washing of the feet",
			explanation:
				"John begins with what Jesus knew: his hour had come, and the Father had given all things into his hands (13:1, 3). Then watch what he does with those hands (13:4–5). Notice Peter's protest and Jesus' reply (13:8), and that Jesus knows one of them is not clean (13:10–11). He calls it an example to follow (13:15).",
		},
		{
			title: "The Washing of the Feet",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Brooklyn_Museum_-_The_Washing_of_the_Feet_%28Le_lavement_des_pieds%29_-_James_Tissot.jpg",
				alt: "A watercolour of a room hung with dark curtains, where the disciples sit around the walls. In the middle a robed figure carries a water jar, and a basin sits on the floor.",
				caption:
					"Jesus poured water into a basin and began to wash the disciples' feet and to wipe them with the towel he had tied around him (John 13:5).",
				credit: "James Tissot, The Washing of the Feet, from The Life of Our Lord Jesus Christ (1886–1894). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Washing_of_the_Feet_(Le_lavement_des_pieds)_-_James_Tissot.jpg",
			},
		},
		{
			book: "JHN",
			startChapter: 13,
			startVerse: 21,
			endVerse: 38,
			title: "Betrayal and a new commandment",
			explanation:
				"Jesus is troubled in spirit as he says one of them will betray him (13:21). Notice that none of the others guess who it is, even after he hands Judas the piece of bread (13:26–29). John adds four words when Judas leaves: \"And it was night\" (13:30). Then comes the new commandment (13:34–35), and Peter's promise to lay down his life (13:37).",
		},
		{
			title: "Peter",
			content: {
				kind: "character",
				entitySlug: "peter_2745",
				note:
					"Peter refused at first to let Jesus wash his feet (John 13:8), and promised to lay down his life for him (13:37). Jesus knew Peter would deny him three times that night (Luke 22:34), and had already prayed that his faith would not fail (22:32).",
			},
		},
		{
			title: "The meal in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"From the first days of the church, believers devoted themselves to the apostles' teaching, to fellowship, to the breaking of bread and to prayer (Acts 2:42). Paul passes on what he received: on the night he was betrayed, the Lord Jesus took bread (1 Corinthians 11:23). Every time the church eats this bread and drinks the cup, Paul says, it proclaims the Lord's death until he comes (1 Corinthians 11:26).\n\n" +
					"Paul also connects Jesus with the meal's first meaning: \"Christ, our Passover lamb, has been sacrificed\" (1 Corinthians 5:7).",
			},
		},
		{
			title: "Whose feet?",
			content: {
				kind: "reflection",
				prompt:
					"Jesus washed the feet of men who would betray and deny him that same night, and then told them to love one another as he had loved them. Whose feet is he asking you to wash, and what would that look like this week?",
			},
			anchor: { book: "JHN", chapter: 13, verse: 34 },
		},
	],
};
