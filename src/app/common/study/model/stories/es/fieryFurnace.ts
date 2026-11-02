import { GlobalStudyDef } from "../../globalStudy";

/** Daniel 3: tres jóvenes se niegan a inclinarse ante una estatua de oro. */
export const FIERY_FURNACE_ES: GlobalStudyDef = {
	slug: "story-fiery-furnace-es",
	kind: "story",
	language: "es",
	name: "El horno de fuego",
	description:
		"Un rey levanta una estatua de oro y ordena que todo el imperio se postre ante ella. Tres jóvenes de Judá se quedan de pie, y son arrojados a un horno tan caliente que mata a los soldados que los echan dentro.",
	topic: "Sadrac, Mesac y Abed-nego se niegan a adorar la estatua de oro de Nabucodonosor y son librados en el horno de fuego (Daniel 3).",
	length: 1,
	depth: 3,
	sortOrder: 135,
	coversWholeCanon: false,
	steps: [
		{
			title: "Exiliados en Babilonia",
			content: {
				kind: "text",
				body:
					"Nabucodonosor, rey de Babilonia, sitió Jerusalén y se llevó a jóvenes de las principales familias de Judá para que fueran preparados para servir en su corte (Daniel 1:1–4). Entre ellos estaban Daniel, Ananías, Misael y Azarías, a quienes se les dieron nombres babilonios: Ananías pasó a llamarse Sadrac; Misael, Mesac; y Azarías, Abed-nego (Daniel 1:6–7).\n\n" +
					"Desde el principio fueron fieles en las cosas pequeñas, y pidieron no comer la comida del rey (Daniel 1:8–12). Al final del capítulo 2, el rey había puesto a los tres amigos sobre los asuntos de la provincia de Babilonia (Daniel 2:49). El capítulo 3 pone a prueba esa fe en público.",
			},
		},
		{
			book: "DAN",
			startChapter: 3,
			startVerse: 1,
			endVerse: 12,
			title: "La estatua de oro",
			explanation:
				"Fíjate en el tamaño de la estatua (3:1) y en lo larga que es la lista de funcionarios (3:2–3): se convoca a todo el imperio. Observa cómo la orden y el castigo aparecen juntos en los versículos 5–6. Luego fíjate en quién presenta la acusación, y en cómo describen a los tres: hombres a quienes el propio rey había puesto al frente (3:12).",
		},
		{
			book: "DAN",
			startChapter: 3,
			startVerse: 13,
			endVerse: 18,
			title: "Y si no",
			explanation:
				"El rey les da una segunda oportunidad y pregunta qué dios podría librarlos de su mano (3:15). Lee despacio su respuesta (3:16–18). Fíjate en que dicen que Dios puede librarlos, y luego añaden: aunque no lo haga, no servirán a los dioses del rey.",
		},
		{
			title: "Sadrac",
			content: {
				kind: "character",
				entitySlug: "shadrach_1398",
				note:
					"Sadrac, Mesac y Abed-nego siempre aparecen juntos en Daniel. El nombre hebreo de Sadrac era Ananías (Daniel 1:7), y junto con Daniel y los otros dos fue hallado diez veces más sabio que todos los magos del reino (1:19–20).",
			},
		},
		{
			book: "DAN",
			startChapter: 3,
			startVerse: 19,
			endVerse: 25,
			title: "Al fuego",
			explanation:
				"El rostro del rey se demuda (3:19), y el horno se calienta siete veces más de lo acostumbrado. Fíjate en que las llamas matan a los hombres que los arrojan dentro (3:22). Luego observa cómo el rey se levanta de un salto: ve a cuatro hombres sueltos, paseándose en medio del fuego sin sufrir daño (3:24–25).",
		},
		{
			title: "Tres hombres en el horno",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/129.Shadrach%2C_Meshach_and_Abednego_in_the_Furnace.jpg/1280px-129.Shadrach%2C_Meshach_and_Abednego_in_the_Furnace.jpg",
				alt: "Un grabado de tres jóvenes de pie, tranquilos, dentro de la boca arqueada de un horno, con llamas y humo a sus pies, mientras la corte del rey mira desde una cornisa en lo alto.",
				caption:
					"Doré muestra a los tres de pie entre las llamas mientras la corte observa. Cuando salieron, ni un cabello de su cabeza se había quemado (Daniel 3:27).",
				credit: "Gustave Doré, Shadrach, Meshach and Abednego in the Furnace, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:129.Shadrach,_Meshach_and_Abednego_in_the_Furnace.jpg",
			},
		},
		{
			book: "DAN",
			startChapter: 3,
			startVerse: 26,
			endVerse: 30,
			title: "Ni siquiera olor a fuego",
			explanation:
				"El rey los llama \"siervos del alto Dios\" (3:26). Fíjate con cuánto cuidado los examinan los funcionarios: el cabello, los mantos, y ni siquiera olor a fuego (3:27). Luego escucha por qué los alaba el rey: confiaron en su Dios y entregaron sus cuerpos antes que adorar a otro dios que no fuera el suyo (3:28).",
		},
		{
			title: "Nabucodonosor",
			content: {
				kind: "character",
				entitySlug: "nebuchadnezzar_2167",
				note:
					"Nabucodonosor fue el rey de Babilonia que tomó Jerusalén y envió a su pueblo al exilio (2 Reyes 25:1–11). En Daniel, su actitud hacia el Dios de Israel va cambiando: aquí bendice al Dios de los tres jóvenes (Daniel 3:28), y para el capítulo 4 alaba al mismo Rey del cielo (Daniel 4:37).",
			},
		},
		{
			title: "Aunque no lo haga",
			content: {
				kind: "reflection",
				prompt:
					"Los tres amigos confiaban en que Dios podía salvarlos, y decidieron de antemano mantenerse fieles aunque no lo hiciera. ¿Cómo sería para ti tener esa clase de fe en algo que estás enfrentando ahora?",
			},
			anchor: { book: "DAN", chapter: 3, verse: 18 },
		},
	],
};
