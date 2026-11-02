import { GlobalStudyDef } from "../../globalStudy";

/** Mateo 1–2 y Lucas 1–2: el nacimiento de Jesús, tal como lo cuentan ambos Evangelios. */
export const BIRTH_OF_JESUS_ES: GlobalStudyDef = {
	slug: "story-birth-of-jesus-es",
	kind: "story",
	language: "es",
	name: "El nacimiento de Jesús",
	description:
		"Un ángel visita a María en Nazaret, José tiene un sueño, unos pastores dejan sus rebaños de noche y unos viajeros siguen una estrella. Lee la historia de la Navidad tal como la cuenta la Biblia, con Mateo y Lucas lado a lado.",
	topic: "El anuncio y el nacimiento de Jesús, los pastores, Simeón y Ana, y la visita de los magos (Lucas 1–2; Mateo 1–2).",
	length: 3,
	depth: 4,
	sortOrder: 138,
	coversWholeCanon: false,
	steps: [
		{
			title: "Dos Evangelios, un nacimiento",
			content: {
				kind: "text",
				body:
					"Dos de los cuatro Evangelios relatan el nacimiento de Jesús, y cada uno cuenta una parte distinta. Mateo sigue a José: sus sueños, la visita de los magos, la ira del rey Herodes y la huida a Egipto (Mateo 1:18–2:23). Lucas sigue a María: la visita del ángel, su estancia con su parienta Elisabet, los pastores y el anciano Simeón en el templo (Lucas 1:26–2:40).\n\n" +
					"Lucas dice que investigó todo con cuidado para escribir un relato ordenado (Lucas 1:3). Mateo comienza con la genealogía de Jesús, que se remonta hasta David y Abraham (Mateo 1:1). Este estudio lee los dos lado a lado.",
			},
		},
		{
			book: "LUK",
			startChapter: 1,
			startVerse: 26,
			endVerse: 56,
			title: "El ángel visita a María",
			explanation:
				"Fíjate adónde es enviado el ángel Gabriel: a Nazaret, un pueblo de Galilea, a una virgen desposada con José (1:26–27). Escucha la pregunta de María en el versículo 34 y su respuesta en el versículo 38. Luego ella va de prisa a ver a su parienta Elisabet, y sus palabras se convierten en un cántico de alabanza (1:46–55); observa a quién exalta Dios en él, y a quién derriba (1:52).",
		},
		{
			title: "María",
			content: {
				kind: "character",
				entitySlug: "mary_1938",
				note:
					"La respuesta de María al ángel es de las más sencillas de la Biblia: se llama a sí misma la sierva del Señor y acepta su palabra (Lucas 1:38). Lucas dice que guardaba todas estas cosas, meditándolas en su corazón (Lucas 2:19). Estuvo junto a la cruz (Juan 19:25) y entre los discípulos que oraban después de que Jesús resucitó (Hechos 1:14).",
			},
		},
		{
			book: "MAT",
			startChapter: 1,
			startVerse: 18,
			endVerse: 25,
			title: "El sueño de José",
			explanation:
				"Aquí la historia se cuenta desde el lado de José. Fíjate en qué clase de hombre es: justo, y sin querer exponer a María a la vergüenza (1:19). Observa qué nombre le dice el ángel que ponga al niño, y por qué (1:21). Fíjate en cómo termina el pasaje: José hace exactamente lo que el ángel le mandó (1:24).",
		},
		{
			title: "José",
			content: {
				kind: "character",
				entitySlug: "joseph_1715",
				note:
					"José actúa de inmediato ante cada mensaje que Dios le envía en sueños (Mateo 1:24; 2:14; 2:21). Era de la casa de David (Lucas 2:4), y más tarde la gente de Nazaret llamaba a Jesús \"el hijo del carpintero\" (Mateo 13:55).",
			},
		},
		{
			book: "LUK",
			startChapter: 2,
			startVerse: 1,
			endVerse: 20,
			title: "El nacimiento y los pastores",
			explanation:
				"Fíjate en la sencillez con que se cuenta el nacimiento (2:6–7): un hijo primogénito, envuelto en pañales y acostado en un pesebre, porque no había lugar para ellos. Luego observa quiénes reciben la noticia primero: unos pastores que velaban en el campo de noche (2:8). La señal que se les da es el pesebre (2:12). Van de prisa, cuentan lo que vieron y vuelven alabando a Dios (2:16–20).",
		},
		{
			title: "Los pastores ante el pesebre",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Brooklyn_Museum_-_The_Adoration_of_the_Shepherds_%28L%27adoration_des_bergers%29_-_James_Tissot_-_overall.jpg",
				alt: "Una pintura de un refugio oscuro, parecido a una cueva: una mujer vestida de blanco se arrodilla junto a un recién nacido acostado sobre paja, mientras los pastores entran por la izquierda con corderos, aves y cestas; un buey y un asno observan, y un hombre mira desde la derecha.",
				caption:
					"Lucas menciona un pesebre (Lucas 2:7) y pastores que vinieron de prisa (Lucas 2:16). El buey y el asno son un añadido del pintor; el texto no los menciona.",
				credit: "James Tissot, The Adoration of the Shepherds (1886–1894), Brooklyn Museum. Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Adoration_of_the_Shepherds_(L%27adoration_des_bergers)_-_James_Tissot_-_overall.jpg",
			},
		},
		{
			book: "LUK",
			startChapter: 2,
			startVerse: 21,
			endVerse: 40,
			title: "Simeón y Ana",
			explanation:
				"María y José llevan al niño al templo con la ofrenda de dos aves (2:24), que la ley permitía a quienes no podían pagar un cordero (Levítico 12:8). Fíjate en Simeón, que esperaba la consolación de Israel (2:25), y en lo que dice del niño: luz para los gentiles (2:32). Luego escucha su palabra difícil para María (2:34–35), y observa a la anciana profetisa Ana, que habla del niño a todos los que esperaban la redención (2:38).",
		},
		{
			book: "MAT",
			startChapter: 2,
			title: "Los magos y el rey",
			explanation:
				"Unos magos del oriente llegan preguntando por el rey de los judíos que ha nacido (2:1–2). Fíjate en los dos reyes de este capítulo: Herodes, turbado e intrigante (2:3, 2:16), y el niño, adorado con oro, incienso y mirra (2:11). Mateo no dice cuánto tiempo después del nacimiento llegaron los magos; para entonces la familia está en una casa (2:11). Observa con qué frecuencia Dios guía a las personas por medio de sueños (2:12, 2:13, 2:19, 2:22).",
		},
		{
			title: "Los magos en camino",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Brooklyn_Museum_-_The_Magi_Journeying_%28Les_rois_mages_en_voyage%29_-_James_Tissot_-_overall.jpg/1280px-Brooklyn_Museum_-_The_Magi_Journeying_%28Les_rois_mages_en_voyage%29_-_James_Tissot_-_overall.jpg",
				alt: "Una pintura de tres jinetes con mantos amarillos montados en camellos, que encabezan una larga caravana de personas y animales por un camino sinuoso entre colinas desérticas y áridas.",
				caption:
					"Tissot pintó tres jinetes. Mateo dice que los magos vinieron \"del oriente\" (Mateo 2:1) y trajeron tres clases de regalos (Mateo 2:11), pero no dice cuántos eran.",
				credit: "James Tissot, The Magi Journeying (1886–1894), Brooklyn Museum. Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Magi_Journeying_(Les_rois_mages_en_voyage)_-_James_Tissot_-_overall.jpg",
			},
		},
		{
			title: "Guardado en su corazón",
			content: {
				kind: "reflection",
				prompt:
					"Mientras todos a su alrededor se maravillaban y hablaban, María guardaba estas cosas y las meditaba. ¿Qué parte de esta historia quieres guardar y meditar en tu propio corazón esta semana?",
			},
			anchor: { book: "LUK", chapter: 2, verse: 19 },
		},
	],
};
