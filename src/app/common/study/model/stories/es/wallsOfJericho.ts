import { GlobalStudyDef } from "../../globalStudy";

/** Josué 5:13–6:27: el príncipe del ejército del SEÑOR, la marcha alrededor de Jericó y la caída de sus muros. */
export const WALLS_OF_JERICHO_ES: GlobalStudyDef = {
	slug: "story-walls-of-jericho-es",
	kind: "story",
	language: "es",
	name: "Los muros de Jericó",
	description:
		"Una ciudad amurallada y bien cerrada, y un ejército al que se le ordena no hacer nada más que rodearla en silencio durante siete días. Lee cómo cayó Jericó y cómo, en medio de su destrucción, se cumplió una promesa hecha a una sola familia.",
	topic: "La caída de Jericó bajo el mando de Josué y el rescate de la familia de Rahab (Josué 5:13–6:27).",
	length: 1,
	depth: 3,
	sortOrder: 121,
	coversWholeCanon: false,
	steps: [
		{
			title: "Al otro lado del Jordán",
			content: {
				kind: "text",
				body:
					"Israel cruza el Jordán tal como sus padres cruzaron el mar. En cuanto los sacerdotes que llevan el arca entran en el río, las aguas se detienen y el pueblo pasa en seco (Josué 3:15–17), y Josué les dice que Dios lo hizo igual que cuando secó el mar Rojo (4:23).\n\n" +
					"Acampan en Gilgal, cerca de Jericó (4:19), y allí celebran la Pascua (5:10). Al día siguiente comen del fruto de la tierra, y el maná que los alimentó durante cuarenta años deja de caer (5:11–12). El desierto ha quedado atrás. Jericó se alza frente a ellos.",
			},
		},
		{
			book: "JOS",
			startChapter: 5,
			startVerse: 13,
			endVerse: 15,
			title: "El príncipe del ejército del SEÑOR",
			explanation:
				"Josué se encuentra con un hombre que tiene una espada desenvainada y le hace la pregunta obvia: ¿eres de los nuestros o de nuestros enemigos? (5:13). Fíjate en la respuesta del versículo 14: ninguna de las dos. Ha venido como príncipe del ejército del SEÑOR, y Josué se postra rostro en tierra y adora. Observa lo que se le pide a Josué en el versículo 15, lo mismo que se le pidió a Moisés ante la zarza ardiente (Éxodo 3:5).",
		},
		{
			book: "JOS",
			startChapter: 6,
			startVerse: 1,
			endVerse: 14,
			title: "Seis días de silencio",
			explanation:
				"Antes de que se dé un solo paso, Dios dice que ya ha entregado Jericó en manos de Josué (6:2). Mira el extraño plan: una vuelta a la ciudad cada día durante seis días, con sacerdotes que llevan siete bocinas de cuerno de carnero y el arca del pacto en medio (6:3–4). Fíjate en la orden del versículo 10: el pueblo no debe gritar ni decir una sola palabra hasta el día en que Josué se lo indique.",
		},
		{
			title: "Los muros caen",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/046.The_Walls_of_Jericho_Fall_Down.jpg/1280px-046.The_Walls_of_Jericho_Fall_Down.jpg",
				alt: "Un grabado de enormes muros de piedra que se derrumban, con cuerpos y bloques cayendo en primer plano, mientras más allá de la brecha avanza bajo una luz intensa una procesión de sacerdotes que tocan largos cuernos y llevan el arca.",
				caption: "Los sacerdotes tocaron las bocinas, el pueblo dio un gran grito y el muro se derrumbó (Josué 6:20).",
				credit: "Gustave Doré, The Walls of Jericho Fall Down, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:046.The_Walls_of_Jericho_Fall_Down.jpg",
			},
		},
		{
			book: "JOS",
			startChapter: 6,
			startVerse: 15,
			endVerse: 27,
			title: "El séptimo día",
			explanation:
				"El séptimo día dan siete vueltas, y al sonar las bocinas el pueblo grita y el muro cae (6:15–20). El versículo 21 es difícil de leer: todo lo que hay en la ciudad es destruido, y el texto no lo suaviza. Fíjate en que, en medio de la destrucción, los espías cumplen su juramento: Rahab y toda su familia salen con vida (6:22–25). Josué también pronuncia una maldición sobre quien reconstruya la ciudad (6:26).",
		},
		{
			title: "Josué",
			content: {
				kind: "character",
				entitySlug: "joshua_1727",
				note:
					"Ayudante de Moisés, uno de los dos espías fieles y ahora el líder de Israel (Éxodo 24:13; Números 14:6–9; Josué 1:1–2). Hace exactamente lo que se le dice, aunque no tenga ningún sentido militar, y el capítulo termina así: el SEÑOR estaba con Josué, y su fama se extendió por toda la tierra (Josué 6:27).",
			},
		},
		{
			title: "Jericó en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"La maldición de Josué sobre Jericó se recuerda siglos después, en los días del rey Acab, cuando Hiel de Betel reconstruye la ciudad a costa de su hijo primogénito y de su hijo menor, \"conforme a la palabra de Jehová\" dicha por medio de Josué (1 Reyes 16:29, 34; Josué 6:26).\n\n" +
					"La carta a los Hebreos incluye la caída de Jericó en su lista de lo que ha logrado la fe: por la fe cayeron los muros, después de que el pueblo los rodeó durante siete días (Hebreos 11:30). El versículo siguiente nombra a Rahab, que no pereció junto con el resto de la ciudad (Hebreos 11:31).",
			},
		},
		{
			title: "Caminar en silencio",
			content: {
				kind: "reflection",
				prompt:
					"Durante seis días Israel rodeó un muro que no se movía, confiando en la promesa de que ya era suyo. ¿En qué área se te pide seguir haciendo lo que Dios ha dicho, aunque todavía no veas que nada cambie?",
			},
			anchor: { book: "JOS", chapter: 6, verse: 2 },
		},
	],
};
