import { GlobalStudyDef } from "../../globalStudy";

/** Génesis 22: la prueba de Abraham en el monte, en la tierra de Moriah. */
export const ABRAHAM_AND_ISAAC_ES: GlobalStudyDef = {
	slug: "story-abraham-and-isaac-es",
	kind: "story",
	language: "es",
	name: "Abraham e Isaac",
	description:
		"Dios le pide a Abraham el hijo que esperó toda una vida, y Abraham se levanta de madrugada y va. Lee uno de los capítulos más difíciles de la Biblia, y las palabras que un padre le dijo a su hijo mientras subían al monte: Dios proveerá.",
	topic: "La historia de la prueba de Dios a Abraham, Isaac en el monte y el carnero que Dios proveyó (Génesis 22).",
	length: 1,
	depth: 5,
	sortOrder: 108,
	coversWholeCanon: false,
	steps: [
		{
			title: "El hijo de la promesa",
			content: {
				kind: "text",
				body:
					"Abraham tenía cien años cuando nació Isaac (Génesis 21:5), y Dios le había dicho que en Isaac le sería llamada descendencia (Génesis 21:12). Todas las promesas que Dios le había hecho a Abraham dependían ahora de un solo muchacho.\n\n" +
					"Este es uno de los capítulos más difíciles de leer en la Biblia. Génesis te dice desde su primer versículo que Dios está probando a Abraham (Génesis 22:1), así que tú sabes algo que Abraham no sabe. Más adelante, la ley de Dios prohíbe los sacrificios de niños que practicaban las naciones vecinas de Israel (Deuteronomio 12:31), y por medio de Jeremías Dios dice que es algo que él nunca mandó, ni le vino al pensamiento (Jeremías 7:31).",
			},
		},
		{
			book: "GEN",
			startChapter: 22,
			startVerse: 1,
			endVerse: 8,
			title: "Dios proveerá",
			explanation:
				"Fíjate en cómo el mandato se detiene en lo que cuesta: \"tu hijo, tu único, Isaac, a quien amas\" (22:2). Abraham se levanta de madrugada y va (22:3). Observa lo que les dice a sus siervos: el muchacho y yo iremos a adorar y volveremos a ustedes (22:5). Luego viene la pregunta de Isaac, dónde está el cordero (22:7), y la respuesta de su padre: \"Dios se proveerá\" (22:8). Dos veces lees que los dos iban juntos (22:6, 8).",
		},
		{
			title: "Subiendo al monte",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/016.The_Testing_of_Abraham%27s_Faith.jpg/1280px-016.The_Testing_of_Abraham%27s_Faith.jpg",
				alt: "Un grabado de un muchacho que carga sobre los hombros un gran haz de leña cuesta arriba por una ladera rocosa, seguido por un anciano con barba, con un manto con capucha y un bastón, con palmeras y colinas lejanas detrás de ellos.",
				caption: "Abraham tomó la leña del holocausto y la puso sobre Isaac su hijo (Génesis 22:6).",
				credit: "Gustave Doré, The Testing of Abraham's Faith, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:016.The_Testing_of_Abraham%27s_Faith.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 22,
			startVerse: 9,
			endVerse: 19,
			title: "En el monte",
			explanation:
				"El texto es escueto en el peor momento (22:9–10), y también en el rescate: el ángel del SEÑOR llama a Abraham por su nombre dos veces (22:11). Fíjate en lo que mostró la prueba: \"ya conozco que temes a Dios\" (22:12). Busca el carnero trabado por los cuernos en un zarzal (22:13) y el nombre que Abraham le da al lugar: \"El SEÑOR proveerá\" (22:14). Luego Dios renueva cada promesa con un juramento, jurando por sí mismo (22:16–18).",
		},
		{
			title: "Isaac",
			content: {
				kind: "character",
				entitySlug: "isaac_616",
				note:
					"Isaac es el hijo que Dios prometió a Abraham y Sara mucho después de que ya no podían tener hijos (Génesis 18:10–11; 21:2). En este capítulo carga la leña y hace la pregunta (22:6–7). Más tarde se casa con Rebeca y la ama (24:67), y llega a ser padre de Esaú y Jacob (25:25–26). Pablo les dice a los creyentes que ellos, como Isaac, son hijos de la promesa (Gálatas 4:28).",
			},
		},
		{
			title: "Abraham e Isaac en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Hebreos dice que Abraham ofreció a Isaac por la fe, pensando que Dios era poderoso para levantarlo aun de entre los muertos (Hebreos 11:17–19). Santiago señala ese mismo momento como una fe que se demuestra con obras (Santiago 2:21–23).\n\n" +
					"Generaciones después, Salomón edificó el templo de Jerusalén en el monte Moriah (2 Crónicas 3:1), y a Abraham se le había dicho que fuera a \"tierra de Moriah\" (Génesis 22:2). El ángel le dijo a Abraham que no le había rehusado a su hijo, su único (Génesis 22:12). Pablo escribe de Dios que no escatimó ni a su propio Hijo, sino que lo entregó por todos nosotros (Romanos 8:32).",
			},
		},
		{
			title: "El SEÑOR proveerá",
			content: {
				kind: "reflection",
				prompt:
					"Abraham le dijo a su hijo que Dios proveería antes de poder ver cómo. ¿En qué necesitas confiar en que Dios proveerá, antes de poder ver cómo lo hará?",
			},
			anchor: { book: "GEN", chapter: 22, verse: 14 },
		},
	],
};
