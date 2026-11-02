import { GlobalStudyDef } from "../../globalStudy";

/** Génesis 12 y 15: el llamado, la partida y el pacto bajo las estrellas. */
export const CALL_OF_ABRAHAM_ES: GlobalStudyDef = {
	slug: "story-call-of-abraham-es",
	kind: "story",
	language: "es",
	name: "El llamado de Abraham",
	description:
		"Dios le pide a un hombre de setenta y cinco años, sin hijos, que deje su tierra por una que no ha visto, y le promete bendecir al mundo entero por medio de él. Lee cómo Abram se puso en camino, tropezó y fue sacado afuera a contar las estrellas.",
	topic: "La historia del llamado y la promesa de Dios a Abram, y del pacto que Dios hizo con él (Génesis 12 y 15).",
	length: 2,
	depth: 4,
	sortOrder: 106,
	coversWholeCanon: false,
	steps: [
		{
			title: "Una familia que se quedó a mitad de camino",
			content: {
				kind: "text",
				body:
					"Taré, el padre de Abram, salió de Ur de los caldeos con su familia para ir a la tierra de Canaán, pero se detuvieron en Harán y se quedaron a vivir allí (Génesis 11:31). Sarai, la esposa de Abram, era estéril; no tenía hijos (Génesis 11:30). Esteban, al volver a contar la historia siglos después, dice que Dios ya se le había aparecido a Abraham en Mesopotamia, antes de que viviera en Harán (Hechos 7:2).\n\n" +
					"Todo lo que sigue en la historia bíblica de Israel descansa sobre una promesa hecha a esta pareja sin hijos.",
			},
		},
		{
			book: "GEN",
			startChapter: 12,
			startVerse: 1,
			endVerse: 9,
			title: "Ve a la tierra que te mostraré",
			explanation:
				"Fíjate en que Dios nombra lo que Abram debe dejar (su tierra, su parentela, la casa de su padre), pero no adónde va: solo \"a la tierra que te mostraré\" (12:1). Cuenta cuántas cosas dice Dios que hará en los versículos 2–3, y mira cómo la promesa va más allá de Abram hasta todas las familias de la tierra (12:3). Abram tiene setenta y cinco años cuando sale (12:4), y dondequiera que se detiene, edifica un altar al SEÑOR (12:7–8).",
		},
		{
			title: "Abram se pone en camino",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/011.Abraham_Goes_to_the_Land_of_Canaan.jpg/1280px-011.Abraham_Goes_to_the_Land_of_Canaan.jpg",
				alt: "Un grabado de una larga caravana de ovejas, camellos y personas a pie que cruza campo abierto bajo un cielo de atardecer, con un jinete vestido con túnica sobre un camello en primer plano.",
				caption:
					"Abram tomó a Sarai su mujer, a Lot su sobrino y todos los bienes y las personas que habían reunido, y salió rumbo a la tierra de Canaán (Génesis 12:5).",
				credit: "Gustave Doré, Abraham Goes to the Land of Canaan, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:011.Abraham_Goes_to_the_Land_of_Canaan.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 12,
			startVerse: 10,
			endVerse: 20,
			title: "Un desvío a Egipto",
			explanation:
				"Justo después de la promesa llega un hambre, y Abram desciende a Egipto (12:10). Fíjate en su miedo: le pide a Sarai que diga que es su hermana, para que a él le vaya bien (12:11–13), y Faraón la lleva a su casa (12:15). Años después volverá a hacer lo mismo (20:2). Observa quién protege a Sarai: el SEÑOR hiere la casa de Faraón con grandes plagas (12:17).",
		},
		{
			title: "Abraham",
			content: {
				kind: "character",
				entitySlug: "abraham_58",
				note:
					"Más adelante Abram recibe el nombre de Abraham, porque Dios lo ha puesto por padre de muchedumbre de naciones (Génesis 17:5). Tres veces las Escrituras lo llaman amigo de Dios (2 Crónicas 20:7; Isaías 41:8; Santiago 2:23), y Hebreos recuerda que por la fe salió sin saber adónde iba (Hebreos 11:8).",
			},
		},
		{
			book: "GEN",
			startChapter: 15,
			title: "Cuenta las estrellas",
			explanation:
				"Entre los capítulos 12 y 15, Lot se separa de Abram (13:11) y Abram lo rescata del cautiverio (14:14–16). Fíjate en que las primeras palabras de Abram a Dios que se registran son una queja sincera: ¿qué me darás, si sigo sin hijos (15:2)? Dios lo saca afuera a contar las estrellas (15:5), y luego viene el versículo 6: Abram creyó al SEÑOR, y le fue contado por justicia. Después observa la extraña ceremonia del pacto: mientras Abram duerme, un horno humeante y una antorcha de fuego pasan por entre los animales partidos (15:17).",
		},
		{
			title: "Las promesas de Dios a Abram",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Tissot_God%27s_Promises_to_Abram.jpg",
				alt: "Una pintura de un hombre con un manto a rayas, tendido boca abajo sobre el suelo estampado de una tienda, mientras un haz de luz cae a su lado.",
				caption:
					"La palabra del SEÑOR vino a Abram en visión: \"No temas, Abram; yo soy tu escudo\" (Génesis 15:1).",
				credit: "James Tissot, God's Promises to Abram (c. 1896–1902). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Tissot_God%27s_Promises_to_Abram.jpg",
			},
		},
		{
			title: "Sara",
			content: {
				kind: "character",
				entitySlug: "sarah_2473",
				note:
					"Sarai, que después recibe el nombre de Sara (Génesis 17:15), acompaña a Abram desde el principio (12:5), y durante la mayor parte de la historia no tiene hijos (11:30). Cuando oye que tendrá un hijo en su vejez, se ríe (18:12); cuando nace Isaac, dice que Dios la ha hecho reír (21:6). Isaías le dice a Israel que mire a Abraham su padre y a Sara que los dio a luz (Isaías 51:2).",
			},
		},
		{
			title: "Abraham en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Génesis 15:6 es uno de los versículos que el Nuevo Testamento cita con más frecuencia. Pablo lo usa para mostrar que las personas son justificadas delante de Dios por la fe (Romanos 4:3; Gálatas 3:6), y Santiago también lo cita (Santiago 2:23). Pablo incluso llama a la promesa de Dios en Génesis 12:3 el evangelio anunciado de antemano a Abraham (Gálatas 3:8).\n\n" +
					"El Nuevo Testamento comienza llamando a Jesús \"hijo de David, hijo de Abraham\" (Mateo 1:1). Y Pablo les dice a los creyentes de todas las naciones que, si son de Cristo, son linaje de Abraham, herederos conforme a la promesa (Gálatas 3:29).",
			},
		},
		{
			title: "Creer una promesa",
			content: {
				kind: "reflection",
				prompt:
					"Abram miró las estrellas y creyó una promesa que todavía no podía ver. ¿Qué promesa de Dios te cuesta más creer en este momento, y por qué?",
			},
			anchor: { book: "GEN", chapter: 15, verse: 6 },
		},
	],
};
