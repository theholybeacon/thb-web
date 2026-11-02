import { GlobalStudyDef } from "../../globalStudy";

/** Génesis 4: dos hermanos, dos ofrendas y el primer homicidio. */
export const CAIN_AND_ABEL_ES: GlobalStudyDef = {
	slug: "story-cain-and-abel-es",
	kind: "story",
	language: "es",
	name: "Caín y Abel",
	description:
		"Dos hermanos le llevan ofrendas a Dios, y uno se enoja porque la suya no fue aceptada. Lee cómo Dios advirtió a Caín antes de que atacara, qué le preguntó después y cómo aun así lo protegió.",
	topic: "La historia de Caín y Abel, el primer homicidio y las generaciones que vinieron después (Génesis 4).",
	length: 1,
	depth: 3,
	sortOrder: 103,
	coversWholeCanon: false,
	steps: [
		{
			title: "Fuera del huerto",
			content: {
				kind: "text",
				body:
					"Adán y Eva viven ahora fuera del Edén (Génesis 3:23–24). Su primer hijo es Caín, y el segundo, Abel (Génesis 4:1–2). Abel es pastor de ovejas y Caín labra la tierra (Génesis 4:2), esa misma tierra de la que Dios había dicho que ahora daría su fruto solo con dolor y fatiga (Génesis 3:17).\n\n" +
					"En Génesis 3 el pecado se interpuso entre las personas y Dios. En Génesis 4 se interpone entre hermanos.",
			},
		},
		{
			book: "GEN",
			startChapter: 4,
			startVerse: 1,
			endVerse: 7,
			title: "Dos ofrendas",
			explanation:
				"Fíjate en cómo se describen las dos ofrendas: Caín trae del fruto de la tierra, y Abel trae de los primogénitos de sus ovejas y de su grasa (4:3–4). Génesis no dice exactamente por qué Dios miró con agrado la ofrenda de Abel y no la de Caín; Hebreos dice que Abel ofreció la suya por la fe (Hebreos 11:4). Observa lo que hace Dios cuando Caín se enoja: se le acerca con una pregunta y una advertencia, que el pecado está a la puerta y que Caín debe dominarlo (4:6–7).",
		},
		{
			title: "Caín y Abel ofrecen sus sacrificios",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/004.Cain_and_Abel_Offer_Their_Sacrifices.jpg/1280px-004.Cain_and_Abel_Offer_Their_Sacrifices.jpg",
				alt: "Un grabado de dos hombres en un valle rocoso: uno está arrodillado en oración junto a un fuego cuyo humo sube derecho, mientras el otro, sentado aparte con la mano en el mentón, observa cómo un humo espeso se arrastra por el suelo delante de él.",
				caption:
					"El SEÑOR miró con agrado a Abel y a su ofrenda, pero no miró a Caín ni a su ofrenda (Génesis 4:4–5). Doré muestra la diferencia con el humo; el texto de Génesis no la describe.",
				credit: "Gustave Doré, Cain and Abel Offer Their Sacrifices, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:004.Cain_and_Abel_Offer_Their_Sacrifices.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 4,
			startVerse: 8,
			endVerse: 16,
			title: "¿Soy yo guarda de mi hermano?",
			explanation:
				"El homicidio ocupa un solo versículo (4:8). Luego, como hizo con Adán (3:9), Dios llega con una pregunta: \"¿Dónde está Abel tu hermano?\" (4:9). Fíjate en que la sangre de Abel clama a Dios desde la tierra (4:10). Y fíjate en la misericordia del final: cuando Caín teme que cualquiera que lo encuentre lo mate, Dios le pone una señal para que nadie lo haga (4:14–15).",
		},
		{
			title: "Abel",
			content: {
				kind: "character",
				entitySlug: "abel_13",
				note:
					"Abel es el segundo hijo de Adán y Eva, pastor de ovejas (Génesis 4:2). Nunca habla en Génesis, pero Hebreos dice que por su fe todavía habla (Hebreos 11:4), y Jesús lo llama \"Abel el justo\", el primero de los justos cuya sangre fue derramada (Mateo 23:35).",
			},
		},
		{
			title: "Caín",
			content: {
				kind: "character",
				entitySlug: "cain_533",
				note:
					"Caín es el primogénito de Adán y Eva y labrador de la tierra (Génesis 4:1–2). Después del homicidio sale de la presencia del SEÑOR y habita en la tierra de Nod, al oriente del Edén (4:16), y edifica una ciudad (4:17). Juan lo presenta como advertencia: mató a su hermano porque sus propias obras eran malas y las de su hermano, justas (1 Juan 3:12).",
			},
		},
		{
			title: "Caín mata a Abel",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/005.Cain_Slays_Abel.jpg/1280px-005.Cain_Slays_Abel.jpg",
				alt: "Un grabado de un hombre tendido inmóvil en una ladera rocosa bajo un cielo tormentoso, mientras otro hombre, con un garrote en la mano, está inclinado junto a una roca y lo mira.",
				caption: "Dios le dice a Caín que la sangre de su hermano clama a él desde la tierra (Génesis 4:10).",
				credit: "Gustave Doré, Cain Slays Abel, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:005.Cain_Slays_Abel.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 4,
			startVerse: 17,
			endVerse: 26,
			title: "Después de Caín",
			explanation:
				"Observa dos cosas que crecen juntas en la familia de Caín. Crece la habilidad: una ciudad, tiendas y ganado, la música y herramientas de bronce y de hierro (4:17–22). Y crece la violencia: Lamec se jacta de haber matado a un hombre por herirlo, y de que será vengado setenta y siete veces (4:23–24). Fíjate, en cambio, en cómo termina el capítulo: un nuevo hijo, Set, y la gente que comienza a invocar el nombre del SEÑOR (4:25–26).",
		},
		{
			title: "Caín y Abel en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Jesús lleva el enojo a la misma raíz que el homicidio: cualquiera que se enoje con su hermano será culpable de juicio (Mateo 5:21–22). Juan usa a Caín como lo opuesto al amor: \"que nos amemos unos a otros\", no como Caín (1 Juan 3:11–12), y Judas advierte sobre quienes han seguido \"el camino de Caín\" (Judas 11).\n\n" +
					"La sangre de Abel clamó desde la tierra (Génesis 4:10). Hebreos llama a Jesús el mediador de un nuevo pacto, cuya sangre \"habla mejor que la de Abel\" (Hebreos 12:24).",
			},
		},
		{
			title: "El pecado a la puerta",
			content: {
				kind: "reflection",
				prompt:
					"Dios advirtió a Caín que el pecado estaba a su puerta y que él debía dominarlo. ¿Qué está agazapado a tu puerta ahora mismo, y cómo sería dominarlo antes de que te domine a ti?",
			},
			anchor: { book: "GEN", chapter: 4, verse: 7 },
		},
	],
};
