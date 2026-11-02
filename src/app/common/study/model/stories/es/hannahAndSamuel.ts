import { GlobalStudyDef } from "../../globalStudy";

/** 1 Samuel 1–3: la oración de Ana, su cántico y el SEÑOR llamando al niño Samuel. */
export const HANNAH_AND_SAMUEL_ES: GlobalStudyDef = {
	slug: "story-hannah-and-samuel-es",
	kind: "story",
	language: "es",
	name: "Ana y el niño Samuel",
	description:
		"Una mujer que soportó burlas durante años derrama su dolor ante Dios y le promete el hijo que tanto anhela. Lee cómo fue respondida su oración, y cómo ese niño oyó a Dios llamarlo por su nombre en la noche.",
	topic: "La historia de la oración de Ana, el nacimiento de Samuel y el SEÑOR llamando a Samuel en Silo (1 Samuel 1–3).",
	length: 2,
	depth: 4,
	sortOrder: 126,
	coversWholeCanon: false,
	steps: [
		{
			title: "El final de los jueces",
			content: {
				kind: "text",
				body:
					"El libro de Jueces termina con un resumen triste: en aquellos días no había rey en Israel, y cada uno hacía lo que bien le parecía (Jueces 21:25). El primer libro de Samuel comienza en esos mismos días, con una familia común de la región montañosa de Efraín (1 Samuel 1:1).\n\n" +
					"Cada año Elcana subía a adorar y ofrecer sacrificios en Silo, donde estaba la casa del SEÑOR y donde los dos hijos de Elí, Ofni y Finees, servían como sacerdotes (1 Samuel 1:3). Elcana tenía dos esposas: Penina tenía hijos, y Ana no tenía ninguno (1 Samuel 1:2).",
			},
		},
		{
			book: "1SA",
			startChapter: 1,
			title: "La oración de Ana en Silo",
			explanation:
				"Fíjate en cuánto tiempo ha cargado Ana con esto: año tras año su rival la provocaba hasta que ella lloraba y no comía (1:6–7). Presta atención a su oración en los versículos 10–11, hecha con profunda amargura, y al voto que la acompaña. Elí al principio cree que está ebria, y ella le dice que ha estado derramando su alma delante del SEÑOR (1:13–15). El nombre de Samuel se explica en el versículo 20: ella se lo pidió al SEÑOR.",
		},
		{
			title: "Ana presenta a Samuel ante Elí",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Eeckhout%2C_Gerbrand_van_den_-_The_Infant_Samuel_brought_by_Hannah_to_Eli_-_Ashmolean_Museum.jpg/1280px-Eeckhout%2C_Gerbrand_van_den_-_The_Infant_Samuel_brought_by_Hannah_to_Eli_-_Ashmolean_Museum.jpg",
				alt: "Una pintura de una mujer arrodillada que toma de la mano a un niño pequeño vestido de blanco y lo presenta a un anciano con ricas vestiduras y turbante, sentado en una silla, mientras otro hombre está de pie detrás de ellos.",
				caption:
					"Ana le dice a Elí que este es el niño por el que oró, y que ahora lo entrega al SEÑOR por todos los días de su vida (1 Samuel 1:27–28).",
				credit: "Gerbrand van den Eeckhout, The Infant Samuel Brought by Hannah to Eli (c. 1660–1663), Ashmolean Museum, Oxford. Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Eeckhout,_Gerbrand_van_den_-_The_Infant_Samuel_brought_by_Hannah_to_Eli_-_Ashmolean_Museum.jpg",
			},
		},
		{
			title: "Ana",
			content: {
				kind: "character",
				entitySlug: "hannah_1400",
				note:
					"Ana cumplió su voto y dejó a su hijo pequeño sirviendo en Silo (1 Samuel 1:24–28). Cada año le hacía una pequeña túnica y se la llevaba cuando subía a adorar (2:19), y el SEÑOR le dio tres hijos y dos hijas más (2:21).",
			},
		},
		{
			book: "1SA",
			startChapter: 2,
			title: "El cántico de Ana y los hijos de Elí",
			explanation:
				"La oración de Ana en los versículos 1–10 es un cántico sobre un Dios que invierte las cosas: abate y enaltece, y levanta del polvo al pobre (2:7–8). Fíjate en que termina hablando del rey del SEÑOR (2:10), cuando Israel todavía no tiene rey. Luego el capítulo pone dos cuadros lado a lado: los hijos de Elí, que no conocían al SEÑOR (2:12), y el niño Samuel, que servía delante del SEÑOR y crecía en el favor de Dios y de la gente (2:18, 2:26).",
		},
		{
			book: "1SA",
			startChapter: 3,
			title: "El SEÑOR llama a Samuel",
			explanation:
				"Fíjate en el escenario de los versículos 1–3: la palabra del SEÑOR escaseaba en aquellos días, y la lámpara de Dios aún no se había apagado. Samuel oye su nombre tres veces y corre hacia Elí, porque todavía no conocía al SEÑOR (3:7). Presta atención a la respuesta que Elí le enseña (3:9). El primer mensaje que recibe Samuel es duro y tiene que ver con la casa de Elí (3:11–14), y el capítulo termina con todo Israel sabiendo que es profeta (3:20).",
		},
		{
			title: "El niño Samuel",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Joshua_Reynolds_%281723-1792%29_-_The_Infant_Samuel_-_N00162_-_National_Gallery.jpg",
				alt: "Una pintura de un niño pequeño con camisón blanco, arrodillado en una habitación oscura con las manos juntas en oración, mirando hacia una luz suave.",
				caption:
					"Samuel estaba acostado en el templo del SEÑOR cuando el SEÑOR lo llamó por su nombre (1 Samuel 3:3–4).",
				credit: "Joshua Reynolds, The Infant Samuel (1776). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Joshua_Reynolds_(1723-1792)_-_The_Infant_Samuel_-_N00162_-_National_Gallery.jpg",
			},
		},
		{
			title: "Samuel",
			content: {
				kind: "character",
				entitySlug: "samuel_2469",
				note:
					"Samuel llegó a ser un profeta conocido en todo Israel (1 Samuel 3:20) y juzgó a Israel todos los días de su vida (7:15); Pablo cuenta que el tiempo de los jueces duró \"hasta el profeta Samuel\" (Hechos 13:20). Ungió a los dos primeros reyes de Israel, Saúl y David (1 Samuel 10:1; 16:13).",
			},
		},
		{
			title: "Ana y Samuel en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Samuel es recordado como uno de los grandes intercesores: un salmo lo nombra entre los que invocaban al SEÑOR y eran respondidos (Salmos 99:6), y Dios habla de Moisés y Samuel presentándose delante de él (Jeremías 15:1). En Hechos, Pedro cuenta a los profetas \"desde Samuel\" en adelante (Hechos 3:24).\n\n" +
					"El cántico de Ana tiene un eco en el Nuevo Testamento. Cuando María canta después de saber que dará a luz a Jesús, ella también alaba a Dios que quita a los poderosos de sus tronos y exalta a los humildes (Lucas 1:52; compara con 1 Samuel 2:7–8). Y Lucas describe al niño Jesús creciendo en el favor de Dios y de la gente, como Samuel (Lucas 2:52; 1 Samuel 2:26).",
			},
		},
		{
			title: "Habla, SEÑOR",
			content: {
				kind: "reflection",
				prompt:
					"Ana derramó su alma ante Dios, y Samuel aprendió a responderle pidiéndole que hablara, porque su siervo escuchaba (1 Samuel 1:15; 3:10). ¿Qué se parece más a tu oración en este momento: derramar lo que anhelas, o escuchar lo que Dios quiere decirte?",
			},
			anchor: { book: "1SA", chapter: 3, verse: 10 },
		},
	],
};
