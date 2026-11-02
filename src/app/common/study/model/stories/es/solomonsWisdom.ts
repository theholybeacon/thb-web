import { GlobalStudyDef } from "../../globalStudy";

/** 1 Reyes 3: el sueño de Salomón en Gabaón y el juicio entre dos madres. */
export const SOLOMONS_WISDOM_ES: GlobalStudyDef = {
	slug: "story-solomons-wisdom-es",
	kind: "story",
	language: "es",
	name: "La sabiduría de Salomón",
	description:
		"Dios le dice a un joven rey que le pida lo que quiera, y Salomón pide sabiduría para gobernar bien. Lee su petición, la respuesta de Dios y el caso de dos madres y un solo bebé, que mostró a todo Israel cómo era esa sabiduría.",
	topic: "El sueño de Salomón en Gabaón y su juicio entre dos mujeres que reclamaban al mismo niño (1 Reyes 3).",
	length: 1,
	depth: 3,
	sortOrder: 130,
	coversWholeCanon: false,
	steps: [
		{
			title: "Un joven rey en el trono de David",
			content: {
				kind: "text",
				body:
					"Salomón era hijo de David y Betsabé (2 Samuel 12:24). Cuando David murió, Salomón se sentó en el trono de su padre, y su reino quedó firmemente establecido (1 Reyes 2:10–12). Antes de morir, David le encargó andar en los caminos de Dios y guardar sus mandamientos (1 Reyes 2:2–3).\n\n" +
					"El primer libro de Reyes es honesto con el joven rey desde el principio: Salomón amaba al SEÑOR y andaba en los caminos de su padre David, salvo que ofrecía sacrificios en los lugares altos (1 Reyes 3:3), y emparentó con Faraón, rey de Egipto, por medio de un matrimonio (1 Reyes 3:1).",
			},
		},
		{
			book: "1KI",
			startChapter: 3,
			startVerse: 1,
			endVerse: 15,
			title: "El sueño en Gabaón",
			explanation:
				"Después de que Salomón ofrece mil holocaustos en Gabaón, el SEÑOR se le aparece en sueños y lo invita a pedir lo que quiera (3:4–5). Fíjate en cómo se ve Salomón a sí mismo: como un niño pequeño que no sabe cómo salir ni entrar (3:7). Presta atención a lo que pide en el versículo 9, un corazón capaz de juzgar al pueblo y de distinguir entre lo bueno y lo malo, y a cómo Dios le responde con más de lo que pidió (3:11–13).",
		},
		{
			title: "Salomón",
			content: {
				kind: "character",
				entitySlug: "solomon_2762",
				note:
					"Salomón edificó el templo en Jerusalén (1 Reyes 6:14), y Dios le dio una sabiduría mayor que la de todos los sabios de Oriente y de Egipto (4:29–30). El mismo libro cuenta con franqueza que, cuando envejeció, sus muchas mujeres inclinaron su corazón tras otros dioses (11:4).",
			},
		},
		{
			book: "1KI",
			startChapter: 3,
			startVerse: 16,
			endVerse: 28,
			title: "Dos madres y un solo niño",
			explanation:
				"Dos mujeres se presentan ante el rey, cada una afirmando que el bebé vivo es suyo, y no hay ningún testigo (3:17–22). Fíjate en que Salomón primero repite las dos versiones (3:23) y luego pide una espada (3:24). Presta atención a lo que delata a la verdadera madre en el versículo 26: su compasión por su hijo. El último versículo te dice lo que vio el pueblo: la sabiduría de Dios estaba en él para hacer justicia (3:28).",
		},
		{
			title: "El juicio de Salomón",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/084.The_Judgment_of_Solomon.jpg/1280px-084.The_Judgment_of_Solomon.jpg",
				alt: "Un grabado de un rey de pie ante su trono con un brazo levantado, mientras un soldado sostiene en alto a un bebé con una mano y una espada con la otra, y una mujer arrodillada a sus pies extiende los brazos hacia arriba; una segunda mujer permanece apartada a la izquierda.",
				caption:
					"La verdadera madre le rogó al rey que le diera el bebé a la otra mujer antes que matarlo (1 Reyes 3:26).",
				credit: "Gustave Doré, The Judgment of Solomon, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:084.The_Judgment_of_Solomon.jpg",
			},
		},
		{
			title: "La sabiduría de Salomón",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Tissot_The_Wisdom_of_Solomon.jpg",
				alt: "Una pintura de un rey en un trono, en una sala con columnas, inclinado hacia una mujer arrodillada con túnica azul que extiende los brazos, mientras a su lado un soldado sostiene en alto a un niño pequeño y levanta una espada, y una multitud observa desde atrás.",
				caption:
					"Todo Israel oyó del juicio que había dado el rey, y le tuvieron temor (1 Reyes 3:28).",
				credit: "James Tissot, The Wisdom of Solomon (c. 1896). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Tissot_The_Wisdom_of_Solomon.jpg",
			},
		},
		{
			title: "La sabiduría de Salomón en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"La sabiduría de Salomón se hizo famosa: compuso tres mil proverbios, y venía gente de todas las naciones para escucharlo (1 Reyes 4:32–34). La reina de Sabá viajó para ponerlo a prueba con preguntas difíciles y volvió a su tierra asombrada (1 Reyes 10:1–7). El libro de Proverbios comienza con su nombre (Proverbios 1:1) y enseña que el temor del SEÑOR es el principio de la sabiduría (Proverbios 9:10).\n\n" +
					"Jesús mencionó el viaje de esa reina y dijo que ahora había allí alguien mayor que Salomón (Mateo 12:42). Y Santiago repite la invitación que recibió Salomón: si a alguno le falta sabiduría, pídala a Dios, que da a todos con abundancia (Santiago 1:5).",
			},
		},
		{
			title: "¿Qué pedirías tú?",
			content: {
				kind: "reflection",
				prompt:
					"Cuando se le ofreció todo lo que quisiera, Salomón pidió un corazón entendido para servir bien al pueblo (1 Reyes 3:9). Si Dios te preguntara qué quieres que te dé, ¿qué le pedirías, y por qué?",
			},
			anchor: { book: "1KI", chapter: 3, verse: 9 },
		},
	],
};
