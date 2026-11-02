import { GlobalStudyDef } from "../../globalStudy";

/** Juan 6: los panes y los peces, y el pan de vida. */
export const FEEDING_FIVE_THOUSAND_ES: GlobalStudyDef = {
	slug: "story-feeding-five-thousand-es",
	kind: "story",
	language: "es",
	name: "La alimentación de los cinco mil",
	description:
		"Una multitud con hambre en una ladera, el almuerzo de un muchacho con cinco panes y dos peces, y doce cestas de sobras. Después Jesús le explica a esa misma multitud lo que el pan anunciaba, y muchos se alejan.",
	topic: "Jesús alimenta a cinco mil personas y luego enseña que él es el pan de vida (Juan 6).",
	length: 2,
	depth: 4,
	sortOrder: 142,
	coversWholeCanon: false,
	steps: [
		{
			title: "Una multitud en la ladera",
			content: {
				kind: "text",
				body:
					"Jesús había cruzado a la otra orilla del mar de Galilea, y una gran multitud lo siguió hasta allí, porque había visto las señales que hacía en los enfermos (Juan 6:1–2). Estaba cerca la Pascua, la fiesta que recordaba cómo Dios alimentó y liberó a su pueblo en el desierto (Juan 6:4).\n\n" +
					"Es el único milagro del ministerio de Jesús que cuentan los cuatro Evangelios (Mateo 14:13–21; Marcos 6:30–44; Lucas 9:10–17; Juan 6:1–14). Marcos añade por qué Jesús se detuvo a atenderlos: tuvo compasión de ellos, porque eran como ovejas que no tenían pastor (Marcos 6:34).",
			},
		},
		{
			book: "JHN",
			startChapter: 6,
			startVerse: 1,
			endVerse: 15,
			title: "Cinco panes y dos peces",
			explanation:
				"Fíjate en que Jesús le pregunta a Felipe dónde comprar pan sabiendo ya lo que va a hacer (6:5–6). Felipe hace las cuentas y le salen imposibles (6:7); Andrés encuentra a un muchacho con cinco panes de cebada y dos peces, y se pregunta de qué sirven para tantos (6:8–9). Observa lo que Jesús hace con ellos: da gracias, y todos comen cuanto quieren (6:11). Luego mira cómo responde la multitud y por qué Jesús se retira solo al monte (6:14–15).",
		},
		{
			title: "El milagro de los panes y los peces",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Brooklyn_Museum_-_The_Miracle_of_the_Loaves_and_Fishes_%28La_multiplication_des_pains%29_by_James_Tissot.jpg",
				alt: "Una acuarela de una gran multitud sentada en largas filas a lo largo de una ladera rocosa y cubierta de hierba, con personas que llevan cestas entre ellos.",
				caption:
					"Juan recuerda que había mucha hierba en aquel lugar, y que la gente se recostó, como cinco mil hombres (Juan 6:10). Tissot llena toda la ladera con ellos.",
				credit: "James Tissot, The Miracle of the Loaves and Fishes, de The Life of Our Lord Jesus Christ (1886–1894). Dominio público.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_The_Miracle_of_the_Loaves_and_Fishes_(La_multiplication_des_pains)_by_James_Tissot.jpg",
			},
		},
		{
			title: "Andrés",
			content: {
				kind: "character",
				entitySlug: "andrew_264",
				note:
					"Andrés, hermano de Simón Pedro (Juan 6:8), es quien lleva al muchacho y su almuerzo a Jesús. Es una costumbre suya: llevó a su hermano Simón a Jesús (Juan 1:40–42), y más tarde llevó a los griegos que querían ver a Jesús (Juan 12:20–22).",
			},
		},
		{
			book: "JHN",
			startChapter: 6,
			startVerse: 22,
			endVerse: 40,
			title: "Yo soy el pan de vida",
			explanation:
				"Esa noche los discípulos cruzaron el lago y Jesús fue a ellos caminando sobre el agua (6:16–21). Al día siguiente la multitud lo encuentra de nuevo, y él les dice claramente por qué vinieron: comieron el pan y se saciaron (6:26). Fíjate en cómo mencionan el maná que sus padres comieron en el desierto (6:31), y en cómo responde Jesús: \"Yo soy el pan de vida\" (6:35). Busca en el versículo 37 la promesa para todo el que viene a él.",
		},
		{
			book: "JHN",
			startChapter: 6,
			startVerse: 41,
			endVerse: 71,
			title: "Muchos vuelven atrás",
			explanation:
				"La multitud murmura: ¿no es este el hijo de José, cuyo padre y madre conocemos (6:42)? Jesús va más lejos y habla de comer su carne y beber su sangre (6:53–56), y hasta sus discípulos dicen que es una palabra dura (6:60). Muchos de ellos dejan de seguirlo (6:66). Entonces Jesús pregunta a los doce si también ellos quieren irse; escucha la respuesta de Pedro: \"Señor, ¿a quién iremos?\" (6:68).",
		},
		{
			title: "El pan en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"En el desierto, Dios hizo llover pan del cielo para Israel cada mañana, y lo llamaron maná (Éxodo 16:4, 15). Más tarde Moisés les explicó por qué: para que aprendieran que no solo de pan vive el hombre, sino de todo lo que sale de la boca del SEÑOR (Deuteronomio 8:3). Jesús citó esas palabras cuando él mismo tuvo hambre en el desierto (Mateo 4:4).\n\n" +
					"El profeta Eliseo alimentó una vez a cien hombres con veinte panes de cebada, y sobró (2 Reyes 4:42–44). Y Jesús enseñó a sus discípulos a pedirle al Padre: \"Danos hoy nuestro pan cotidiano\" (Mateo 6:11).",
			},
		},
		{
			title: "¿De qué tienes hambre?",
			content: {
				kind: "reflection",
				prompt:
					"La multitud volvió por más pan, y Jesús se ofreció a sí mismo. ¿De qué tienes hambre ahora mismo, y cómo sería llevarle esa hambre a él?",
			},
			anchor: { book: "JHN", chapter: 6, verse: 35 },
		},
	],
};
