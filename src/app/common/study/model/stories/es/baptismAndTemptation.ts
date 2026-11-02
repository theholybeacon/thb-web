import { GlobalStudyDef } from "../../globalStudy";

/** Mateo 3–4: Jesús es bautizado por Juan, probado en el desierto, y comienza a predicar. */
export const BAPTISM_AND_TEMPTATION_ES: GlobalStudyDef = {
	slug: "story-baptism-and-temptation-es",
	kind: "story",
	language: "es",
	name: "El bautismo y la tentación de Jesús",
	description:
		"Una voz del cielo llama a Jesús su Hijo amado, y enseguida él es llevado al desierto para ser probado. Lee cómo comenzó la vida pública de Jesús: en el río con Juan, a solas en el desierto, y en la orilla del mar llamando a sus primeros seguidores.",
	topic: "La predicación de Juan el Bautista, el bautismo de Jesús, su tentación en el desierto y el comienzo de su ministerio en Galilea (Mateo 3–4).",
	length: 2,
	depth: 4,
	sortOrder: 139,
	coversWholeCanon: false,
	steps: [
		{
			title: "Una voz en el desierto",
			content: {
				kind: "text",
				body:
					"Mateo pasa de la niñez de Jesús en Nazaret (Mateo 2:23) directamente al día en que vino de Galilea al río Jordán (Mateo 3:13). Lucas dice que tenía unos treinta años cuando comenzó su obra (Lucas 3:23).\n\n" +
					"Primero aparece Juan, hijo del sacerdote Zacarías y de su esposa Elisabet, que lo tuvieron en su vejez (Lucas 1:5–7, 1:13). Elisabet era parienta de María, la madre de Jesús (Lucas 1:36). Mateo lo presenta con palabras de Isaías sobre una voz que clama en el desierto: preparad el camino del Señor (Mateo 3:3; Isaías 40:3).",
			},
		},
		{
			book: "MAT",
			startChapter: 3,
			startVerse: 1,
			endVerse: 12,
			title: "Juan el Bautista",
			explanation:
				"Fíjate en el mensaje de Juan en una sola frase: arrepentíos, porque el reino de los cielos se ha acercado (3:2). Observa a las multitudes que vienen de Jerusalén y de toda Judea confesando sus pecados (3:5–6), y con qué dureza habla a los líderes religiosos (3:7–10). Luego fíjate en quién dice Juan que viene después de él: alguien tan superior que Juan no es digno de llevarle el calzado (3:11).",
		},
		{
			title: "Juan el Bautista",
			content: {
				kind: "character",
				entitySlug: "john_1676",
				note:
					"Juan vivía en el desierto, se vestía de pelo de camello y comía langostas y miel silvestre (Mateo 3:4). Más tarde Jesús dijo que entre los nacidos de mujer no se había levantado otro mayor que Juan (Mateo 11:11).",
			},
		},
		{
			book: "MAT",
			startChapter: 3,
			startVerse: 13,
			endVerse: 17,
			title: "El bautismo de Jesús",
			explanation:
				"Fíjate en la objeción de Juan: dice que es él quien necesita ser bautizado por Jesús (3:14). Escucha la respuesta de Jesús sobre cumplir toda justicia (3:15). Luego observa las tres cosas que suceden cuando sube del agua: los cielos se abren, el Espíritu de Dios desciende como paloma y una voz habla (3:16–17).",
		},
		{
			title: "Juan bautiza a Jesús",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/3/34/Gustave_Dore_-_John_the_Baptist_baptizes_Jesus.jpg",
				alt: "Un grabado de Jesús de pie en un río, con el agua hasta las rodillas y un paño en la cintura, mientras Juan, vestido con pieles, levanta la mano a su lado; arriba aparece una paloma en un rayo de luz, y desde la orilla mira la gente.",
				caption:
					"Doré muestra al Espíritu descendiendo como paloma (Mateo 3:16), mientras una voz del cielo llama a Jesús su Hijo amado, en quien tiene complacencia (Mateo 3:17).",
				credit: "Gustave Doré, The Baptism of Jesus, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Gustave_Dore_-_John_the_Baptist_baptizes_Jesus.jpg",
			},
		},
		{
			book: "MAT",
			startChapter: 4,
			startVerse: 1,
			endVerse: 11,
			title: "Probado en el desierto",
			explanation:
				"Fíjate en quién lleva a Jesús al desierto: el Espíritu (4:1). Después de cuarenta días de ayuno, tiene hambre (4:2). Escucha cómo el diablo empieza dos veces: \"Si eres Hijo de Dios\" (4:3, 4:6), justo después de que la voz del cielo ha dicho que lo es. Cada vez, Jesús responde con la Escritura, y el diablo hasta le cita un salmo (4:6).",
		},
		{
			title: "Jesús tentado en el desierto",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Brooklyn_Museum_-_Jesus_Tempted_in_the_Wilderness_%28J%C3%A9sus_tent%C3%A9_dans_le_d%C3%A9sert%29_-_James_Tissot_-_overall.jpg",
				alt: "Una pintura de Jesús con túnica blanca, de pie a la entrada de una cueva, mientras afuera una figura arrodillada le ofrece dos piedras; más allá se extienden un valle desértico y una franja de agua.",
				caption:
					"Tissot pinta la primera prueba: el diablo sostiene unas piedras y le dice a Jesús que las convierta en pan (Mateo 4:3).",
				credit: "James Tissot, Jesus Tempted in the Wilderness (1886–1894), Brooklyn Museum. Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Jesus_Tempted_in_the_Wilderness_(J%C3%A9sus_tent%C3%A9_dans_le_d%C3%A9sert)_-_James_Tissot_-_overall.jpg",
			},
		},
		{
			title: "Tres respuestas del Deuteronomio",
			content: {
				kind: "text",
				body:
					"Las tres respuestas de Jesús vienen del libro del Deuteronomio: que no solo de pan vivirá el hombre (Deuteronomio 8:3), que no tentarás al Señor tu Dios (Deuteronomio 6:16), y que al Señor tu Dios adorarás y a él solo servirás (Deuteronomio 6:13).\n\n" +
					"En el Deuteronomio, Moisés dijo esas palabras a Israel acerca de sus cuarenta años en el desierto, cuando Dios los guio y los probó (Deuteronomio 8:2). Jesús, cuarenta días en el desierto, se aferra a esas mismas palabras. La carta a los Hebreos dice que fue tentado en todo según nuestra semejanza, pero sin pecado (Hebreos 4:15).",
			},
		},
		{
			book: "MAT",
			startChapter: 4,
			startVerse: 12,
			endVerse: 25,
			title: "Venid en pos de mí",
			explanation:
				"Fíjate en las primeras palabras de la predicación de Jesús (4:17): son las mismas que las de Juan (3:2). Observa cómo responden los primeros discípulos a su llamado: Pedro y Andrés dejan las redes \"luego\", es decir, al instante (4:20), y Jacobo y Juan dejan la barca y a su padre (4:22). El capítulo termina con multitudes que llegan de todas partes (4:25).",
		},
		{
			title: "No solo de pan",
			content: {
				kind: "reflection",
				prompt:
					"Jesús respondió a cada tentación con palabras de la Escritura que sabía de memoria. ¿Qué tentación enfrentas más a menudo, y qué palabra de Dios te gustaría tener lista para ella?",
			},
			anchor: { book: "MAT", chapter: 4, verse: 4 },
		},
	],
};
