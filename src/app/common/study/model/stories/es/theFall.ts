import { GlobalStudyDef } from "../../globalStudy";

/** Génesis 3: la serpiente, el fruto y la salida del Edén. */
export const THE_FALL_ES: GlobalStudyDef = {
	slug: "story-the-fall-es",
	kind: "story",
	language: "es",
	name: "Adán, Eva y la caída",
	description:
		"Un huerto lleno de cosas buenas, y un solo árbol que Dios les pidió no tocar. Lee cómo se rompió la confianza, cómo Dios salió a buscar a quienes se escondían de él y la promesa que hizo cuando salían del Edén.",
	topic: "La historia de la serpiente, el primer pecado y la salida de Adán y Eva del huerto del Edén (Génesis 3).",
	length: 1,
	depth: 4,
	sortOrder: 102,
	coversWholeCanon: false,
	steps: [
		{
			title: "Un huerto y un mandato",
			content: {
				kind: "text",
				body:
					"Génesis 2 termina con el hombre y la mujer en un huerto que Dios plantó para ellos (Génesis 2:8). Pueden comer de todos sus árboles menos de uno, el árbol de la ciencia del bien y del mal, y Dios les advierte que el día que coman de él morirán (Génesis 2:16–17). Están desnudos y no se avergüenzan (Génesis 2:25): no hay nada oculto, ni entre ellos ni ante Dios.\n\n" +
					"Entonces entra en la historia una voz nueva. Génesis presenta a la serpiente como más astuta que todos los animales del campo que el SEÑOR Dios había hecho (Génesis 3:1).",
			},
		},
		{
			book: "GEN",
			startChapter: 3,
			startVerse: 1,
			endVerse: 7,
			title: "La pregunta de la serpiente",
			explanation:
				"Fíjate en que la serpiente empieza con una pregunta que tuerce lo que Dios dijo: ¿de veras Dios les prohibió comer de todo árbol (3:1)? Dios les había dado todos los árboles menos uno (2:16–17). Luego viene una contradicción directa: \"No moriréis\" (3:4). Observa lo que la mujer ve en el fruto (3:6) y lo que ven los dos cuando se les abren los ojos: solo que están desnudos (3:7).",
		},
		{
			book: "GEN",
			startChapter: 3,
			startVerse: 8,
			endVerse: 13,
			title: "¿Dónde estás?",
			explanation:
				"El SEÑOR Dios se pasea por el huerto, y el hombre y la mujer se esconden entre los árboles (3:8). Fíjate en que las primeras palabras de Dios para ellos son una pregunta: \"¿Dónde estás tú?\" (3:9). Luego observa cómo se pasa la culpa: el hombre culpa a \"la mujer que me diste por compañera\" (3:12), y la mujer culpa a la serpiente (3:13).",
		},
		{
			title: "Eva",
			content: {
				kind: "character",
				entitySlug: "eve_1231",
				note:
					"Eva es la primera mujer, hecha por Dios del costado del hombre (Génesis 2:21–22). Después de la caída, Adán la llama Eva, porque ella sería la madre de todos los vivientes (3:20), y cuando nace su primer hijo dice que ha adquirido varón con la ayuda del SEÑOR (4:1).",
			},
		},
		{
			book: "GEN",
			startChapter: 3,
			startVerse: 14,
			endVerse: 24,
			title: "Consecuencias, y una promesa",
			explanation:
				"Fíjate en lo que Dios maldice: la serpiente (3:14) y la tierra (3:17), no al hombre ni a la mujer, aunque el dolor y la fatiga marcan ahora su vida (3:16–19). En el versículo 15 Dios dice que la simiente de la mujer herirá a la serpiente en la cabeza; muchos cristianos han leído aquí la primera promesa de un salvador. Observa también lo que Dios hace antes de echarlos: les hace túnicas de pieles y los viste (3:21).",
		},
		{
			title: "Expulsados del Edén",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/003.Adam_and_Eve_Are_Driven_out_of_Eden.jpg/1280px-003.Adam_and_Eve_Are_Driven_out_of_Eden.jpg",
				alt: "Un grabado de un ángel con una espada, de pie en un haz de luz entre los árboles, mientras un hombre y una mujer se alejan con la cabeza inclinada, ella apoyada en él.",
				caption:
					"Dios sacó al hombre del huerto y puso querubines y una espada encendida para guardar el camino del árbol de la vida (Génesis 3:23–24).",
				credit: "Gustave Doré, Adam and Eve Are Driven out of Eden, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:003.Adam_and_Eve_Are_Driven_out_of_Eden.jpg",
			},
		},
		{
			title: "La caída en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Pablo lee toda la historia humana a través de este capítulo: el pecado entró en el mundo por un hombre, y por el pecado la muerte (Romanos 5:12). Pero pone a Cristo frente a Adán: así como por la desobediencia de un hombre muchos fueron hechos pecadores, así por la obediencia de uno muchos serán hechos justos (Romanos 5:19).\n\n" +
					"Al final de la Biblia, la serpiente recibe nombre: \"la serpiente antigua\", el diablo y Satanás (Apocalipsis 12:9), y Pablo promete que el Dios de paz pronto aplastará a Satanás bajo los pies de los creyentes (Romanos 16:20). El árbol de la vida, custodiado al final de Génesis 3, vuelve a estar abierto en el último capítulo de la Biblia, donde ya no habrá más maldición (Apocalipsis 22:2–3).",
			},
		},
		{
			title: "¿Dónde estás?",
			content: {
				kind: "reflection",
				prompt:
					"Cuando el hombre y la mujer se escondieron, Dios salió a buscarlos y preguntó: \"¿Dónde estás tú?\". Si Dios te hiciera hoy esa pregunta, ¿cuál sería tu respuesta sincera?",
			},
			anchor: { book: "GEN", chapter: 3, verse: 9 },
		},
	],
};
