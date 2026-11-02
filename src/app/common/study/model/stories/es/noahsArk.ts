import { GlobalStudyDef } from "../../globalStudy";

/** Génesis 6–9: el diluvio, el arca y el primer pacto. */
export const NOAHS_ARK_ES: GlobalStudyDef = {
	slug: "story-noahs-ark-es",
	kind: "story",
	language: "es",
	name: "El arca de Noé",
	description:
		"El mundo se llena de violencia, a Dios le duele, y a un hombre se le pide construir una embarcación. Lee el diluvio desde la primera advertencia hasta el arcoíris, y la promesa que Dios hizo después a todo ser viviente.",
	topic: "La historia de Noé, el arca y el diluvio, y el pacto que Dios hizo después (Génesis 6–9).",
	length: 2,
	depth: 4,
	sortOrder: 104,
	coversWholeCanon: false,
	steps: [
		{
			title: "Antes del diluvio",
			content: {
				kind: "text",
				body:
					"Diez generaciones separan a Adán de Noé (Génesis 5). En ese tiempo la humanidad llenó la tierra, y también la violencia: el homicidio de Abel a manos de Caín (Génesis 4:8) se convirtió en la jactancia de Lamec, que sería vengado setenta y siete veces (Génesis 4:23–24).\n\n" +
					"Génesis lo dice sin rodeos: \"corrompióse la tierra delante de Dios, y estaba la tierra llena de violencia\" (Génesis 6:11). La historia que sigue trata de lo que Dios hace con un mundo así, y con el único hombre que todavía caminaba con él (Génesis 6:9).",
			},
		},
		{
			book: "GEN",
			startChapter: 6,
			title: "Dios mira la tierra y llama a Noé",
			explanation:
				"Fíjate en dos cosas que Dios siente en este capítulo: dolor por lo que la gente ha llegado a ser (6:6) y favor hacia Noé (6:8). Luego mira lo precisas que son las instrucciones: las medidas del arca, su puerta, sus pisos y quiénes entran. Toda la respuesta de Noé cabe en un versículo: hizo todo lo que Dios le mandó (6:22).",
		},
		{
			title: "Noé",
			content: {
				kind: "character",
				entitySlug: "noah_2210",
				note:
					"Noé es la única persona de Génesis de quien se dice que fue \"varón justo, perfecto en sus generaciones\" (6:9). El Nuevo Testamento lo recuerda por su fe (Hebreos 11:7) y como pregonero de justicia (2 Pedro 2:5).",
			},
		},
		{
			book: "GEN",
			startChapter: 7,
			title: "El diluvio",
			explanation:
				"Siete días de espera, y luego cuarenta días de lluvia. Fíjate en el detalle del versículo 16: cuando todos ya están adentro, es Dios quien cierra la puerta. Cuenta cuántas veces el capítulo te dice que las aguas subieron, hasta cubrir incluso los montes.",
		},
		{
			title: "El diluvio",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/1280px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
				alt: "Un grabado de personas y un tigre aferrados a una roca mientras las aguas del diluvio suben a su alrededor bajo un cielo oscuro.",
				caption:
					"Doré eligió mostrar a la gente que quedó fuera del arca, no el arca: la última roca sobre el agua y quienes intentan salvar en ella a sus hijos.",
				credit: "Gustave Doré, The Deluge, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I,_The_Deluge.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 8,
			title: "Dios se acuerda de Noé",
			explanation:
				"El punto de giro está en el primer versículo: \"Y acordóse Dios de Noé\". Después las aguas bajan, el arca reposa sobre los montes de Ararat, y Noé suelta un cuervo y una paloma. Lo primero que hace en tierra seca es edificar un altar (8:20).",
		},
		{
			title: "La paloma regresa",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Dove_Sent_Forth_from_the_Ark.png",
				alt: "Un grabado de una paloma que se aleja volando sobre aguas tranquilas, con el arca oscura detrás.",
				caption: "La segunda vez, la paloma vuelve con una hoja de olivo recién arrancada en el pico (Génesis 8:11).",
				credit: "Gustave Doré, The Dove Sent Forth from the Ark (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Dove_Sent_Forth_from_the_Ark.png",
			},
		},
		{
			book: "GEN",
			startChapter: 9,
			startVerse: 1,
			endVerse: 17,
			title: "El pacto y el arcoíris",
			explanation:
				"Es la primera vez que la Biblia usa la palabra pacto para una promesa que Dios hace. Fíjate con quién lo hace: con Noé, con sus descendientes y con \"toda alma viviente\" (9:10). Fíjate también para quién es el arcoíris: Dios dice que cuando lo vea, se acordará (9:16).",
		},
		{
			title: "Noé en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"El diluvio no se queda atrás en Génesis. Isaías oye a Dios comparar su promesa a Israel con su juramento a Noé: \"así he jurado que no me enojaré contra ti\" (Isaías 54:9).\n\n" +
					"Jesús compara su propia venida con los días de Noé, cuando la gente seguía comiendo, bebiendo y casándose hasta el día en que llegó el diluvio (Mateo 24:37–39). Pedro ve en las ocho personas que fueron salvadas a través del agua una figura del bautismo (1 Pedro 3:20–21).",
			},
		},
		{
			title: "Una promesa cumplida",
			content: {
				kind: "reflection",
				prompt:
					"Dios se comprometió con una promesa y dio una señal para recordarla. ¿Dónde has visto a Dios cumplir una promesa, en las Escrituras o en tu propia vida?",
			},
			anchor: { book: "GEN", chapter: 9, verse: 13 },
		},
	],
};
