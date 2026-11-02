import { GlobalStudyDef } from "../../globalStudy";

/** Lucas 18:35–19:10: Jesús pasa por Jericó. */
export const ZACCHAEUS_ES: GlobalStudyDef = {
	slug: "story-zacchaeus-es",
	kind: "story",
	language: "es",
	name: "Zaqueo",
	description:
		"Un publicano rico y mal visto de Jericó se sube a un árbol para alcanzar a ver a Jesús, y Jesús se invita a sí mismo a su casa. Al terminar la comida, Zaqueo está regalando su dinero.",
	topic: "Jesús sana a un ciego cerca de Jericó y llama a Zaqueo, el publicano (Lucas 18:35–19:10).",
	length: 1,
	depth: 3,
	sortOrder: 145,
	coversWholeCanon: false,
	steps: [
		{
			title: "Ricos y publicanos",
			content: {
				kind: "text",
				body:
					"Jesús va en su último viaje a Jerusalén (Lucas 18:31), y el camino pasa por Jericó (Lucas 19:1). Poco antes, un príncipe rico se había ido muy triste, sin querer renunciar a su riqueza, y Jesús dijo cuán difícil es que los ricos entren en el reino de Dios (Lucas 18:23–25). Los que lo oían preguntaron quién podría ser salvo, y él respondió que lo imposible para los hombres es posible para Dios (Lucas 18:26–27).\n\n" +
					"A los publicanos se los metía en el mismo saco que a los pecadores (Lucas 15:1). En una parábola que Jesús acababa de contar, un fariseo hasta le daba gracias a Dios por no ser como el publicano que tenía al lado (Lucas 18:11). Ahora Jesús se encuentra con un hombre que es publicano y además rico.",
			},
		},
		{
			book: "LUK",
			startChapter: 18,
			startVerse: 35,
			endVerse: 43,
			title: "Un ciego junto al camino",
			explanation:
				"Cuando Jesús se acerca a Jericó, un mendigo ciego oye a la multitud y clama a él, y la gente le dice que se calle (18:38–39). Fíjate en que Jesús se detiene (18:40) y le pregunta qué quiere (18:41). Ten presente esta escena: en el capítulo siguiente, otro hombre de Jericó quiere ver a Jesús, y otra vez la multitud le estorba.",
		},
		{
			book: "LUK",
			startChapter: 19,
			startVerse: 1,
			endVerse: 10,
			title: "Zaqueo sobre el árbol",
			explanation:
				"Zaqueo es jefe de los publicanos y rico (19:2), y demasiado bajo de estatura para ver por encima de la multitud (19:3). Fíjate en que Jesús se detiene bajo el árbol, lo llama por su nombre y le dice: \"hoy es necesario que pose en tu casa\" (19:5). La multitud murmura (19:7); Zaqueo da la mitad de sus bienes a los pobres y devuelve cuatro veces más a quien haya defraudado (19:8). Lee despacio las últimas palabras de Jesús (19:10).",
		},
		{
			title: "Zaqueo en el sicómoro",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Brooklyn_Museum_-_Zacchaeus_in_the_Sycamore_Awaiting_the_Passage_of_Jesus_%28Zach%C3%A9e_sur_le_sycomore_attendant_le_passage_de_J%C3%A9sus%29_-_James_Tissot.jpg",
				alt: "Una acuarela de un hombre con túnica dorada y turbante que trepa por una gruesa rama sobre una calle llena de gente. Abajo camina un grupo vestido de blanco, y otras personas trepan al mismo árbol.",
				caption:
					"Zaqueo corrió delante y se subió a un sicómoro para ver a Jesús, que había de pasar por allí (Lucas 19:4).",
				credit:
					"James Tissot, Zacchaeus in the Sycamore Awaiting the Passage of Jesus, de The Life of Our Lord Jesus Christ (1886–1894). Dominio público.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Zacchaeus_in_the_Sycamore_Awaiting_the_Passage_of_Jesus_(Zach%C3%A9e_sur_le_sycomore_attendant_le_passage_de_J%C3%A9sus)_-_James_Tissot.jpg",
			},
		},
		{
			title: "Zaqueo",
			content: {
				kind: "character",
				entitySlug: "zacchaeus_2961",
				note:
					"Solo Lucas cuenta su historia. La multitud lo llamó pecador (19:7); Jesús lo llamó \"hijo de Abraham\" (19:9). Por el dinero obtenido con engaño, la Ley pedía devolverlo completo y añadir una quinta parte (Levítico 6:2–5); Zaqueo promete devolver cuatro veces más, lo que la Ley exigía a quien robaba una oveja y la vendía (Éxodo 22:1).",
			},
		},
		{
			title: "Los publicanos en el resto de los Evangelios",
			content: {
				kind: "text",
				body:
					"Cuando unos publicanos fueron a Juan el Bautista para ser bautizados y le preguntaron qué debían hacer, él les dijo que no cobraran más de lo que les estaba ordenado (Lucas 3:12–13). Jesús llamó a un publicano, Leví, a seguirlo, y él lo dejó todo y lo siguió (Lucas 5:27–28). El Evangelio de Mateo llama Mateo a este mismo hombre (Mateo 9:9).\n\n" +
					"Jesús dijo a los líderes religiosos que los publicanos y las rameras iban delante de ellos al reino de Dios (Mateo 21:31). Zaqueo es uno de ellos: el hombre que el príncipe rico no pudo ser (Lucas 18:23).",
			},
		},
		{
			title: "Recibido primero",
			content: {
				kind: "reflection",
				prompt:
					"Jesús llamó a Zaqueo por su nombre y le pidió quedarse en su casa antes de que Zaqueo cambiara nada. ¿Qué hizo en él esa bienvenida? ¿Qué serías libre de soltar si supieras que eres recibido así?",
			},
			anchor: { book: "LUK", chapter: 19, verse: 10 },
		},
	],
};
