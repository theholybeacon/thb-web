import { GlobalStudyDef } from "../../globalStudy";

/** Génesis 1–2: los seis días, el séptimo día y el huerto. */
export const CREATION_ES: GlobalStudyDef = {
	slug: "story-creation-es",
	kind: "story",
	language: "es",
	name: "La creación",
	description:
		"Antes que todo lo demás está Dios, y Dios habla. Lee las primeras páginas de la Biblia: la luz que sale de las tinieblas, un mundo que Dios llama bueno en gran manera, y un hombre y una mujer hechos a su imagen.",
	topic: "La historia de la creación, del primer día al séptimo, y la formación del hombre y la mujer en el huerto del Edén (Génesis 1–2).",
	length: 2,
	depth: 4,
	sortOrder: 101,
	coversWholeCanon: false,
	steps: [
		{
			title: "En el principio",
			content: {
				kind: "text",
				body:
					"La Biblia comienza cuando todavía no hay nada que contar, excepto a Dios: \"En el principio crió Dios los cielos y la tierra\" (Génesis 1:1). La tierra está desordenada y vacía, las tinieblas cubren el abismo y el Espíritu de Dios se mueve sobre las aguas (Génesis 1:2).\n\n" +
					"Génesis cuenta la creación dos veces. El capítulo 1 la narra día por día, desde la luz hasta el séptimo día de descanso. El capítulo 2 vuelve a empezar con \"los cielos y la tierra\" (Génesis 2:4) y se acerca: un huerto, un hombre, una mujer. Léelos uno junto al otro y deja que cada uno complete lo que el otro no dice.",
			},
		},
		{
			book: "GEN",
			startChapter: 1,
			title: "Seis días, y todo era bueno",
			explanation:
				"Presta atención a las frases que se repiten: \"Y dijo Dios\", \"y fue así\" y \"vio Dios que era bueno\" (1:4, 10, 12, 18, 21, 25). Fíjate cómo los días se responden entre sí: la luz el primer día y las lumbreras del cielo el cuarto; el mar y el cielo el segundo, y los peces y las aves el quinto; la tierra seca el tercero, y los animales terrestres el sexto. Solo el ser humano es creado a imagen de Dios, varón y hembra (1:27), y solo después de crearlo Dios llama a todo \"bueno en gran manera\" (1:31).",
		},
		{
			title: "Sea la luz",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/001.The_Creation_of_Light.jpg/1280px-001.The_Creation_of_Light.jpg",
				alt: "Un grabado de rayos de luz que atraviesan densas nubes sobre un paisaje oscuro y vacío y unas aguas en calma.",
				caption:
					"Lo primero que Dios dice en la Biblia es \"Sea la luz\", y fue la luz (Génesis 1:3). Doré todavía no muestra personas ni animales: solo la luz que irrumpe sobre el abismo.",
				credit: "Gustave Doré, The Creation of Light, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:001.The_Creation_of_Light.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 2,
			startVerse: 1,
			endVerse: 17,
			title: "El séptimo día y el huerto",
			explanation:
				"La semana termina con descanso: Dios acaba su obra, reposa el séptimo día, lo bendice y lo santifica (2:2–3). Luego observa lo cerca que llega la historia: el SEÑOR Dios forma al hombre del polvo de la tierra y sopla en su nariz aliento de vida (2:7). Planta un huerto, pone allí al hombre para que lo labre y lo guarde (2:15) y le da un solo mandato acerca de un solo árbol (2:16–17).",
		},
		{
			title: "Adán",
			content: {
				kind: "character",
				entitySlug: "adam_78",
				note:
					"Adán es el primer hombre, formado del polvo y vivificado por el aliento mismo de Dios (Génesis 2:7). Pone nombre a los animales (2:19–20) y es la primera persona cuyas palabras registra la Biblia (2:23). Más tarde Pablo lo pone junto a Cristo: \"así como en Adán todos mueren, así también en Cristo todos serán vivificados\" (1 Corintios 15:22).",
			},
		},
		{
			book: "GEN",
			startChapter: 2,
			startVerse: 18,
			endVerse: 25,
			title: "No es bueno que esté solo",
			explanation:
				"Después de todo un capítulo de cosas \"buenas\", aquí está lo primero que Dios llama \"no bueno\": que el hombre esté solo (2:18). Fíjate en que ninguno de los animales a los que el hombre pone nombre es la ayuda que necesita (2:20). Cuando Dios le trae a la mujer, las primeras palabras registradas del hombre son un poema de reconocimiento: \"hueso de mis huesos, y carne de mi carne\" (2:23). El capítulo termina en paz: estaban desnudos y no se avergonzaban (2:25).",
		},
		{
			title: "La creación en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"El resto de las Escrituras vuelve una y otra vez a estos capítulos. Un salmo contempla la luna y las estrellas que Dios formó y se pregunta por qué se interesa siquiera en el ser humano (Salmo 8:3–4). Cuando le preguntan a Jesús sobre el matrimonio, responde uniendo Génesis 1:27 y 2:24: Dios los hizo varón y hembra, y los dos serán una sola carne (Mateo 19:4–6).\n\n" +
					"Juan comienza su Evangelio con las mismas palabras que Génesis, \"En el principio\", y dice que todas las cosas fueron hechas por el Verbo (Juan 1:1–3). Y la Biblia termina donde empezó, con un cielo nuevo y una tierra nueva (Apocalipsis 21:1) y con el árbol de la vida, que creció primero en el Edén (Génesis 2:9), junto al río de la ciudad de Dios (Apocalipsis 22:1–2).",
			},
		},
		{
			title: "Hechos a su imagen",
			content: {
				kind: "reflection",
				prompt:
					"Dios hizo al ser humano a su propia imagen y llamó bueno en gran manera a todo lo que había hecho. Si lo tomaras en serio, ¿qué cambiaría en la forma en que te ves a ti mismo y a las personas que te rodean?",
			},
			anchor: { book: "GEN", chapter: 1, verse: 27 },
		},
	],
};
