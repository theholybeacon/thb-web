import { GlobalStudyDef } from "../globalStudy";

/** 1 Samuel 17: the shepherd boy and the champion of Gath. */
export const DAVID_AND_GOLIATH: GlobalStudyDef = {
	slug: "story-david-and-goliath",
	kind: "story",
	language: "en",
	name: "David and Goliath",
	description:
		"For forty days a giant mocks the armies of Israel and no one dares to face him, until a shepherd boy arrives with bread for his brothers. Read the famous fight, and what David said it was really about.",
	topic: "The story of David and Goliath in the Valley of Elah (1 Samuel 17).",
	length: 1,
	depth: 3,
	sortOrder: 127,
	coversWholeCanon: false,
	steps: [
		{
			title: "A king rejected, a shepherd chosen",
			content: {
				kind: "text",
				body:
					"Israel had its first king, Saul, but he disobeyed God, and Samuel told him the LORD had rejected him as king (1 Samuel 15:26). God then sent Samuel to Bethlehem, to the family of Jesse, and passed over every older son for the youngest, who was out keeping the sheep (1 Samuel 16:10–13). The LORD told Samuel that he does not look on the outward appearance but on the heart (1 Samuel 16:7).\n\n" +
					"Samuel anointed David, and the Spirit of the LORD came on him from that day (1 Samuel 16:13). For now he was still a shepherd, who also played the lyre for the troubled king (1 Samuel 16:23). The Philistines, meanwhile, were Israel's constant enemy throughout Saul's reign (1 Samuel 14:52).",
			},
		},
		{
			book: "1SA",
			startChapter: 17,
			startVerse: 1,
			endVerse: 30,
			title: "The giant in the valley",
			explanation:
				"Notice how much space the chapter gives to Goliath's armour and weapons (17:4–7), and how Saul and all Israel react to his challenge: they are dismayed and greatly afraid (17:11). He comes out morning and evening for forty days (17:16). Then David arrives on an errand for his father (17:17–20). Watch for his first question in verse 26: who is this man, to defy the armies of the living God?",
		},
		{
			title: "David",
			content: {
				kind: "character",
				entitySlug: "david_994",
				note:
					"David was the youngest of Jesse's eight sons, from Bethlehem (1 Samuel 17:12–14), and became Israel's greatest king. Samuel had told Saul that the LORD would seek a man after his own heart (1 Samuel 13:14), words Paul later applied to David (Acts 13:22).",
			},
		},
		{
			book: "1SA",
			startChapter: 17,
			startVerse: 31,
			endVerse: 40,
			title: "The lion and the bear",
			explanation:
				"Saul sees only a boy (17:33). Notice that David answers with his experience as a shepherd, rescuing lambs from a lion and a bear (17:34–36), and then gives the credit to the LORD who delivered him (17:37). He tries on the king's armour and takes it off, because he has never tested it (17:38–39). Watch what he chooses instead (17:40).",
		},
		{
			book: "1SA",
			startChapter: 17,
			startVerse: 41,
			endVerse: 58,
			title: "The battle is the LORD's",
			explanation:
				"Before a single stone is thrown, listen to the two speeches. Goliath curses David by his gods (17:43–44); David answers that he comes in the name of the LORD of hosts, so that all the earth may know there is a God in Israel (17:45–46). Verse 47 is the heart of the chapter: the battle is the LORD's. Notice too verse 50: there was no sword in David's hand.",
		},
		{
			title: "David and Goliath",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/071A.David_Slays_Goliath.jpg/1280px-071A.David_Slays_Goliath.jpg",
				alt: "An engraving of a young man standing on the body of a fallen giant in scale armour, holding up the giant's severed head, while soldiers with spears raise their arms behind him.",
				caption:
					"David stood over the Philistine and took his sword, and when the Philistines saw their champion was dead, they fled (1 Samuel 17:51).",
				credit: "Gustave Doré, David Slays Goliath, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:071A.David_Slays_Goliath.jpg",
			},
		},
		{
			title: "After the giant",
			content: {
				kind: "text",
				body:
					"The victory changed David's life. When the army came home, the women sang that Saul had struck down his thousands and David his ten thousands, and from that day Saul eyed David with suspicion (1 Samuel 18:6–9). Years later, running for his life, David was given Goliath's own sword, kept wrapped in a cloth by the priest at Nob (1 Samuel 21:1, 21:8–9).\n\n" +
					"The confidence David spoke in the valley runs through the psalms that bear his name: the LORD is his rock and his deliverer (Psalm 18:2), and some trust in chariots and some in horses, but we trust in the name of the LORD our God (Psalm 20:7).",
			},
		},
		{
			title: "What God has already done",
			content: {
				kind: "reflection",
				prompt:
					"David faced Goliath remembering how God had rescued him in the sheep fields (1 Samuel 17:37). What has God already carried you through that could give you courage for what you face now?",
			},
			anchor: { book: "1SA", chapter: 17, verse: 47 },
		},
	],
};
