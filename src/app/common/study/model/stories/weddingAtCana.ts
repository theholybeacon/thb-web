import { GlobalStudyDef } from "../globalStudy";

/** John 2: water into wine at Cana, and Jesus in the temple. */
export const WEDDING_AT_CANA: GlobalStudyDef = {
	slug: "story-wedding-at-cana",
	kind: "story",
	language: "en",
	name: "The Wedding at Cana",
	description:
		"At a village wedding the wine runs out, and Jesus' mother turns to him. Read the first sign in John's Gospel, so quiet that the master of the feast never knew where the wine came from, and the scene in the temple that follows it.",
	topic: "Jesus turns water into wine at a wedding in Cana, the first of his signs, and clears the temple in Jerusalem (John 2).",
	length: 1,
	depth: 3,
	sortOrder: 140,
	coversWholeCanon: false,
	steps: [
		{
			title: "A wedding in Galilee",
			content: {
				kind: "text",
				body:
					"Cana in Galilee was the home of Nathanael (John 21:2). Just before this story Jesus had called his first disciples, Nathanael among them (John 1:35–51).\n\n" +
					"On the third day there was a wedding at Cana. Jesus' mother was there, and Jesus and his disciples had been invited too (John 2:1–2). The problem in this story is a small, ordinary one, and this is where Jesus' signs begin (John 2:11).",
			},
		},
		{
			book: "JHN",
			startChapter: 2,
			startVerse: 1,
			endVerse: 5,
			title: "They have no wine",
			explanation:
				"Notice how few words Mary uses: she simply tells Jesus the problem (2:3). His reply speaks of his hour, which has not yet come (2:4). Then watch what Mary does: she does not argue, but turns to the servants and tells them to do whatever he tells them (2:5).",
		},
		{
			title: "Mary, the mother of Jesus",
			content: {
				kind: "character",
				entitySlug: "mary_1938",
				note:
					"John never gives her name; she is always \"the mother of Jesus\" (John 2:1). Jesus calls her \"Woman\" here (2:4), the same word he will use for her from the cross, when he gives her into the care of his disciple (John 19:26–27).",
			},
		},
		{
			book: "JHN",
			startChapter: 2,
			startVerse: 6,
			endVerse: 12,
			title: "Six stone jars",
			explanation:
				"Notice what the jars were for: the Jewish rites of purification (2:6). The servants fill them to the brim (2:7). Watch who knows what has happened and who does not: the master of the feast has no idea, but the servants who drew the water know (2:9). Verse 11 tells you why John recorded it.",
		},
		{
			title: "The marriage at Cana",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Marriage_at_Cana_engraving_by_Gustave_Dor%C3%A9.jpg",
				alt: "An engraving of a wedding feast under a striped awning on a raised terrace, with guests along a table; in front, servants crouch over large clay jars while others carry jars on their shoulders.",
				caption:
					"Doré puts the servants and their jars in the foreground, the ones who knew where the good wine had come from (John 2:9).",
				credit: "Gustave Doré, The Marriage at Cana, from La Grande Bible de Tours (1866). Public domain.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Marriage_at_Cana_engraving_by_Gustave_Dor%C3%A9.jpg",
			},
		},
		{
			title: "The first of his signs",
			content: {
				kind: "text",
				body:
					"John calls the miracles of Jesus \"signs\" (John 2:11; 20:30). This was the first, and through it Jesus revealed his glory, and his disciples believed in him (John 2:11). The second sign also happened in Cana, when Jesus healed an official's son from a distance (John 4:46–54).\n\n" +
					"Near the end of his Gospel John explains why he wrote these signs down: so that you may believe that Jesus is the Christ, the Son of God, and that by believing you may have life in his name (John 20:30–31).",
			},
		},
		{
			book: "JHN",
			startChapter: 2,
			startVerse: 13,
			endVerse: 25,
			title: "In the temple",
			explanation:
				"From a wedding to the temple at Passover. Notice what makes Jesus angry: his Father's house turned into a marketplace (2:16). Listen to the strange answer he gives when asked for a sign (2:19), and to John's note on what he meant (2:21). The disciples understood it only after he was raised from the dead (2:22).",
		},
		{
			title: "Jesus",
			content: {
				kind: "character",
				entitySlug: "jesus_905",
				note:
					"John's Gospel opens by calling Jesus the Word who was with God, and who became flesh and lived among us; \"we have seen his glory\" (John 1:1, 1:14). At Cana, John says, Jesus first revealed that glory (John 2:11).",
			},
		},
		{
			title: "Whatever he tells you",
			content: {
				kind: "reflection",
				prompt:
					"Mary did not know what Jesus would do, but she told the servants to do whatever he said. Where do you need to bring a need to Jesus and then trust him with the answer?",
			},
			anchor: { book: "JHN", chapter: 2, verse: 5 },
		},
	],
};
