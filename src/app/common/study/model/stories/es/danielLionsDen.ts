import { GlobalStudyDef } from "../../globalStudy";

/** Daniel 6: una ley contra la oración y una noche entre leones. */
export const DANIEL_LIONS_DEN_ES: GlobalStudyDef = {
	slug: "story-daniel-lions-den-es",
	kind: "story",
	language: "es",
	name: "Daniel en el foso de los leones",
	description:
		"Los rivales de Daniel no encuentran ni una sola falta en su trabajo, así que convierten sus oraciones en un delito. Lee cómo siguió orando junto a su ventana abierta, y lo que el rey encontró en el foso de los leones al amanecer.",
	topic: "Daniel sigue orando a pesar del decreto del rey Darío y es guardado en el foso de los leones (Daniel 6).",
	length: 1,
	depth: 3,
	sortOrder: 136,
	coversWholeCanon: false,
	steps: [
		{
			title: "Una larga vida en el exilio",
			content: {
				kind: "text",
				body:
					"Daniel fue llevado a Babilonia siendo joven, como uno de los muchachos de Judá escogidos para servir en el palacio del rey (Daniel 1:3–6). Permaneció allí durante el reinado de varios reyes, hasta el primer año del rey Ciro (Daniel 1:21).\n\n" +
					"Para el capítulo 6, el reino de Babilonia ha sido entregado a los medos y a los persas (Daniel 5:28), y su rey, Belsasar, ha muerto en una sola noche (Daniel 5:30). Un nuevo gobernante, Darío, organiza ahora el reino, y Daniel, un exiliado de Judá, vuelve a estar entre sus más altos funcionarios (Daniel 6:1–2).",
			},
		},
		{
			book: "DAN",
			startChapter: 6,
			startVerse: 1,
			endVerse: 9,
			title: "Una trampa hecha de leyes",
			explanation:
				"Fíjate en por qué los funcionarios se ponen en contra de Daniel: el rey piensa ponerlo sobre todo el reino (6:3). Observa cuánto se esfuerzan por encontrarle una falta, sin lograrlo (6:4), y lo que deciden en el versículo 5: la única manera de atraparlo es por medio de la ley de su Dios. Fíjate en el detalle del versículo 8: una ley de los medos y persas no puede ser cambiada.",
		},
		{
			book: "DAN",
			startChapter: 6,
			startVerse: 10,
			endVerse: 15,
			title: "Daniel ora como antes",
			explanation:
				"El versículo 10 es el centro de la historia. Daniel sabe que el documento ha sido firmado, y entra en su casa y ora con las ventanas abiertas hacia Jerusalén, tres veces al día, como lo había hecho siempre. Luego fíjate en el rey: se angustia y, hasta la puesta del sol, busca la manera de salvar a Daniel (6:14).",
		},
		{
			title: "Daniel",
			content: {
				kind: "character",
				entitySlug: "daniel_975",
				note:
					"Sus enemigos no pudieron hallar en Daniel ningún error ni falta, porque era fiel y digno de confianza (Daniel 6:4). A lo largo de su larga vida en Babilonia sirvió a reyes que no compartían su fe, y nunca dejó de orar a su Dios.",
			},
		},
		{
			book: "DAN",
			startChapter: 6,
			startVerse: 16,
			endVerse: 24,
			title: "Una noche en el foso",
			explanation:
				"Escucha lo que dice el rey cuando Daniel entra al foso (6:16), y observa cómo pasa la noche: sin comer, sin entretenimiento, sin dormir (6:18). Al amanecer corre al foso y llama con voz angustiada (6:20). Fíjate en la razón que da el texto de que Daniel saliera ileso: \"porque creyó en su Dios\" (6:23). El final del versículo 24 es duro de leer; la historia no lo oculta.",
		},
		{
			title: "Daniel en el foso de los leones",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/131.Daniel_in_the_Lions%27_Den.jpg/1280px-131.Daniel_in_the_Lions%27_Den.jpg",
				alt: "Un grabado de un hombre con una larga túnica, de pie en un foso rocoso, mirando hacia un rayo de luz, rodeado de leones echados o de pie a su alrededor; en el suelo hay huesos.",
				caption:
					"\"El Dios mío envió su ángel, el cual cerró la boca de los leones\" (Daniel 6:22). Doré muestra a Daniel mirando hacia la luz, con los leones a su alrededor.",
				credit: "Gustave Doré, Daniel in the Lions' Den, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:131.Daniel_in_the_Lions%27_Den.jpg",
			},
		},
		{
			book: "DAN",
			startChapter: 6,
			startVerse: 25,
			endVerse: 28,
			title: "El Dios viviente",
			explanation:
				"La historia termina con un decreto que es casi un salmo. Fíjate en lo que Darío dice ahora del Dios de Daniel: es el Dios viviente, su reino nunca será destruido, y él salva y libra (6:26–27). El último versículo te cuenta que Daniel prosperó durante el reinado de Darío y durante el de Ciro (6:28).",
		},
		{
			title: "Darío",
			content: {
				kind: "character",
				entitySlug: "darius_980",
				note:
					"Daniel lo llama Darío de Media (Daniel 11:1). Favorece a Daniel, firma la ley que lo pone en peligro y luego pasa una noche en vela esperando que el Dios de Daniel lo salve (6:16–18).",
			},
		},
		{
			title: "Daniel en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Jesús habla del \"profeta Daniel\" cuando advierte a sus discípulos sobre el futuro (Mateo 24:15).\n\n" +
					"La carta a los Hebreos, al enumerar a quienes vivieron por la fe, habla de algunos que taparon bocas de leones y apagaron fuegos impetuosos (Hebreos 11:33–34). No da sus nombres, pero esas palabras coinciden con Daniel 6 y Daniel 3.",
			},
		},
		{
			title: "Orar como antes",
			content: {
				kind: "reflection",
				prompt:
					"Daniel no empezó a orar por causa de la crisis; mantuvo el hábito que ya tenía. ¿Qué hábito diario de fe te gustaría estar cultivando ya para cuando llegue un día difícil?",
			},
			anchor: { book: "DAN", chapter: 6, verse: 10 },
		},
	],
};
