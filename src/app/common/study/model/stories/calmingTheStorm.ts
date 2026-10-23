import { GlobalStudyDef } from "../globalStudy";

/** Mark 4 and Matthew 14: Jesus stills the storm, and walks on the water. */
export const CALMING_THE_STORM: GlobalStudyDef = {
	slug: "story-calming-the-storm",
	kind: "story",
	language: "en",
	name: "Jesus Calms the Storm and Walks on Water",
	description:
		"Twice the disciples are caught in a storm on the lake at night. Once Jesus is asleep in the boat; once he comes to them walking on the waves, and Peter steps out to meet him.",
	topic: "Jesus calms the storm on the Sea of Galilee (Mark 4:35–41) and walks on the water to his disciples, with Peter (Matthew 14:22–33).",
	length: 1,
	depth: 3,
	sortOrder: 141,
	coversWholeCanon: false,
	steps: [
		{
			title: "Fishermen on a lake",
			content: {
				kind: "text",
				body:
					"Jesus often taught beside the Sea of Galilee (Mark 2:13). Several of his first disciples were fishermen who worked on it: Simon Peter and his brother Andrew, and James and John (Mark 1:16–20).\n\n" +
					"In Mark 4 Jesus had been teaching such a large crowd that he sat in a boat on the water and spoke to them on the shore (Mark 4:1). That evening he told his disciples to cross to the other side (Mark 4:35). These were men who knew the lake, and the storm still frightened them.",
			},
		},
		{
			book: "MRK",
			startChapter: 4,
			startVerse: 35,
			endVerse: 41,
			title: "Peace, be still",
			explanation:
				"Notice where Jesus is while the boat fills with water: asleep on a cushion in the stern (4:38). Listen to the disciples' question, and then to his (4:38, 4:40). Watch the change in them: in the storm they are afraid, but after the calm they are filled with an even greater fear, and ask, \"Who then is this?\" (4:41).",
		},
		{
			title: "Christ in the storm",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg/1280px-Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg",
				alt: "A painting of a small sailing boat tipping steeply on a huge wave under dark clouds; some men struggle with the sail and rigging at the bow, while others crowd around a calm figure in the shadowed stern.",
				caption:
					"Rembrandt shows the moment before the calm: the waves breaking into the boat (Mark 4:37), and the disciples waking Jesus to ask whether he does not care that they are perishing (Mark 4:38).",
				credit: "Rembrandt van Rijn, Christ in the Storm on the Sea of Galilee (1633). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg",
			},
		},
		{
			title: "Who stills the sea?",
			content: {
				kind: "text",
				body:
					"The disciples' question had an answer in the Scriptures they knew. Psalm 107 tells of sailors caught in a storm who cried to the LORD in their trouble, and he made the storm be still and hushed the waves (Psalm 107:23–30). Another psalm says to God that he rules the raging of the sea and stills its waves (Psalm 89:9).\n\n" +
					"Job, too, speaks of God as the one who alone stretched out the heavens and treads on the waves of the sea (Job 9:8). In each of these passages, it is God who rules the wind and the waves.",
			},
		},
		{
			book: "MAT",
			startChapter: 14,
			startVerse: 22,
			endVerse: 33,
			title: "Walking on the water",
			explanation:
				"This happens right after Jesus has fed the five thousand (14:13–21). Notice that he sends the disciples ahead and goes up the mountain alone to pray (14:23). Watch Peter closely: his bold request (14:28), his first steps, the moment he sees the wind (14:30), and the hand that catches him \"immediately\" (14:31). Then notice what the disciples say in the boat (14:33).",
		},
		{
			title: "Peter",
			content: {
				kind: "character",
				entitySlug: "peter_2745",
				note:
					"Simon Peter was a fisherman when Jesus called him (Matthew 4:18–20). He is often the first to speak: the first to say \"You are the Christ\" (Matthew 16:16), and the one who denied Jesus three times on the night of his arrest (Matthew 26:69–75). After the resurrection Jesus restored him (John 21:15–17).",
			},
		},
		{
			title: "Jesus walks on the sea",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/4/48/Jesus_walks_on_the_sea.jpg",
				alt: "An engraving of a robed figure walking on rough water under a stormy sky with one hand raised, towards a small sailing boat in the distance.",
				caption:
					"Jesus came to them in the fourth watch of the night, shortly before dawn (Matthew 14:25), and told his terrified disciples to take courage: it was he, and they need not be afraid (Matthew 14:26–27).",
				credit: "Gustave Doré, Jesus Walking on the Sea, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Jesus_walks_on_the_sea.jpg",
			},
		},
		{
			title: "The same night in other Gospels",
			content: {
				kind: "text",
				body:
					"Mark and John also tell of Jesus walking on the water after the feeding of the five thousand (Mark 6:45–52; John 6:16–21). Only Matthew tells of Peter stepping out of the boat.\n\n" +
					"Mark adds an honest note about the disciples: they were utterly astounded, because they had not understood about the loaves (Mark 6:51–52). Even after seeing so much, they were still learning who Jesus was.",
			},
		},
		{
			title: "Why did you doubt?",
			content: {
				kind: "reflection",
				prompt:
					"Peter began to sink when he looked at the wind instead of at Jesus, and Jesus caught him at once. What storm is drawing your eyes away right now, and what would it mean to call out to him as Peter did?",
			},
			anchor: { book: "MAT", chapter: 14, verse: 31 },
		},
	],
};
