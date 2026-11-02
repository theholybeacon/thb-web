import { GlobalStudyDef } from "../../globalStudy";

/** Ester: una reina judía en la corte persa y el complot contra su pueblo. */
export const ESTHER_ES: GlobalStudyDef = {
	slug: "story-esther-es",
	kind: "story",
	language: "es",
	name: "Ester",
	description:
		"Una huérfana en el exilio llega a ser reina de Persia y guarda silencio sobre quién es, hasta que un hombre poderoso planea destruir a su pueblo. Lee cómo el valor de una mujer y la noche en vela de un rey cambian el rumbo de la historia.",
	topic: "La historia de la reina Ester, su primo Mardoqueo y el complot de Amán contra los judíos, contada a lo largo del libro de Ester (Ester 2–10).",
	length: 3,
	depth: 4,
	sortOrder: 133,
	coversWholeCanon: false,
	steps: [
		{
			title: "Un palacio en Susa",
			content: {
				kind: "text",
				body:
					"La historia ocurre en Susa, donde el rey Asuero de Persia tenía su trono y gobernaba ciento veintisiete provincias, desde la India hasta Etiopía (Ester 1:1–3). Muchos judíos vivían ahora en ese imperio, lejos de Jerusalén. Uno de ellos, Mardoqueo, venía de una familia que Nabucodonosor, rey de Babilonia, había llevado cautiva desde Jerusalén (Ester 2:5–6).\n\n" +
					"El capítulo 1 prepara la escena. Al final de un gran banquete, el rey mandó llamar a la reina Vasti para lucir su belleza, y ella se negó a ir (Ester 1:11–12). Por consejo de sus asesores, la quitó de su lugar de reina y buscó otra (Ester 1:19; 2:2–4). Ahí es donde entra Ester.",
			},
		},
		{
			book: "EST",
			startChapter: 2,
			title: "Ester llega a ser reina",
			explanation:
				"Fíjate en quién es Ester: una huérfana criada por su primo Mardoqueo (2:7), quien le pide que no revele cuál es su pueblo (2:10). Luego observa la breve escena al final del capítulo: Mardoqueo descubre un complot contra el rey, y queda escrito en las crónicas reales (2:21–23). Parece un detalle menor. Tenlo presente.",
		},
		{
			title: "Ester",
			content: {
				kind: "character",
				entitySlug: "esther_1343",
				note:
					"El nombre hebreo de Ester era Hadasa, y había perdido a su padre y a su madre (Ester 2:7). Se ganaba el favor de todos los que la veían (2:15), y el libro que lleva su nombre gira en torno a una decisión que toma en el capítulo 4.",
			},
		},
		{
			book: "EST",
			startChapter: 3,
			title: "El complot de Amán",
			explanation:
				"Amán es exaltado por encima de todos los funcionarios del rey, y todos se inclinan ante él excepto Mardoqueo (3:1–2). Observa cómo la negativa de un solo hombre se convierte en un plan para destruir a todos los judíos del imperio (3:6). Se echa la suerte, llamada Pur, para escoger el día (3:7). Fíjate en el último versículo: el rey y Amán se sientan a beber mientras la ciudad queda conmocionada (3:15).",
		},
		{
			book: "EST",
			startChapter: 4,
			title: "Para esta hora",
			explanation:
				"Mardoqueo se viste de cilicio y hace duelo, y los mensajes van y vienen entre él y la reina. Fíjate en lo que se interpone en el camino de Ester: cualquiera que se presente ante el rey sin ser llamado puede morir (4:11). Lee despacio la respuesta de Mardoqueo (4:13–14), y luego la de Ester: ayunen por mí tres días, y \"si perezco, que perezca\" (4:16).",
		},
		{
			title: "Mardoqueo",
			content: {
				kind: "character",
				entitySlug: "mordecai_2107",
				note:
					"Mardoqueo era un judío de la tribu de Benjamín que se sentaba a la puerta del rey (Ester 2:5, 2:21). No quiso inclinarse ante Amán (3:2), y el libro termina con él como el segundo después del rey, procurando el bien de su pueblo (10:3).",
			},
		},
		{
			book: "EST",
			startChapter: 5,
			endChapter: 6,
			title: "Dos banquetes y una noche en vela",
			explanation:
				"El rey extiende su cetro de oro, y Ester vive (5:2). En lugar de pedir enseguida, lo invita a él y a Amán a un banquete, y luego a un segundo (5:4, 5:8). Mientras tanto, Amán levanta una horca para Mardoqueo (5:14). Luego observa el capítulo 6: el rey no puede dormir, le leen las crónicas del capítulo 2, y Amán llega justo en el peor momento (6:1–4).",
		},
		{
			book: "EST",
			startChapter: 7,
			title: "Ester habla",
			explanation:
				"En el segundo banquete, Ester por fin pide por su propia vida y por la de su pueblo (7:3–4). Fíjate en las pocas palabras que necesita para nombrar al enemigo: es Amán (7:6). El último versículo hace que su propio plan se vuelva contra él (7:10).",
		},
		{
			title: "Ester acusa a Amán",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/117.Esther_Accuses_Haman.jpg/1280px-117.Esther_Accuses_Haman.jpg",
				alt: "Un grabado en una sala de altas columnas: una reina con un largo vestido bordado, de pie, señala por encima de una mesa a un hombre que se cubre el rostro, mientras un rey barbudo observa sentado.",
				caption:
					"Ester señala a Amán como el enemigo, y Amán, dice el texto, se turbó delante del rey y de la reina (Ester 7:6).",
				credit: "Gustave Doré, Esther Accuses Haman, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:117.Esther_Accuses_Haman.jpg",
			},
		},
		{
			book: "EST",
			startChapter: 8,
			endChapter: 10,
			title: "La tristeza convertida en alegría",
			explanation:
				"Una ley del rey no podía revocarse (8:8), así que un segundo decreto permite a los judíos defenderse (8:11). Busca la frase que se repite tres veces en el capítulo 9: no echaron mano al despojo (9:10, 9:15, 9:16). Luego fíjate en cómo la fiesta de Purim recibe su nombre de la suerte que echó Amán (9:24–26), un mes que \"se les cambió de tristeza en alegría\" (9:22).",
		},
		{
			title: "Para esta hora",
			content: {
				kind: "reflection",
				prompt:
					"Mardoqueo le preguntó a Ester quién sabía si no había llegado al reino \"para esta hora\". ¿Dónde te ha puesto Dios a ti, y para qué podría ser?",
			},
			anchor: { book: "EST", chapter: 4, verse: 14 },
		},
	],
};
