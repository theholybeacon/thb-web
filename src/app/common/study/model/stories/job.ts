import { GlobalStudyDef } from "../globalStudy";

/** Job 1–2 and 38–42: a good man loses everything, and God answers him. */
export const JOB: GlobalStudyDef = {
	slug: "story-job",
	kind: "story",
	language: "en",
	name: "Job",
	description:
		"A good man loses his wealth, his children and his health in a matter of days, and nobody tells him why. Read how Job's story begins, and how it ends: with God himself answering out of the storm.",
	topic: "The story of Job: his losses and his faithfulness (Job 1–2), and God's answer from the whirlwind and Job's restoration (Job 38–42).",
	length: 2,
	depth: 5,
	sortOrder: 134,
	coversWholeCanon: false,
	steps: [
		{
			title: "A man in the land of Uz",
			content: {
				kind: "text",
				body:
					"The book of Job opens simply, with a man who lived in the land of Uz (Job 1:1). He was blameless and upright, he feared God and turned away from evil, and he was the greatest man of all the people of the east (Job 1:1–3).\n\n" +
					"Most of the book is poetry: long speeches between Job and his friends, from chapter 3 to chapter 37. This study reads the story that frames them, the beginning in chapters 1–2 and the ending in chapters 38–42, with a short guide to what lies between.",
			},
		},
		{
			book: "JOB",
			startChapter: 1,
			title: "The first test",
			explanation:
				"The chapter moves between earth and heaven, and you see what Job never sees: the conversation in verses 6–12. Notice the question Satan asks: does Job fear God for nothing (1:9)? Then the four messengers, each arriving while the last is still speaking (1:16–18). Job's answer is worship (1:20–21).",
		},
		{
			title: "Job hears of his losses",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/118.Job_Hears_of_His_Misfortunes.jpg/1280px-118.Job_Hears_of_His_Misfortunes.jpg",
				alt: "An engraving of a man in a long robe clutching his head outside a stone house, while servants lie on the ground grieving and a messenger points back towards smoke on the horizon.",
				caption:
					"Job tore his robe, shaved his head and fell to the ground, and worshipped: \"The LORD gave, and the LORD has taken away\" (Job 1:20–21).",
				credit: "Gustave Doré, Job Hears of His Misfortunes, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:118.Job_Hears_of_His_Misfortunes.jpg",
			},
		},
		{
			book: "JOB",
			startChapter: 2,
			title: "The second test",
			explanation:
				"Now Job's own body is struck, with sores from his feet to his head (2:7). Listen to his wife's words and to his reply (2:9–10). Then notice what his three friends do well at first: they come from their homes to comfort him, weep with him, and sit with him seven days without saying a word, because they see how great his suffering is (2:11–13).",
		},
		{
			title: "Job",
			content: {
				kind: "character",
				entitySlug: "job_1639",
				note:
					"God himself calls Job \"my servant\" and says there is none like him on the earth (Job 1:8). Through all his losses, the book says, Job did not sin or charge God with wrong (1:22), and James remembers him for his endurance (James 5:11).",
			},
		},
		{
			title: "Between the beginning and the end",
			content: {
				kind: "text",
				body:
					"When Job finally speaks, he curses the day he was born (Job 3:1–3). His friends answer him in turn, and their argument is simple: God is just, so suffering must be a punishment. Eliphaz asks whether an innocent person ever perished (Job 4:7).\n\n" +
					"Job will not accept it. He holds on to his innocence (Job 27:5–6), he complains to God bitterly, and yet he also says, \"I know that my Redeemer lives\" (Job 19:25). Above all he wants God to answer him (Job 31:35). A younger man, Elihu, speaks last (Job 32–37). Then God answers.",
			},
		},
		{
			title: "Job and his friends",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/119.Job_Speaks_with_His_Friends.jpg/1280px-119.Job_Speaks_with_His_Friends.jpg",
				alt: "An engraving of a thin, half-clothed old man sitting on a heap of straw and pointing upwards, while three robed men stand and sit beside him, listening with downcast faces.",
				caption:
					"Doré shows Job pointing to heaven as he speaks with Eliphaz, Bildad and Zophar, the three friends who came to comfort him (Job 2:11).",
				credit: "Gustave Doré, Job Speaks with His Friends, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:119.Job_Speaks_with_His_Friends.jpg",
			},
		},
		{
			book: "JOB",
			startChapter: 38,
			title: "The LORD answers out of the whirlwind",
			explanation:
				"After thirty-five chapters of human words, God speaks (38:1). Notice that he does not explain the conversation of chapter 1. Instead he asks questions, beginning with \"Where were you when I laid the foundation of the earth?\" (38:4). Watch how far the questions range: the sea, the dawn, the snow, the stars, the lions and the ravens. God's speeches go on through chapter 41.",
		},
		{
			book: "JOB",
			startChapter: 42,
			title: "Now my eye sees you",
			explanation:
				"Job's last words are in verses 1–6; notice the difference between hearing of God and seeing him (42:5). Then a surprise: God is angry with the friends, not with Job, because they have not spoken of him what is right, as Job has (42:7). Notice when Job's fortunes are restored: when he prays for those friends (42:10).",
		},
		{
			title: "Job in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Job's name appears again in Ezekiel, where God names Noah, Daniel and Job together as righteous men (Ezekiel 14:14).\n\n" +
					"The New Testament remembers how the story ends. James, writing to believers who are suffering, reminds them of Job's endurance and of what the Lord brought about in the end, and adds that the Lord is full of compassion and mercy (James 5:11).",
			},
		},
		{
			title: "Hearing and seeing",
			content: {
				kind: "reflection",
				prompt:
					"God never told Job why he suffered, but Job came out of it saying he now saw God, where before he had only heard of him. What has a hard season taught you about God that you could not have learned another way?",
			},
			anchor: { book: "JOB", chapter: 42, verse: 5 },
		},
	],
};
