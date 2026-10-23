import { GlobalStudyDef } from "../globalStudy";

/** Joshua 2: Rahab hides the two spies in Jericho and asks for mercy. */
export const RAHAB: GlobalStudyDef = {
	slug: "story-rahab",
	kind: "story",
	language: "en",
	name: "Rahab and the Spies",
	description:
		"Two Israelite spies slip into Jericho, and the one person who protects them is a Canaanite woman with a house in the city wall. Read why she risked everything, and how a scarlet cord in her window became a promise.",
	topic: "Rahab's protection of the spies in Jericho and the oath they swore to her (Joshua 2), with her rescue in Joshua 6.",
	length: 1,
	depth: 3,
	sortOrder: 120,
	coversWholeCanon: false,
	steps: [
		{
			title: "Forty years later",
			content: {
				kind: "text",
				body:
					"Forty years have passed since twelve spies came back from Canaan and the people refused to go in (Numbers 14:33–34). That generation has died in the wilderness (Joshua 5:6), and so has Moses. Now God tells Joshua to lead the people across the Jordan into the land (Joshua 1:1–2), and to be strong and courageous (1:9).\n\n" +
					"From their camp at Shittim, Joshua secretly sends just two men to look over the land, and especially the city of Jericho (2:1). They go to the house of a woman named Rahab.",
			},
		},
		{
			book: "JOS",
			startChapter: 2,
			startVerse: 1,
			endVerse: 14,
			title: "Hidden on the roof",
			explanation:
				"The king of Jericho hears about the spies almost at once (2:2–3). Notice what Rahab does: she hides them under stalks of flax on her roof and sends the king's men off in the wrong direction (2:4–7). Then listen to what she says in verses 9–11. She knows what the LORD did at the Red Sea forty years earlier, and she confesses that he is God in heaven above and on earth below. Notice what she asks for in return: kindness for her whole family (2:12–13).",
		},
		{
			title: "Rahab",
			content: {
				kind: "character",
				entitySlug: "rahab_2388",
				note:
					"The Bible calls her a prostitute (Joshua 2:1), and never hides it. A Canaanite in a city about to fall, she was spared with her family and went on living among the people of Israel (6:25). The New Testament remembers her faith (Hebrews 11:31) and what she did for the messengers (James 2:25).",
			},
		},
		{
			title: "Rahab and the two spies",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Tissot_The_Harlot_of_Jericho_and_the_Two_Spies.jpg/1280px-Tissot_The_Harlot_of_Jericho_and_the_Two_Spies.jpg",
				alt: "A painting of a young woman in a white robe with flowers in her hair, standing in a richly decorated room between two bearded men, one standing beside her and one seated on a couch.",
				caption: "Before the spies lay down for the night, Rahab came up to them and told them what she knew about their God (Joshua 2:8–11).",
				credit: "James Tissot, The Harlot of Jericho and the Two Spies (about 1896–1902). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Tissot_The_Harlot_of_Jericho_and_the_Two_Spies.jpg",
			},
		},
		{
			book: "JOS",
			startChapter: 2,
			startVerse: 15,
			endVerse: 24,
			title: "A cord from the window",
			explanation:
				"Rahab's house is built into the city wall, so she lets the men down by a rope through her window (2:15). Notice the sign they give her: a scarlet cord tied in that same window, with her whole family gathered inside (2:18). Watch how quickly she ties it, even before anything has happened (2:21). The spies' report to Joshua repeats her own words: the people of the land are melting in fear (2:24; compare 2:9).",
		},
		{
			title: "The flight of the spies",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Tissot_The_Flight_of_the_Spies_%28color%29.jpg",
				alt: "A painting of two men climbing down a rope from a window high in a stone city wall at night, toward a rocky stream bed below.",
				caption: "She let them down by a rope through the window, for her house was on the side of the city wall (Joshua 2:15).",
				credit: "James Tissot, The Flight of the Spies (about 1896–1902). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Tissot_The_Flight_of_the_Spies_(color).jpg",
			},
		},
		{
			title: "Rahab in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"The promise is kept. When Jericho falls, Joshua sends the same two men to bring Rahab and all her family out safely (Joshua 6:22–23), and the writer adds that she still lives in Israel \"to this day\" (6:25).\n\n" +
					"Matthew's list of Jesus' ancestors names a Rahab as the mother of Boaz, the great-grandfather of King David (Matthew 1:5–6). Hebrews says that by faith Rahab did not perish with those who disobeyed, because she welcomed the spies (Hebrews 11:31), and James points to what she did, hiding the messengers and sending them out another way (James 2:25).",
			},
		},
		{
			title: "An outsider brought in",
			content: {
				kind: "reflection",
				prompt:
					"Rahab had heard the same news as everyone in Jericho, but she is the one who turned to the God of Israel and asked for mercy. What have you heard about God that calls for a response from you, and what would it mean to tie your own scarlet cord in the window?",
			},
			anchor: { book: "JOS", chapter: 2, verse: 11 },
		},
	],
};
