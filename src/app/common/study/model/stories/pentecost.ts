import { GlobalStudyDef } from "../globalStudy";

/** Acts 2: the Holy Spirit comes, Peter preaches, and the church begins. */
export const PENTECOST: GlobalStudyDef = {
	slug: "story-pentecost",
	kind: "story",
	language: "en",
	name: "Pentecost",
	description:
		"Not long after Jesus is taken up into heaven, a sound like a rushing wind fills a house in Jerusalem, and a crowd from every nation hears a group of Galileans speaking in their own languages. By the end of the day, three thousand people have been baptized.",
	topic: "The coming of the Holy Spirit at Pentecost, Peter's sermon, and the first church (Acts 2).",
	length: 2,
	depth: 4,
	sortOrder: 149,
	coversWholeCanon: false,
	steps: [
		{
			title: "Waiting in Jerusalem",
			content: {
				kind: "text",
				body:
					"Before he was taken up into heaven, Jesus told his followers to wait in Jerusalem for the promise of the Father: in a few days they would be baptized with the Holy Spirit (Acts 1:4–5). They would receive power, he said, and be his witnesses in Jerusalem, Judea, Samaria and to the end of the earth (Acts 1:8).\n\n" +
					"So they waited and prayed together, about a hundred and twenty of them, among them the women and Mary the mother of Jesus (Acts 1:14–15). The day it happened was Pentecost, the Jewish harvest feast counted fifty days on from Passover (Leviticus 23:15–16), and Jerusalem was full of devout Jews from every nation (Acts 2:5).",
			},
		},
		{
			book: "ACT",
			startChapter: 2,
			startVerse: 1,
			endVerse: 13,
			title: "Wind and fire",
			explanation:
				"Notice what Luke says they heard and saw: a sound like a mighty rushing wind, and tongues as of fire resting on each one (2:2–3). Then watch the crowd: devout Jews from every nation, each hearing them in his own language (2:5–6). Read the list of places aloud (2:9–11). Not everyone is impressed: some say they are drunk (2:13).",
		},
		{
			title: "Pentecost",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Pentecost%C3%A9s_%28El_Greco%2C_c._1600%29_Prado.jpg/1280px-Pentecost%C3%A9s_%28El_Greco%2C_c._1600%29_Prado.jpg",
				alt: "A tall painting of a crowd of men and women looking upwards, with small flames above their heads and a white dove shining in the light at the top. A woman in a blue mantle sits praying at the centre.",
				caption:
					"Divided tongues as of fire rested on each of them (Acts 2:3). El Greco places Mary at the centre, among those Acts says were praying together (1:14); the dove is his sign for the Spirit, taken from Jesus' baptism (Luke 3:22).",
				credit: "El Greco, Pentecost (c. 1600). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Pentecost%C3%A9s_(El_Greco,_c._1600)_Prado.jpg",
			},
		},
		{
			book: "ACT",
			startChapter: 2,
			startVerse: 14,
			endVerse: 36,
			title: "Peter stands up",
			explanation:
				"Peter begins by answering the mockers: these people are not drunk, it is only nine in the morning (2:15). Then he explains the day with the prophet Joel (2:16–21). Notice how he moves from Joel to Jesus: a man attested by God, crucified, and raised (2:22–24). Watch for the promise in verse 21, and the conclusion in verse 36.",
		},
		{
			title: "Peter",
			content: {
				kind: "character",
				entitySlug: "peter_2745",
				note:
					"About seven weeks earlier, Peter had denied three times that he knew Jesus (Luke 22:54–62). Now he stands up with the eleven and speaks to the crowd in Jerusalem (Acts 2:14). Soon the council would marvel at the boldness of Peter and John, because they were uneducated, ordinary men (Acts 4:13).",
			},
		},
		{
			title: "The promised Spirit",
			content: {
				kind: "text",
				body:
					"Long before, Moses had wished that all the LORD's people were prophets, and that the LORD would put his Spirit on them (Numbers 11:29). Through Joel, God promised to do exactly that: to pour out his Spirit on all flesh, sons and daughters, old and young, even servants (Joel 2:28–29).\n\n" +
					"John the Baptist said the one coming after him would baptize with the Holy Spirit and fire (Luke 3:16). And on the night before he died, Jesus promised his disciples another Helper, the Spirit of truth, who would teach them and remind them of all he had said (John 14:16–17, 26).",
			},
		},
		{
			book: "ACT",
			startChapter: 2,
			startVerse: 37,
			endVerse: 47,
			title: "The first church",
			explanation:
				"The crowd is cut to the heart and asks what to do (2:37). Notice Peter's answer (2:38), and how wide the promise is: for you, for your children, and for all who are far off (2:39). Then look at the life of the first believers: teaching, fellowship, breaking bread and prayer (2:42), sharing what they owned (2:44–45), and the Lord adding to their number day by day (2:47).",
		},
		{
			title: "The promise is for you",
			content: {
				kind: "reflection",
				prompt:
					"Peter told the crowd the promise was for them, for their children and for all who are far off. The first believers then shared teaching, meals, prayer and their possessions. Which of those is most missing from your life of faith right now, and what is one step towards it?",
			},
			anchor: { book: "ACT", chapter: 2, verse: 39 },
		},
	],
};
