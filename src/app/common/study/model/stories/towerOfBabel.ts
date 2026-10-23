import { GlobalStudyDef } from "../globalStudy";

/** Genesis 11: the tower, the scattering, and the family of Abram. */
export const TOWER_OF_BABEL: GlobalStudyDef = {
	slug: "story-tower-of-babel",
	kind: "story",
	language: "en",
	name: "The Tower of Babel",
	description:
		"The whole world speaks one language, and people decide to build a tower to the heavens and make a name for themselves. Read what God does about it, and how the chapter ends with one family God will give a name.",
	topic: "The story of the tower of Babel, the scattering of the nations, and the family line that leads to Abram (Genesis 11).",
	length: 1,
	depth: 3,
	sortOrder: 105,
	coversWholeCanon: false,
	steps: [
		{
			title: "After the flood",
			content: {
				kind: "text",
				body:
					"When Noah and his family came out of the ark, God blessed them and told them to be fruitful, multiply and fill the earth (Genesis 9:1). Genesis 10 lists the families that came from Noah's sons, spreading out by their lands, each with its own language (Genesis 10:5, 20, 31). One of them is Nimrod, whose kingdom began in Babel, in the land of Shinar (Genesis 10:8–10).\n\n" +
					"Genesis 11 tells how the one language of the earth became many, and it begins in that same land of Shinar (Genesis 11:2).",
			},
		},
		{
			book: "GEN",
			startChapter: 11,
			startVerse: 1,
			endVerse: 9,
			title: "Let us make a name for ourselves",
			explanation:
				"Notice what the builders want: a city and a tower with its top in the heavens, a name for themselves, and not to be scattered over the earth (11:4), which is the opposite of what God told Noah's family to do (9:1). Then watch verse 5: they build a tower to reach the heavens, and the LORD comes down to see it. Notice too the echo of \"let us\": the people say it (11:3–4), and then God says it (11:7).",
		},
		{
			title: "The confusion of tongues",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/010.The_Tower_of_Babel.jpg/1280px-010.The_Tower_of_Babel.jpg",
				alt: "An engraving of a huge tower rising in tiers into the clouds; in the foreground people sit and stand among great cut stones, some holding their heads, while one man raises both arms to the sky.",
				caption:
					"The city was called Babel, because there the LORD confused the language of all the earth, and from there he scattered them (Genesis 11:9).",
				credit: "Gustave Doré, The Confusion of Tongues, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:010.The_Tower_of_Babel.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 11,
			startVerse: 10,
			endVerse: 26,
			title: "From Shem to Abram",
			explanation:
				"After the scattering of all the nations, Genesis follows one line of descendants, ten generations from Noah's son Shem (11:10) to Abram. Notice how the list keeps narrowing, from the whole earth to one man and his sons. It ends with Terah, the father of Abram, Nahor and Haran (11:26).",
		},
		{
			book: "GEN",
			startChapter: 11,
			startVerse: 27,
			endVerse: 32,
			title: "Terah's family",
			explanation:
				"Watch for two details that the next chapters depend on. Abram's wife Sarai is barren: she has no child (11:30). And the family sets out from Ur for the land of Canaan, but stops at Haran and settles there (11:31).",
		},
		{
			title: "Abram",
			content: {
				kind: "character",
				entitySlug: "abraham_58",
				note:
					"Genesis 11 ends with Abram, the son of Terah (Genesis 11:26–27). In the very next chapter God promises him what the builders of Babel tried to seize for themselves: \"I will make your name great\" (12:2), and through him all the families of the earth will be blessed (12:3).",
			},
		},
		{
			title: "Babel in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"The prophet Zephaniah looks ahead to a day when God will change the speech of the peoples to a pure speech, so that all of them may call on the name of the LORD and serve him together (Zephaniah 3:9).\n\n" +
					"At Pentecost, the Holy Spirit came on Jesus' followers and they spoke in other languages, and a crowd from every nation under heaven heard them, each in his own language (Acts 2:4–6). At Babel, language scattered people. In the last book of the Bible, John sees a great multitude from every nation, tribe, people and language, standing together before the throne of God (Revelation 7:9).",
			},
		},
		{
			title: "Whose name?",
			content: {
				kind: "reflection",
				prompt:
					"The builders of Babel wanted to make a name for themselves; a chapter later, God promised Abram that he would make his name great. Where are you working hardest to make a name for yourself, and what would it look like to trust God with it?",
			},
			anchor: { book: "GEN", chapter: 11, verse: 4 },
		},
	],
};
