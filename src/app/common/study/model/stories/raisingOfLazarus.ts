import { GlobalStudyDef } from "../globalStudy";

/** John 11: Lazarus is raised, and the plot against Jesus begins. */
export const RAISING_OF_LAZARUS: GlobalStudyDef = {
	slug: "story-raising-of-lazarus",
	kind: "story",
	language: "en",
	name: "The Raising of Lazarus",
	description:
		"Jesus arrives four days too late for his friend's funeral, weeps at the grave, and calls a dead man out by name. The miracle that gives Lazarus his life back is the one that sets Jesus on the way to his own death.",
	topic: "Jesus raises his friend Lazarus from the dead, and the council plots to kill Jesus (John 11).",
	length: 2,
	depth: 4,
	sortOrder: 146,
	coversWholeCanon: false,
	steps: [
		{
			title: "A family in Bethany",
			content: {
				kind: "text",
				body:
					"Bethany was a village close to Jerusalem (John 11:18), home to two sisters, Martha and Mary, and their brother Lazarus. John tells us plainly that Jesus loved all three of them (John 11:5).\n\n" +
					"Going near Jerusalem was dangerous for Jesus. Not long before, people there had picked up stones to stone him and tried to arrest him, and he had gone away across the Jordan (John 10:31, 39–40). That is where the message about Lazarus reaches him.",
			},
		},
		{
			book: "JHN",
			startChapter: 11,
			startVerse: 1,
			endVerse: 16,
			title: "The message and the delay",
			explanation:
				"The sisters' message is short: \"he whom you love is ill\" (11:3). Read verses 5 and 6 together: Jesus loved them, and he stayed where he was two more days. Notice the disciples' fear of going back (11:8), and Thomas's grim courage: \"Let us also go, that we may die with him\" (11:16).",
		},
		{
			book: "JHN",
			startChapter: 11,
			startVerse: 17,
			endVerse: 37,
			title: "Martha, Mary and the tears of Jesus",
			explanation:
				"Lazarus has been in the tomb four days (11:17). Both sisters say the same words to Jesus: \"if you had been here, my brother would not have died\" (11:21, 32). Notice how differently he answers them. To Martha he says, \"I am the resurrection and the life\" (11:25); with Mary he is deeply moved, and he weeps (11:33, 35).",
		},
		{
			title: "Martha",
			content: {
				kind: "character",
				entitySlug: "martha_1937",
				note:
					"Martha goes out to meet Jesus while Mary stays in the house (John 11:20). Grieving, she still says, \"I believe that you are the Christ, the Son of God\" (11:27). At the tomb she is also the practical one, warning that after four days there will be a smell (11:39).",
			},
		},
		{
			book: "JHN",
			startChapter: 11,
			startVerse: 38,
			endVerse: 44,
			title: "Lazarus, come out",
			explanation:
				"Notice that Jesus asks the people to roll away the stone themselves (11:39), and that he prays aloud so the crowd will believe the Father sent him (11:41–42). Then he calls Lazarus by name (11:43). The last command is given to the bystanders again: unbind him, and let him go (11:44).",
		},
		{
			title: "The Raising of Lazarus",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Rembrandt_Harmensz._van_Rijn_-_The_Raising_of_Lazarus_-_Google_Art_Project.jpg/1280px-Rembrandt_Harmensz._van_Rijn_-_The_Raising_of_Lazarus_-_Google_Art_Project.jpg",
				alt: "A dark painting of Jesus standing with one arm raised high above an open grave, from which a pale man wrapped in white cloth is rising. On the left, onlookers lean forward, and a woman throws up her hands in shock.",
				caption:
					"Rembrandt paints the moment the dead man comes out, still bound in his grave cloths (John 11:43–44), and the shock on the faces of those watching.",
				credit: "Rembrandt, The Raising of Lazarus (c. 1630–1632). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Rembrandt_Harmensz._van_Rijn_-_The_Raising_of_Lazarus_-_Google_Art_Project.jpg",
			},
		},
		{
			title: "Lazarus",
			content: {
				kind: "character",
				entitySlug: "lazarus_1812",
				note:
					"Lazarus never speaks in the Gospels. After he is raised, he sits at the table at a dinner given for Jesus (John 12:2), and the chief priests plan to put him to death too, because on his account many were believing in Jesus (John 12:10–11).",
			},
		},
		{
			book: "JHN",
			startChapter: 11,
			startVerse: 45,
			endVerse: 57,
			title: "One man should die",
			explanation:
				"Many believe, and some go and tell the Pharisees (11:45–46). Listen to the high priest Caiaphas: it is better that one man should die for the people (11:50). John points out that he said more than he knew (11:51–52). From that day they plan to kill Jesus (11:53): giving Lazarus his life will cost Jesus his own.",
		},
		{
			title: "Resurrection in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Earlier in John, Jesus had said that an hour was coming when all who are in the tombs will hear his voice and come out (John 5:28–29). At Lazarus's grave, one man hears that voice ahead of time.\n\n" +
					"Paul calls the risen Jesus the firstfruits of those who have fallen asleep (1 Corinthians 15:20), the first of a harvest still to come. That is why he tells grieving believers that they need not grieve as others do who have no hope (1 Thessalonians 4:13).",
			},
		},
		{
			title: "Do you believe this?",
			content: {
				kind: "reflection",
				prompt:
					"In the middle of Martha's grief Jesus asked her, \"Do you believe this?\" (John 11:26). Where in your life do you most need to hear \"I am the resurrection and the life\" today, and how would you answer his question?",
			},
			anchor: { book: "JHN", chapter: 11, verse: 25 },
		},
	],
};
