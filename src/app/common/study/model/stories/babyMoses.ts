import { GlobalStudyDef } from "../globalStudy";

/** Exodus 1–2: slavery in Egypt, the baby in the basket, and Moses grown up. */
export const BABY_MOSES: GlobalStudyDef = {
	slug: "story-baby-moses",
	kind: "story",
	language: "en",
	name: "Baby Moses in the Basket",
	description:
		"A king orders every Hebrew baby boy thrown into the Nile, and one mother hides her son in a basket among the reeds. Read how he is found, named and raised, and how God was at work long before anyone said his name.",
	topic: "The oppression of Israel in Egypt, the birth and rescue of Moses, and his flight to Midian (Exodus 1–2).",
	length: 2,
	depth: 3,
	sortOrder: 112,
	coversWholeCanon: false,
	steps: [
		{
			title: "A new king in Egypt",
			content: {
				kind: "text",
				body:
					"Genesis ends with Jacob's family settled in Egypt, given land and fed by Joseph through the famine (Genesis 47:11–12). Exodus begins by counting them: seventy people came down with Jacob (Exodus 1:5). Then Joseph and his whole generation died (1:6), and the family grew until the land was filled with them (1:7).\n\n" +
					"Then a new king rose over Egypt, one who did not know Joseph (1:8). He looked at a growing people and saw a threat (1:9–10). The story of Moses begins with fear, forced labour, and a king who tries to solve his problem with the lives of babies.",
			},
		},
		{
			book: "EXO",
			startChapter: 1,
			title: "Slavery, and two brave midwives",
			explanation:
				"Watch how the king's plan escalates: hard labour (1:11–14), then secret orders to the midwives (1:16), then a public command to throw every newborn boy into the river (1:22). Notice who stands in the way: two women, Shiphrah and Puah, who feared God more than the king (1:17). The king is never named in this chapter; the midwives are.",
		},
		{
			title: "The child on the Nile",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/030.The_Child_Moses_on_the_Nile.jpg/1280px-030.The_Child_Moses_on_the_Nile.jpg",
				alt: "An engraving of a baby asleep in a small basket floating on a dark river between reeds, with angels hovering above it under a moonlit sky.",
				caption:
					"Doré filled the night sky over the basket with angels. The text gives the baby a different watcher: his sister, standing at a distance to see what would happen to him (Exodus 2:4).",
				credit: "Gustave Doré, The Child Moses on the Nile, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:030.The_Child_Moses_on_the_Nile.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 2,
			startVerse: 1,
			endVerse: 10,
			title: "A basket among the reeds",
			explanation:
				"Notice how much happens through women: a mother who hides her son for three months (2:2), a sister who watches (2:4), and Pharaoh's own daughter, who hears the baby cry and has compassion on him (2:6). Watch the sister's quick thinking in verse 7: the mother ends up being paid to nurse her own child (2:9). The name Moses is explained by the princess's words, \"I drew him out of the water\" (2:10).",
		},
		{
			title: "The Finding of Moses",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/031.The_Finding_of_Moses.jpg/1280px-031.The_Finding_of_Moses.jpg",
				alt: "An engraving of a richly dressed Egyptian princess standing by a river with attendants holding feathered fans, while a kneeling woman reaches toward a baby lying in a basket at the water's edge.",
				caption: "Pharaoh's daughter sees the basket among the reeds and sends her servant to fetch it (Exodus 2:5).",
				credit: "Gustave Doré, The Finding of Moses, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:031.The_Finding_of_Moses.jpg",
			},
		},
		{
			title: "Pharaoh's daughter",
			content: {
				kind: "character",
				entitySlug: "daughter_of_pharaoh_988",
				note:
					"She saw at once that this was a Hebrew baby (Exodus 2:6), one of the very children her father had ordered drowned (1:22), and she saved him anyway. Moses became her son (2:10), and the New Testament remembers that she raised him as her own (Acts 7:21).",
			},
		},
		{
			book: "EXO",
			startChapter: 2,
			startVerse: 11,
			endVerse: 25,
			title: "Moses grows up and runs away",
			explanation:
				"Moses sees an Egyptian beating a Hebrew and kills him (2:11–12), and the next day learns that his own people do not want him as a judge (2:14). He flees to Midian, marries Zipporah, and names his son for what he feels: a foreigner in a foreign land (2:22). Then read the last three verses slowly. God has not been named once in this chapter, and now he hears, remembers, sees and takes notice (2:23–25).",
		},
		{
			title: "Moses",
			content: {
				kind: "character",
				entitySlug: "moses_2108",
				note:
					"Born under a death sentence, raised in Pharaoh's household, and by the end of this chapter a shepherd in exile. The New Testament says he was taught all the wisdom of the Egyptians (Acts 7:22), and that by faith he later refused to be called the son of Pharaoh's daughter (Hebrews 11:24).",
			},
		},
		{
			title: "Moses' birth in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"Exodus 2 does not name Moses' parents, but a later family list does: Amram and Jochebed, of the tribe of Levi (Exodus 6:20). The only sister of Moses the Bible names is Miriam (Numbers 26:59).\n\n" +
					"The New Testament remembers the hiding of the baby as an act of faith: his parents hid him for three months and did not fear the king's order (Hebrews 11:23). And the pattern returns at the start of the Gospels, when King Herod orders the killing of the boys of Bethlehem (Matthew 2:16) and Jesus is carried to safety in Egypt (Matthew 2:14).",
			},
		},
		{
			title: "God at work unseen",
			content: {
				kind: "reflection",
				prompt:
					"In Exodus 2, God is not mentioned until the very end, yet he was at work through a mother, a sister and a princess. Looking back, where can you see that God was at work in your life before you noticed him?",
			},
			anchor: { book: "EXO", chapter: 2, verse: 25 },
		},
	],
};
