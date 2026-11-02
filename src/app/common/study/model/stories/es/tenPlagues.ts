import { GlobalStudyDef } from "../../globalStudy";

/** Éxodo 7–12: las plagas sobre Egipto, la primera Pascua y la noche en que Israel salió. */
export const TEN_PLAGUES_ES: GlobalStudyDef = {
	slug: "story-ten-plagues-es",
	kind: "story",
	language: "es",
	name: "Las plagas y la Pascua",
	description:
		"Faraón pregunta quién es Jehová, y Egipto lo descubre, plaga tras plaga. Lee el enfrentamiento entre Dios y el rey más poderoso de la tierra, y la noche en que la sangre de un cordero en los postes de las puertas señaló las casas que Dios pasó de largo.",
	topic: "Las plagas sobre Egipto, la primera Pascua y la liberación de Israel de la esclavitud (Éxodo 7–12).",
	length: 3,
	depth: 4,
	sortOrder: 114,
	coversWholeCanon: false,
	steps: [
		{
			title: "Ladrillos sin paja",
			content: {
				kind: "text",
				body:
					"La primera visita de Moisés y Aarón a Faraón sale mal. Le piden que deje ir a Israel a adorar en el desierto, y Faraón responde con una pregunta: \"¿Quién es Jehová?\" No lo conoce, y no dejará ir a Israel (Éxodo 5:2). Luego obliga a los esclavos a recoger su propia paja sin dejar de hacer la misma cantidad de ladrillos (5:7–8).\n\n" +
					"El pueblo culpa a Moisés (5:21), y Moisés lleva su queja a Dios (5:22–23). Los capítulos que siguen son la respuesta de Dios a la pregunta de Faraón. Una y otra vez Dios dice que, por medio de lo que está a punto de hacer, Egipto sabrá que él es Jehová (7:5, 17).",
			},
		},
		{
			book: "EXO",
			startChapter: 7,
			title: "La vara, la serpiente y el río",
			explanation:
				"Moisés tiene ochenta años y Aarón ochenta y tres (7:7). Observa el primer enfrentamiento en los versículos 10–12: los magos de Faraón imitan la señal, pero la vara de Aarón se traga las de ellos. Luego el Nilo, la fuente de vida de Egipto, se convierte en sangre (7:20). Fíjate en la frase que se repetirá a lo largo de estos capítulos: el corazón de Faraón se endureció, y no los escuchó (7:13, 22).",
		},
		{
			title: "Moisés y Aarón ante Faraón",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/032.Moses_and_Aaron_Appear_before_Pharaoh.jpg/1280px-032.Moses_and_Aaron_Appear_before_Pharaoh.jpg",
				alt: "Un grabado de dos hombres con mantos de pie en un gran salón de columnas egipcias talladas, frente a un rey sentado y su corte; delante de ellos hay serpientes en el suelo de piedra.",
				caption: "Aarón echa su vara delante de Faraón y de sus siervos, y se convierte en serpiente (Éxodo 7:10).",
				credit: "Gustave Doré, Moses and Aaron Appear before Pharaoh, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:032.Moses_and_Aaron_Appear_before_Pharaoh.jpg",
			},
		},
		{
			title: "Faraón",
			content: {
				kind: "character",
				entitySlug: "pharaoh_2331",
				note:
					"La Biblia nunca dice el nombre de este rey. Éxodo dice tanto que Faraón endureció su propio corazón (8:15, 32) como que Dios lo endureció (9:12; 10:20), y Dios le dice por qué le ha permitido seguir en pie: para mostrarle su poder, y para que su nombre sea anunciado en toda la tierra (9:16).",
			},
		},
		{
			title: "Golpe tras golpe",
			content: {
				kind: "text",
				body:
					"Después de la sangre vienen las ranas (Éxodo 8:1–15), los mosquitos, o piojos en algunas traducciones (8:16–19), enjambres de moscas (8:20–32), una peste sobre el ganado (9:1–7), úlceras (9:8–12), granizo (9:13–35), langostas (10:1–20) y tres días de tinieblas (10:21–29).\n\n" +
					"Observa tres cosas a medida que se acumulan. Los magos imitan las dos primeras, luego fracasan, y le dicen a Faraón: \"Dedo de Dios es éste\" (8:19). Dios empieza a hacer diferencia con Israel: no hay moscas en Gosén, donde vivían los israelitas (8:22), allí no cae granizo (9:26), y hay luz en sus casas durante las tinieblas (10:23). Y Faraón negocia, promete y se retracta: \"He pecado\", dice, y luego vuelve a endurecer su corazón (9:27, 34).",
			},
		},
		{
			book: "EXO",
			startChapter: 11,
			title: "Una plaga más",
			explanation:
				"Este capítulo breve es la advertencia antes del último golpe. Fíjate en lo estimado que es ahora Moisés en Egipto, incluso a los ojos de los siervos de Faraón (11:3). Escucha el contraste de los versículos 6–7: un gran clamor por todo Egipto, y entre los israelitas ni siquiera un perro que ladre. Moisés sale de la presencia de Faraón ardiendo de enojo (11:8).",
		},
		{
			book: "EXO",
			startChapter: 12,
			title: "La Pascua",
			explanation:
				"Antes de la última plaga, Dios da una comida. Fíjate en los detalles: un cordero sin defecto (12:5), su sangre en los postes de las puertas (12:7), y la comida tomada a prisa, vestidos para el viaje (12:11). El centro de todo es el versículo 13: \"veré la sangre y pasaré de vosotros\". Luego, a medianoche, sucede exactamente como Moisés dijo (12:29), y Faraón los deja salir esa misma noche (12:31).",
		},
		{
			title: "La muerte de los primogénitos",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/035.The_Firstborn_of_the_Egyptians_Are_Slain.jpg/1280px-035.The_Firstborn_of_the_Egyptians_Are_Slain.jpg",
				alt: "Un grabado de una figura alada con una espada que baja por las escaleras de una casa egipcia, mientras unas mujeres lloran sobre niños que yacen sin vida en los escalones.",
				caption:
					"Doré muestra esa noche a través del dolor de las madres egipcias. El texto dice que no hubo casa en Egipto donde no hubiera un muerto (Éxodo 12:30).",
				credit: "Gustave Doré, The Firstborn of the Egyptians Are Slain, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:035.The_Firstborn_of_the_Egyptians_Are_Slain.jpg",
			},
		},
		{
			title: "La Pascua en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Dios le dice a Israel que celebre la Pascua cada año y que se la explique a sus hijos cuando pregunten qué significa (Éxodo 12:14, 26–27). Cuarenta años después, acampados por fin en la tierra prometida, la celebran de nuevo (Josué 5:10).\n\n" +
					"Jesús come su última cena con sus discípulos en la Pascua, y les dice cuánto ha deseado comerla con ellos antes de padecer (Lucas 22:7, 15). Juan el Bautista lo llama \"el Cordero de Dios\" (Juan 1:29); cuando no le quiebran las piernas en la cruz, Juan recuerda la Escritura que dice que no sería quebrado ni uno de sus huesos (Juan 19:36; compara Éxodo 12:46); y Pablo llama a Cristo \"nuestra pascua\" (1 Corintios 5:7).",
			},
		},
		{
			title: "Bajo la sangre",
			content: {
				kind: "reflection",
				prompt:
					"La noche de la Pascua, los israelitas estuvieron a salvo no porque fueran mejores que los egipcios, sino porque confiaron en la palabra de Dios y pusieron la sangre en sus puertas. ¿Qué significa para ti estar a salvo por algo que Dios provee y no por lo que tú mereces?",
			},
			anchor: { book: "EXO", chapter: 12, verse: 13 },
		},
	],
};
