import { GlobalStudyDef } from "../globalStudy";

/** Luke 23–24 and John 20: the trial, the cross, the tomb and the risen Jesus. */
export const CRUCIFIXION_AND_RESURRECTION: GlobalStudyDef = {
	slug: "story-crucifixion-and-resurrection",
	kind: "story",
	language: "en",
	name: "The Cross and the Empty Tomb",
	description:
		"An innocent man is condemned, crucified between two criminals and buried before sunset. Three days later the women find the stone rolled away, and a grieving friend hears him call her by name.",
	topic: "The trial, death and burial of Jesus and his resurrection (Luke 23–24; John 20).",
	length: 3,
	depth: 5,
	sortOrder: 148,
	coversWholeCanon: false,
	steps: [
		{
			title: "The night before",
			content: {
				kind: "text",
				body:
					"After the Last Supper Jesus went to the Mount of Olives to pray, and there Judas came with a crowd and he was arrested (Luke 22:39, 47–54). In the high priest's courtyard Peter denied three times that he knew him (Luke 22:54–62).\n\n" +
					"At daybreak the council questioned Jesus (Luke 22:66–71). Then they brought him to Pilate, the Roman governor, telling him they were not permitted to put anyone to death themselves (John 18:31). That is where Luke 23 begins.",
			},
		},
		{
			book: "LUK",
			startChapter: 23,
			startVerse: 1,
			endVerse: 25,
			title: "Before Pilate and Herod",
			explanation:
				"Count how many times Pilate says he finds no guilt in Jesus (23:4, 14, 22). Notice that Herod, who had long wanted to see him, gets no answer at all (23:8–9). And watch the crowd's choice: they ask for Barabbas, a man in prison for rebellion and murder, to be released instead (23:18–19, 25).",
		},
		{
			book: "LUK",
			startChapter: 23,
			startVerse: 26,
			endVerse: 56,
			title: "The cross and the burial",
			explanation:
				"Listen to the three things Jesus says from the cross in Luke: a prayer for those who crucify him (23:34), a promise to a dying criminal (23:43), and his last words, entrusting his spirit to the Father (23:46). Notice who is watching: rulers and soldiers who mock (23:35–36), a centurion who praises God (23:47), and the women from Galilee (23:49). Then Joseph of Arimathea lays the body in a new tomb, and the women see where (23:50–55).",
		},
		{
			title: "What Our Lord Saw from the Cross",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Brooklyn_Museum_-_What_Our_Lord_Saw_from_the_Cross_%28Ce_que_voyait_Notre-Seigneur_sur_la_Croix%29_-_James_Tissot.jpg/1280px-Brooklyn_Museum_-_What_Our_Lord_Saw_from_the_Cross_%28Ce_que_voyait_Notre-Seigneur_sur_la_Croix%29_-_James_Tissot.jpg",
				alt: "A watercolour seen from above, looking down on a crowd on a rocky hillside: soldiers, men on horseback in rich robes, and in the foreground a group of grieving women and a young man looking up.",
				caption:
					"Tissot paints the scene from the cross itself, looking down at the faces. Luke names those who stood there: the people watching, the rulers who scoffed, the soldiers (Luke 23:35–36), and the women who had followed him from Galilee (23:49).",
				credit: "James Tissot, What Our Lord Saw from the Cross, from The Life of Our Lord Jesus Christ (1886–1894). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_What_Our_Lord_Saw_from_the_Cross_(Ce_que_voyait_Notre-Seigneur_sur_la_Croix)_-_James_Tissot.jpg",
			},
		},
		{
			book: "LUK",
			startChapter: 24,
			startVerse: 1,
			endVerse: 12,
			title: "The empty tomb",
			explanation:
				"The women come with spices and find the stone rolled away and no body (24:1–3). Listen to the question the two men in dazzling clothes ask: \"Why do you seek the living among the dead?\" (24:5). Notice the word \"Remember\" (24:6): Jesus had told them this would happen. The apostles call it an idle tale, but Peter runs to see (24:11–12).",
		},
		{
			book: "JHN",
			startChapter: 20,
			startVerse: 1,
			endVerse: 18,
			title: "Mary in the garden",
			explanation:
				"John tells the morning from Mary Magdalene's side. Two disciples run to the tomb and see the linen cloths lying there (20:3–7). Mary stays, weeping, and does not recognise Jesus, thinking he is the gardener (20:14–15). Watch what happens when he says one word, her name (20:16). She becomes the first to say, \"I have seen the Lord\" (20:18).",
		},
		{
			title: "Jesus appears to Mary Magdalene",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Brooklyn_Museum_-_Jesus_Appears_to_Mary_Magdalene_%28Apparition_de_J%C3%A9sus_%C3%A0_Madeleine%29_-_James_Tissot.jpg",
				alt: "A watercolour of a woman in a dark cloak on a garden path beside a tomb, turning back, while a figure in white stands among the trees behind her.",
				caption:
					"Mary turned around and saw Jesus standing there, but she did not know that it was Jesus (John 20:14).",
				credit: "James Tissot, Jesus Appears to Mary Magdalene, from The Life of Our Lord Jesus Christ (1886–1894). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Jesus_Appears_to_Mary_Magdalene_(Apparition_de_J%C3%A9sus_%C3%A0_Madeleine)_-_James_Tissot.jpg",
			},
		},
		{
			title: "Mary Magdalene",
			content: {
				kind: "character",
				entitySlug: "mary_1943",
				note:
					"Mary Magdalene was one of the women who followed Jesus from Galilee, a woman from whom seven demons had gone out (Luke 8:2). She stood near the cross (John 19:25), and in John's Gospel she is the first to see the risen Jesus and the one he sends to tell the others (John 20:14–18).",
			},
		},
		{
			book: "JHN",
			startChapter: 20,
			startVerse: 19,
			endVerse: 31,
			title: "Thomas",
			explanation:
				"The disciples are behind locked doors for fear (20:19). Notice the first words Jesus says, three times in this passage: \"Peace be with you\" (20:19, 21, 26). Thomas will not believe without touching the wounds (20:25); a week later he says, \"My Lord and my God!\" (20:28). Then John tells you why he wrote his book (20:31).",
		},
		{
			title: "The resurrection in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"On the evening of that first day, Jesus opened his disciples' minds to understand the Scriptures: it was written that the Christ should suffer and on the third day rise from the dead (Luke 24:44–46).\n\n" +
					"Paul later summed up what he had received and passed on as of first importance: that Christ died for our sins in accordance with the Scriptures, that he was buried, that he was raised on the third day, and that he appeared to Peter, to the Twelve, and to more than five hundred people at once, most of whom were still alive when he wrote (1 Corinthians 15:3–6).",
			},
		},
		{
			title: "So that you may believe",
			content: {
				kind: "reflection",
				prompt:
					"John says he wrote all this so that you may believe and have life in Jesus' name (John 20:31). Of the people at the tomb, Mary, Peter, Thomas, whose response is closest to yours right now? What would it take for you to say what Thomas said?",
			},
			anchor: { book: "JHN", chapter: 20, verse: 31 },
		},
	],
};
