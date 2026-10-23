import { GlobalStudyDef } from "../globalStudy";

/** Daniel 3: three young men refuse to bow to a golden statue. */
export const FIERY_FURNACE: GlobalStudyDef = {
	slug: "story-fiery-furnace",
	kind: "story",
	language: "en",
	name: "The Fiery Furnace",
	description:
		"A king sets up a golden statue and orders the whole empire to bow. Three young men from Judah stand still, and are thrown into a furnace so hot it kills the soldiers who throw them in.",
	topic: "Shadrach, Meshach and Abednego refuse to worship Nebuchadnezzar's golden image and are saved in the fiery furnace (Daniel 3).",
	length: 1,
	depth: 3,
	sortOrder: 135,
	coversWholeCanon: false,
	steps: [
		{
			title: "Exiles in Babylon",
			content: {
				kind: "text",
				body:
					"Nebuchadnezzar, king of Babylon, besieged Jerusalem and carried away young men from Judah's leading families to be trained for his court (Daniel 1:1–4). Among them were Daniel, Hananiah, Mishael and Azariah, who were given Babylonian names: Hananiah became Shadrach, Mishael Meshach, and Azariah Abednego (Daniel 1:6–7).\n\n" +
					"From the start they kept faith in small things, asking not to eat the king's food (Daniel 1:8–12). By the end of chapter 2 the king had set the three friends over the affairs of the province of Babylon (Daniel 2:49). Chapter 3 tests that faith in public.",
			},
		},
		{
			book: "DAN",
			startChapter: 3,
			startVerse: 1,
			endVerse: 12,
			title: "The golden image",
			explanation:
				"Notice the size of the statue (3:1) and how long the list of officials is (3:2–3): the whole empire is summoned. Watch how the command and the punishment come together in verses 5–6. Then notice who brings the charge, and how they describe the three: men the king himself had put in charge (3:12).",
		},
		{
			book: "DAN",
			startChapter: 3,
			startVerse: 13,
			endVerse: 18,
			title: "But if not",
			explanation:
				"The king gives them a second chance and asks who the god is who could save them from his hand (3:15). Read their answer slowly (3:16–18). Notice that they say God is able to deliver them, and then add: even if he does not, they will not serve the king's gods.",
		},
		{
			title: "Shadrach",
			content: {
				kind: "character",
				entitySlug: "shadrach_1398",
				note:
					"Shadrach, Meshach and Abednego always appear together in Daniel. Shadrach's Hebrew name was Hananiah (Daniel 1:7), and with Daniel and the other two he was found ten times wiser than all the magicians of the kingdom (1:19–20).",
			},
		},
		{
			book: "DAN",
			startChapter: 3,
			startVerse: 19,
			endVerse: 25,
			title: "Into the fire",
			explanation:
				"The king's face changes (3:19), and the furnace is heated seven times hotter. Notice that the flames kill the men who throw them in (3:22). Then watch the king leap to his feet: he sees four men, unbound, walking in the middle of the fire, unharmed (3:24–25).",
		},
		{
			title: "Three men in the furnace",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/129.Shadrach%2C_Meshach_and_Abednego_in_the_Furnace.jpg/1280px-129.Shadrach%2C_Meshach_and_Abednego_in_the_Furnace.jpg",
				alt: "An engraving of three young men standing calmly inside the arched mouth of a furnace, flames and smoke around their feet, while the king's court looks down from a ledge above.",
				caption:
					"Doré shows the three standing in the flames while the court watches. When they came out, not a hair of their heads was singed (Daniel 3:27).",
				credit: "Gustave Doré, Shadrach, Meshach and Abednego in the Furnace, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:129.Shadrach,_Meshach_and_Abednego_in_the_Furnace.jpg",
			},
		},
		{
			book: "DAN",
			startChapter: 3,
			startVerse: 26,
			endVerse: 30,
			title: "Not even the smell of fire",
			explanation:
				"The king calls them \"servants of the Most High God\" (3:26). Notice how carefully the officials inspect them: hair, cloaks, not even the smell of fire (3:27). Then listen to what the king praises them for: they trusted their God and gave up their bodies rather than worship any god but their own (3:28).",
		},
		{
			title: "Nebuchadnezzar",
			content: {
				kind: "character",
				entitySlug: "nebuchadnezzar_2167",
				note:
					"Nebuchadnezzar was the king of Babylon who took Jerusalem and sent its people into exile (2 Kings 25:1–11). In Daniel his attitude to Israel's God shifts: here he blesses the God of the three young men (Daniel 3:28), and by chapter 4 he praises the King of heaven himself (Daniel 4:37).",
			},
		},
		{
			title: "Even if not",
			content: {
				kind: "reflection",
				prompt:
					"The three friends trusted that God could save them, and decided in advance to stay faithful even if he did not. What would it look like for you to hold that kind of faith in something you are facing now?",
			},
			anchor: { book: "DAN", chapter: 3, verse: 18 },
		},
	],
};
