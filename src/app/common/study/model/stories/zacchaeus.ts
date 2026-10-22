import { GlobalStudyDef } from "../globalStudy";

/** Luke 18:35–19:10: Jesus passes through Jericho. */
export const ZACCHAEUS: GlobalStudyDef = {
	slug: "story-zacchaeus",
	kind: "story",
	language: "en",
	name: "Zacchaeus",
	description:
		"A rich and unpopular tax collector in Jericho climbs a tree to catch a glimpse of Jesus, and Jesus invites himself to dinner. By the end of the meal, Zacchaeus is giving his money away.",
	topic: "Jesus heals a blind man near Jericho and calls Zacchaeus the tax collector (Luke 18:35–19:10).",
	length: 1,
	depth: 3,
	sortOrder: 145,
	coversWholeCanon: false,
	steps: [
		{
			title: "Rich men and tax collectors",
			content: {
				kind: "text",
				body:
					"Jesus is on his last journey to Jerusalem (Luke 18:31), and the road runs through Jericho (Luke 19:1). Just before this, a rich ruler had gone away very sad, unwilling to give up his wealth, and Jesus said how hard it is for the rich to enter the kingdom of God (Luke 18:23–25). Those listening asked who could be saved, and he answered that what is impossible with man is possible with God (Luke 18:26–27).\n\n" +
					"Tax collectors were lumped together with sinners (Luke 15:1). In a parable Jesus had just told, a Pharisee even thanked God he was not like the tax collector beside him (Luke 18:11). Now Jesus meets a man who is both a tax collector and rich.",
			},
		},
		{
			book: "LUK",
			startChapter: 18,
			startVerse: 35,
			endVerse: 43,
			title: "A blind man by the road",
			explanation:
				"As Jesus comes near Jericho, a blind beggar hears the crowd and cries out to him, and the people tell him to be quiet (18:38–39). Notice that Jesus stops (18:40), and asks him what he wants (18:41). Keep this scene in mind: in the next chapter, another man in Jericho wants to see Jesus, and the crowd is in the way again.",
		},
		{
			book: "LUK",
			startChapter: 19,
			startVerse: 1,
			endVerse: 10,
			title: "Zacchaeus up the tree",
			explanation:
				"Zacchaeus is a chief tax collector and rich (19:2), and too short to see over the crowd (19:3). Notice that Jesus stops under the tree, calls him by name and says, \"I must stay at your house today\" (19:5). The crowd grumbles (19:7); Zacchaeus gives half his goods to the poor and repays anyone he cheated four times over (19:8). Read Jesus' last words slowly (19:10).",
		},
		{
			title: "Zacchaeus in the sycamore",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Brooklyn_Museum_-_Zacchaeus_in_the_Sycamore_Awaiting_the_Passage_of_Jesus_%28Zach%C3%A9e_sur_le_sycomore_attendant_le_passage_de_J%C3%A9sus%29_-_James_Tissot.jpg",
				alt: "A watercolour of a man in a golden robe and turban clambering along a thick tree branch above a crowded street. A group in white robes walks below, and other people climb the same tree.",
				caption:
					"Zacchaeus ran ahead and climbed a sycamore tree to see Jesus, who was about to pass that way (Luke 19:4).",
				credit:
					"James Tissot, Zacchaeus in the Sycamore Awaiting the Passage of Jesus, from The Life of Our Lord Jesus Christ (1886–1894). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Zacchaeus_in_the_Sycamore_Awaiting_the_Passage_of_Jesus_(Zach%C3%A9e_sur_le_sycomore_attendant_le_passage_de_J%C3%A9sus)_-_James_Tissot.jpg",
			},
		},
		{
			title: "Zacchaeus",
			content: {
				kind: "character",
				entitySlug: "zacchaeus_2961",
				note:
					"Only Luke tells his story. The crowd called him a sinner (19:7); Jesus called him \"a son of Abraham\" (19:9). For money gained by fraud, the Law asked a man to repay it in full and add a fifth (Leviticus 6:2–5); Zacchaeus promises four times over, what the Law required of a man who stole a sheep and sold it (Exodus 22:1).",
			},
		},
		{
			title: "Tax collectors in the rest of the Gospels",
			content: {
				kind: "text",
				body:
					"When tax collectors came to John the Baptist to be baptized and asked what they should do, he told them to collect no more than they were authorized to (Luke 3:12–13). Jesus called one tax collector, Levi, to follow him, and he left everything and did (Luke 5:27–28). Matthew's Gospel calls the same man Matthew (Matthew 9:9).\n\n" +
					"Jesus told the religious leaders that tax collectors and prostitutes were going into the kingdom of God ahead of them (Matthew 21:31). Zacchaeus is one of them: the man the rich ruler could not be (Luke 18:23).",
			},
		},
		{
			title: "Welcomed first",
			content: {
				kind: "reflection",
				prompt:
					"Jesus called Zacchaeus by name and asked to stay with him before Zacchaeus had changed anything. What did that welcome do to him? What would you be free to let go of if you knew you were welcomed like that?",
			},
			anchor: { book: "LUK", chapter: 19, verse: 10 },
		},
	],
};
