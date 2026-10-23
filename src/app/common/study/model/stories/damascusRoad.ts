import { GlobalStudyDef } from "../globalStudy";

/** Acts 9:1–31: Saul meets Jesus on the road to Damascus. */
export const DAMASCUS_ROAD: GlobalStudyDef = {
	slug: "story-damascus-road",
	kind: "story",
	language: "en",
	name: "Saul on the Road to Damascus",
	description:
		"The church's fiercest enemy sets out to arrest believers, and is stopped by a light from heaven and a voice asking why he is persecuting him. Three days later a frightened disciple lays hands on him and calls him brother.",
	topic: "The conversion of Saul, later the apostle Paul, and his first days as a follower of Jesus (Acts 9:1–31).",
	length: 2,
	depth: 4,
	sortOrder: 150,
	coversWholeCanon: false,
	steps: [
		{
			title: "The persecutor",
			content: {
				kind: "text",
				body:
					"Saul first appears at the stoning of Stephen, a follower of Jesus: the witnesses laid their garments at his feet, and Saul approved of the killing (Acts 7:58; 8:1). Then he set about ravaging the church, going from house to house and dragging men and women off to prison (Acts 8:3).\n\n" +
					"He was a man of Tarsus (Acts 9:11), educated in Jerusalem under the teacher Gamaliel (Acts 22:3), and a Pharisee (Philippians 3:5). He was convinced, he said later, that he ought to do all he could against the name of Jesus (Acts 26:9).",
			},
		},
		{
			book: "ACT",
			startChapter: 9,
			startVerse: 1,
			endVerse: 9,
			title: "The light on the road",
			explanation:
				"Saul is still breathing threats and murder, and carries letters to arrest anyone in Damascus who belongs to \"the Way\" (9:1–2). Listen to the question the voice asks: why are you persecuting me (9:4)? Jesus counts what is done to his followers as done to himself (9:5). Notice how the man who set out to bind others is led by the hand, blind, for three days (9:8–9).",
		},
		{
			title: "The Conversion of Saint Paul",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/The_Conversion_of_Saint_Paul-Caravaggio_%28c._1600-1%29.jpg/1280px-The_Conversion_of_Saint_Paul-Caravaggio_%28c._1600-1%29.jpg",
				alt: "A dark painting of a young man lying on the ground, covering his eyes with his hands, beside a rearing horse. An old soldier in a plumed helmet holds a spear over him, and from the upper right a figure held by an angel reaches down towards him.",
				caption:
					"Caravaggio paints Saul struck to the ground with his hands over his eyes. The horse and the angel are the painter's own; Acts says only that Saul fell to the ground and that the men with him stood speechless (Acts 9:4, 7).",
				credit: "Caravaggio, The Conversion of Saint Paul (c. 1600). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Conversion_of_Saint_Paul-Caravaggio_(c._1600-1).jpg",
			},
		},
		{
			book: "ACT",
			startChapter: 9,
			startVerse: 10,
			endVerse: 19,
			title: "Ananias",
			explanation:
				"Put yourself in Ananias's place: he has heard how much harm this man has done (9:13–14). Notice what the Lord says Saul will be: a chosen instrument to carry his name to the nations, to kings and to Israel, and one who will suffer for it (9:15–16). Then listen to Ananias's first words to him: \"Brother Saul\" (9:17).",
		},
		{
			title: "Ananias of Damascus",
			content: {
				kind: "character",
				entitySlug: "ananias_259",
				note:
					"Ananias appears only here and in Paul's retelling of the story, where Paul calls him a devout man by the standard of the Law, well spoken of by all the Jews living in Damascus (Acts 22:12). He went to the man who had come to arrest believers like him because the Lord told him to (Acts 9:15–17).",
			},
		},
		{
			title: "Saul's sight restored",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Saint_Paul_Ananias_Sight_Restored.jpg",
				alt: "A painting of a kneeling man in a red cloak and armour with his eyes closed, as an old bearded man in a golden robe lays a hand on his head. A soldier supports him from behind, a youth holds a horse, and a dove shines in the clouds above.",
				caption:
					"Ananias laid his hands on Saul, and something like scales fell from his eyes, and he could see again (Acts 9:17–18).",
				credit: "Pietro da Cortona, Ananias Restoring the Sight of Saint Paul (c. 1631). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Saint_Paul_Ananias_Sight_Restored.jpg",
			},
		},
		{
			book: "ACT",
			startChapter: 9,
			startVerse: 20,
			endVerse: 31,
			title: "From hunter to hunted",
			explanation:
				"Notice the word \"immediately\" (9:20): Saul goes straight into the synagogues proclaiming that Jesus is the Son of God. The people who hear him can hardly believe it (9:21). Within days he is the one being hunted, and he escapes over the wall in a basket (9:23–25). In Jerusalem the disciples are afraid of him, until Barnabas vouches for him (9:26–27).",
		},
		{
			title: "Paul",
			content: {
				kind: "character",
				entitySlug: "paul_2479",
				note:
					"Saul is also called Paul (Acts 13:9), the name he uses in his letters (Romans 1:1). He never forgot where he started: he called himself the least of the apostles, unworthy of the name, because he had persecuted the church of God (1 Corinthians 15:9).",
			},
		},
		{
			title: "Paul tells the story again",
			content: {
				kind: "text",
				body:
					"Paul told this story himself, twice more in Acts: to a hostile crowd in Jerusalem (Acts 22:3–16) and before King Agrippa (Acts 26:9–18). In the second telling he adds the words, \"It is hard for you to kick against the goads\" (Acts 26:14), and the commission to open people's eyes and turn them from darkness to light (Acts 26:18).\n\n" +
					"In his letters he puts it in a sentence: he had violently persecuted the church, but God was pleased to reveal his Son to him so that he might preach him among the Gentiles (Galatians 1:13–16). He calls himself the foremost of sinners, shown mercy as an example of Christ's patience (1 Timothy 1:15–16).",
			},
		},
		{
			title: "Beyond reach?",
			content: {
				kind: "reflection",
				prompt:
					"Jesus stopped the man who was hunting his people, and sent a frightened believer to call him \"brother\". Is there someone you have written off as beyond reach? Or are you the one who needs to hear that you are not?",
			},
			anchor: { book: "ACT", chapter: 9, verse: 17 },
		},
	],
};
