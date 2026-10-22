import { GlobalStudyDef } from "../globalStudy";

/** Genesis 25, 27 and 33: the birthright, the stolen blessing and the reunion. */
export const JACOB_AND_ESAU: GlobalStudyDef = {
	slug: "story-jacob-and-esau",
	kind: "story",
	language: "en",
	name: "Jacob and Esau",
	description:
		"Twin brothers struggle before they are born, and the younger takes the older's birthright and then his blessing. Read how a family was torn apart by favourites and deceit, and what happened when the brothers met again twenty years later.",
	topic: "The story of the twins Jacob and Esau: the birthright, the stolen blessing and their reunion (Genesis 25, 27 and 33).",
	length: 3,
	depth: 4,
	sortOrder: 109,
	coversWholeCanon: false,
	steps: [
		{
			title: "Twins",
			content: {
				kind: "text",
				body:
					"Isaac was forty when he married Rebekah (Genesis 25:20). Like Sarah before her, she was barren, until Isaac prayed for her and the LORD answered (Genesis 25:21). She conceived twins, and the children struggled together within her (Genesis 25:22).\n\n" +
					"Their story runs across many chapters of Genesis. This study reads three moments in it: the birth and the birthright (Genesis 25), the stolen blessing (Genesis 27), and the meeting of the brothers twenty years later (Genesis 33).",
			},
		},
		{
			book: "GEN",
			startChapter: 25,
			startVerse: 19,
			endVerse: 34,
			title: "Two nations in the womb",
			explanation:
				"Notice the word God gives Rebekah before the boys are born: two nations are in her womb, and the older will serve the younger (25:23). Jacob comes out holding his brother's heel (25:26). Watch the parents take sides: Isaac loves Esau, Rebekah loves Jacob (25:28). The chapter ends with a bowl of stew and a short verdict: Esau despised his birthright (25:34).",
		},
		{
			title: "Esau",
			content: {
				kind: "character",
				entitySlug: "esau_1216",
				note:
					"Esau is the firstborn twin, red and hairy at birth (Genesis 25:25), a skilful hunter and his father's favourite (25:27–28). He is also called Edom (25:30), and the nation of the Edomites comes from him (36:9). Hebrews warns readers not to be like Esau, who sold his birthright for a single meal (Hebrews 12:16).",
			},
		},
		{
			book: "GEN",
			startChapter: 27,
			title: "The stolen blessing",
			explanation:
				"Notice that the plan is Rebekah's (27:5–10), and that Jacob's only worry is being found out (27:11–12). Isaac, whose eyes have grown dim (27:1), is not sure: \"The voice is Jacob's voice, but the hands are the hands of Esau\" (27:22). Listen to Esau's bitter cry when he learns what has happened (27:34), and watch how the chapter ends: one brother planning to kill the other (27:41), and the mother sending her favourite away (27:42–45).",
		},
		{
			title: "Isaac blesses Jacob",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/020.Isaac_Blesses_Jacob.jpg/1280px-020.Isaac_Blesses_Jacob.jpg",
				alt: "An engraving of an old bearded man seated beside a curtained bed, reaching out his hands over a young man who kneels with his head bowed against him, while a robed figure stands at the doorway, which opens onto palm trees and camels.",
				caption:
					"Isaac felt the hands of the son kneeling before him and blessed him, not knowing it was Jacob (Genesis 27:22–23).",
				credit: "Gustave Doré, Isaac Blesses Jacob, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:020.Isaac_Blesses_Jacob.jpg",
			},
		},
		{
			title: "Rebekah",
			content: {
				kind: "character",
				entitySlug: "rebekah_2401",
				note:
					"Rebekah chose to leave her family to marry Isaac (Genesis 24:58), and it was to her that God said the older would serve the younger (25:23). She loved Jacob (25:28), planned the deception of her husband (27:5–17), and then sent Jacob away to her brother Laban to save his life (27:42–45).",
			},
		},
		{
			book: "GEN",
			startChapter: 33,
			title: "Esau runs to meet him",
			explanation:
				"Twenty years have passed (31:41). Jacob has heard that Esau is coming with four hundred men, and he is terrified (32:6–7). Notice how he approaches, bowing to the ground seven times (33:3), and what Esau does instead: he runs, embraces him, kisses him, and they weep (33:4). Listen to Jacob: seeing Esau's face is like seeing the face of God (33:10). Notice too that the brothers still go separate ways (33:16–17).",
		},
		{
			title: "Jacob and Esau meet",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/025.Jacob_and_Esau_Meet.jpg/1280px-025.Jacob_and_Esau_Meet.jpg",
				alt: "An engraving of two men embracing in the middle of a large crowd of men, women and children, with palm trees, spears and riders on camels behind them.",
				caption: "Esau ran to meet him and embraced him, and fell on his neck and kissed him, and they wept (Genesis 33:4).",
				credit: "Gustave Doré, Jacob and Esau Meet, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:025.Jacob_and_Esau_Meet.jpg",
			},
		},
		{
			title: "Jacob and Esau in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"The brothers meet once more in Genesis, to bury their father Isaac together (Genesis 35:29). Their descendants became two nations, Israel and Edom, and God's law told Israel not to despise an Edomite, \"for he is your brother\" (Deuteronomy 23:7).\n\n" +
					"Hebrews remembers that by faith Isaac blessed both Jacob and Esau concerning things to come (Hebrews 11:20). Paul points back to the word Rebekah received before the twins were born, when neither had done good or bad, to show that God's purpose depends on his call and not on what people do (Romans 9:10–12).",
			},
		},
		{
			title: "Running to meet",
			content: {
				kind: "reflection",
				prompt:
					"Jacob had wronged his brother, and Esau ran to embrace him anyway. Is there someone you need to forgive, or ask forgiveness from? What would it look like to go and meet them?",
			},
			anchor: { book: "GEN", chapter: 33, verse: 4 },
		},
	],
};
