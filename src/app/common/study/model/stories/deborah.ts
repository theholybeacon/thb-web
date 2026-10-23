import { GlobalStudyDef } from "../globalStudy";

/** Judges 4–5: Deborah, Barak, Jael and the song of victory. */
export const DEBORAH: GlobalStudyDef = {
	slug: "story-deborah",
	kind: "story",
	language: "en",
	name: "Deborah and Jael",
	description:
		"Israel has been crushed for twenty years by an army with nine hundred iron chariots. A prophetess under a palm tree calls a hesitant commander to battle, and the victory ends in a tent, at the hand of a woman no one expected.",
	topic: "The story of Deborah, Barak and Jael, and the song Deborah and Barak sang after the victory (Judges 4–5).",
	length: 2,
	depth: 4,
	sortOrder: 122,
	coversWholeCanon: false,
	steps: [
		{
			title: "In the days of the judges",
			content: {
				kind: "text",
				body:
					"After Joshua's generation died, another generation grew up that did not know the LORD (Judges 2:10). The book of Judges then tells the same pattern again and again: Israel turns to other gods, falls under an enemy, cries out, and God raises up a leader, a judge, to rescue them (Judges 2:16–18).\n\n" +
					"This time the enemy is Jabin, a Canaanite king who reigned in Hazor. His commander Sisera had nine hundred chariots of iron, and he oppressed Israel cruelly for twenty years (Judges 4:2–3).",
			},
		},
		{
			book: "JDG",
			startChapter: 4,
			startVerse: 1,
			endVerse: 10,
			title: "Deborah calls Barak",
			explanation:
				"Notice who is leading Israel when the story opens: Deborah, a prophetess, judging the people under a palm tree in the hill country of Ephraim (4:4–5). She gives Barak God's command, and he answers that he will go only if she goes with him (4:8). Watch for her reply in verse 9: the honour of the victory will go to a woman.",
		},
		{
			title: "Under the palm of Deborah",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Tissot_Deborah_Beneath_the_Palm_Tree.jpg",
				alt: "A painting of a woman in a long blue robe standing with one hand against the trunk of a palm tree, while a soldier in an orange tunic stands facing her with a hand raised to his head.",
				caption:
					"The people of Israel came up to Deborah for judgement where she sat under a palm tree between Ramah and Bethel (Judges 4:5).",
				credit: "James Tissot (or followers), Deborah Beneath the Palm Tree (c. 1896–1902), The Jewish Museum, New York. Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Tissot_Deborah_Beneath_the_Palm_Tree.jpg",
			},
		},
		{
			title: "Deborah",
			content: {
				kind: "character",
				entitySlug: "deborah_997",
				note:
					"Deborah was a prophetess and was judging Israel at the time (Judges 4:4). In her song she describes herself as rising up as \"a mother in Israel\" (5:7), at a time when travellers kept off the main roads and village life had come to a stop (5:6–7).",
			},
		},
		{
			book: "JDG",
			startChapter: 4,
			startVerse: 11,
			endVerse: 24,
			title: "The battle and the tent",
			explanation:
				"Notice that Deborah sends Barak out by telling him the LORD has already gone ahead of him (4:14), and that verse 15 says it was the LORD who threw Sisera's army into panic. Sisera escapes on foot to the tent of Jael, whose clan was at peace with his king (4:17). The text tells what she does in one plain verse (4:21); then Barak arrives and finds Deborah's word fulfilled (4:22, compare 4:9).",
		},
		{
			title: "Jael and Sisera",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/052.Jael_Kills_Sisera.jpg/1280px-052.Jael_Kills_Sisera.jpg",
				alt: "An engraving of a woman in a long robe holding back the curtain of a tent, with a soldier in armour lying face down at her feet and armed men approaching outside.",
				caption:
					"Doré shows the moment Jael goes out to meet Barak and brings him into the tent to see the man he was pursuing (Judges 4:22).",
				credit: "Gustave Doré, Jael Kills Sisera, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:052.Jael_Kills_Sisera.jpg",
			},
		},
		{
			title: "Jael",
			content: {
				kind: "character",
				entitySlug: "jael_689",
				note:
					"Jael was the wife of Heber the Kenite, who had moved his tent away from the rest of his clan (Judges 4:11, 4:17). Deborah's song calls her blessed above women who live in tents (5:24) and tells her deed a second time (5:25–27).",
			},
		},
		{
			book: "JDG",
			startChapter: 5,
			title: "The song of Deborah",
			explanation:
				"This is one of the oldest poems in the Bible, and it tells the same battle as a song. Notice how it begins: leaders led and the people offered themselves willingly, so bless the LORD (5:2). Watch for the tribes who came and the tribes who stayed at home (5:14–18), the stars and the river Kishon fighting on Israel's side (5:20–21), and the last scene, Sisera's mother waiting at her window (5:28–30). The chapter ends with forty years of rest (5:31).",
		},
		{
			title: "Deborah and Barak in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Centuries later, a psalm asks God to deal with Israel's enemies as he did to Sisera and Jabin at the river Kishon (Psalm 83:9).\n\n" +
					"The letter to the Hebrews names Barak among the people of faith whose stories there is no time to tell, alongside Gideon, Samson, David and Samuel (Hebrews 11:32), people who through faith conquered kingdoms and put foreign armies to flight (Hebrews 11:33–34).",
			},
		},
		{
			title: "The LORD goes ahead",
			content: {
				kind: "reflection",
				prompt:
					"Barak would not go without Deborah, and Deborah pointed him to the LORD who had already gone out ahead of him (Judges 4:14). What step are you hesitating over, and what would it mean to trust that God has gone before you?",
			},
			anchor: { book: "JDG", chapter: 4, verse: 14 },
		},
	],
};
