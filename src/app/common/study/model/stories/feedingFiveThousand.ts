import { GlobalStudyDef } from "../globalStudy";

/** John 6: the loaves and fish, and the bread of life. */
export const FEEDING_FIVE_THOUSAND: GlobalStudyDef = {
	slug: "story-feeding-five-thousand",
	kind: "story",
	language: "en",
	name: "The Feeding of the Five Thousand",
	description:
		"A hungry crowd on a hillside, a boy's lunch of five loaves and two fish, and twelve baskets of leftovers. Then Jesus tells the same crowd what the bread was pointing to, and many of them walk away.",
	topic: "Jesus feeds five thousand people and then teaches that he is the bread of life (John 6).",
	length: 2,
	depth: 4,
	sortOrder: 142,
	coversWholeCanon: false,
	steps: [
		{
			title: "A crowd on the hillside",
			content: {
				kind: "text",
				body:
					"Jesus had crossed to the far side of the Sea of Galilee, and a large crowd followed him there, because they had seen the signs he did for the sick (John 6:1–2). It was close to the Passover, the feast that remembered how God fed and freed his people in the wilderness (John 6:4).\n\n" +
					"This is the only miracle from Jesus' ministry that all four Gospels tell (Matthew 14:13–21; Mark 6:30–44; Luke 9:10–17; John 6:1–14). Mark adds why Jesus stopped to care for them: he had compassion on them, because they were like sheep without a shepherd (Mark 6:34).",
			},
		},
		{
			book: "JHN",
			startChapter: 6,
			startVerse: 1,
			endVerse: 15,
			title: "Five loaves and two fish",
			explanation:
				"Notice that Jesus asks Philip where to buy bread already knowing what he will do (6:5–6). Philip does the sums and finds them impossible (6:7); Andrew finds a boy with five barley loaves and two fish, and wonders what good they are (6:8–9). Watch what Jesus does with them: he gives thanks, and everyone eats as much as they want (6:11). Then see how the crowd responds, and why Jesus withdraws alone to the mountain (6:14–15).",
		},
		{
			title: "The Miracle of the Loaves and Fishes",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Brooklyn_Museum_-_The_Miracle_of_the_Loaves_and_Fishes_%28La_multiplication_des_pains%29_by_James_Tissot.jpg",
				alt: "A watercolour of a great crowd seated in long rows along a grassy, rocky hillside, with people carrying baskets among them.",
				caption:
					"John remembers that there was much grass in the place, and that the people sat down, about five thousand men (John 6:10). Tissot fills the whole hillside with them.",
				credit: "James Tissot, The Miracle of the Loaves and Fishes, from The Life of Our Lord Jesus Christ (1886–1894). Public domain.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Miracle_of_the_Loaves_and_Fishes_(La_multiplication_des_pains)_by_James_Tissot.jpg",
			},
		},
		{
			title: "Andrew",
			content: {
				kind: "character",
				entitySlug: "andrew_264",
				note:
					"Andrew, Simon Peter's brother (John 6:8), is the one who brings the boy and his lunch to Jesus. It is a habit with him: he brought his brother Simon to Jesus (John 1:40–42), and later he brought the Greeks who wanted to see Jesus (John 12:20–22).",
			},
		},
		{
			book: "JHN",
			startChapter: 6,
			startVerse: 22,
			endVerse: 40,
			title: "I am the bread of life",
			explanation:
				"That night the disciples crossed the lake and Jesus came to them walking on the water (6:16–21). The next day the crowd finds him again, and he tells them plainly why they came: they ate their fill of the loaves (6:26). Notice how they bring up the manna their fathers ate in the wilderness (6:31), and how Jesus answers: \"I am the bread of life\" (6:35). Look for the promise in verse 37 to everyone who comes to him.",
		},
		{
			book: "JHN",
			startChapter: 6,
			startVerse: 41,
			endVerse: 71,
			title: "Many turn back",
			explanation:
				"The crowd grumbles: is this not Joseph's son, whose parents we know (6:42)? Jesus goes further, speaking of eating his flesh and drinking his blood (6:53–56), and even his disciples call it a hard saying (6:60). Many of them stop following him (6:66). Then Jesus asks the Twelve if they will go too, and listen to Peter's answer: \"Lord, to whom shall we go?\" (6:68).",
		},
		{
			title: "Bread in the rest of the Bible",
			content: {
				kind: "text",
				body:
					"In the wilderness God rained bread from heaven for Israel every morning, and they called it manna (Exodus 16:4, 15). Moses later told them why: so they would learn that man does not live by bread alone, but by every word that comes from the mouth of the LORD (Deuteronomy 8:3). Jesus quoted those words when he was hungry in the wilderness himself (Matthew 4:4).\n\n" +
					"The prophet Elisha once fed a hundred men with twenty barley loaves, and there was some left over (2 Kings 4:42–44). And Jesus taught his disciples to ask the Father, \"Give us this day our daily bread\" (Matthew 6:11).",
			},
		},
		{
			title: "What are you hungry for?",
			content: {
				kind: "reflection",
				prompt:
					"The crowd came back for more bread, and Jesus offered them himself. What are you hungry for right now, and what would it look like to bring that hunger to him?",
			},
			anchor: { book: "JHN", chapter: 6, verse: 35 },
		},
	],
};
