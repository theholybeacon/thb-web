import { GlobalStudyDef } from "../../globalStudy";

/** Jueces 13–16: Sansón, desde su nacimiento prometido hasta su muerte en el templo de Dagón. */
export const SAMSON_ES: GlobalStudyDef = {
	slug: "story-samson-es",
	kind: "story",
	language: "es",
	name: "Sansón y Dalila",
	description:
		"Apartado para Dios antes de nacer y dotado de una fuerza asombrosa, Sansón la gasta en sus propios deseos hasta que Dalila descubre su secreto. Lee una historia seria sobre dones mal usados, y sobre una última oración que Dios aún escuchó.",
	topic: "La historia de Sansón: su nacimiento, su fuerza, la traición de Dalila y su muerte entre los filisteos (Jueces 13–16).",
	length: 3,
	depth: 4,
	sortOrder: 124,
	coversWholeCanon: false,
	steps: [
		{
			title: "Cuarenta años bajo los filisteos",
			content: {
				kind: "text",
				body:
					"Una vez más Israel hizo lo malo ante los ojos del SEÑOR, y él los entregó en manos de los filisteos durante cuarenta años (Jueces 13:1). Esta vez el libro no dice que Israel clamara pidiendo ayuda, como sí lo hizo bajo Madián (Jueces 6:6).\n\n" +
					"Sansón iba a ser nazareo desde su nacimiento. La ley de Moisés describe ese voto: el nazareo no bebía vino, no dejaba que la navaja tocara su cabeza y se mantenía lejos de los muertos, como señal de que estaba apartado para Dios (Números 6:2–8).",
			},
		},
		{
			book: "JDG",
			startChapter: 13,
			title: "Un hijo prometido",
			explanation:
				"Fíjate en que la historia comienza con una mujer estéril cuyo nombre nunca se nos dice, y con un ángel que se le aparece primero a ella (13:2–3). El niño será apartado para Dios desde el vientre y comenzará a salvar a Israel (13:5): comenzará, no terminará. Observa cómo Manoa le pregunta su nombre al visitante, y cómo el ángel sube en la llama del altar (13:18–20).",
		},
		{
			book: "JDG",
			startChapter: 14,
			title: "El león y el enigma",
			explanation:
				"Las primeras palabras de Sansón que registra el texto son una exigencia: tómenme a esa mujer filistea por esposa (14:2–3). El versículo 4 añade que sus padres no sabían que esto venía del SEÑOR, que buscaba una ocasión contra los filisteos. Fíjate en que el Espíritu del SEÑOR viene con poder sobre él y despedaza a un león con las manos desnudas, pero no se lo cuenta a nadie (14:6); más tarde come miel del cadáver del león y también lo mantiene en secreto (14:8–9). El enigma de la boda termina en ira y muerte (14:19).",
		},
		{
			book: "JDG",
			startChapter: 15,
			title: "Zorras, una quijada y un manantial",
			explanation:
				"Mira cómo una venganza responde a otra: campos quemados (15:4–5), luego los filisteos queman a la esposa de Sansón y a su padre (15:6), y luego Sansón contraataca (15:7–8). Su propio pueblo, Judá, lo entrega atado (15:11–13). Después de la quijada, fíjate en la primera vez que Sansón ora: se está muriendo de sed, y Dios abre un manantial para él (15:18–19).",
		},
		{
			title: "Sansón",
			content: {
				kind: "character",
				entitySlug: "samson_2468",
				note:
					"Sansón juzgó a Israel durante veinte años en los días de los filisteos (Jueces 15:20; 16:31). Su fuerza llegaba cuando el Espíritu del SEÑOR venía con poder sobre él (14:6, 14:19, 15:14). Hebreos lo nombra entre aquellos cuya fe el autor no tiene tiempo de contar (Hebreos 11:32).",
			},
		},
		{
			book: "JDG",
			startChapter: 16,
			startVerse: 1,
			endVerse: 22,
			title: "Sansón y Dalila",
			explanation:
				"Cada uno de los príncipes filisteos le ofrece a Dalila mil cien piezas de plata para que descubra el secreto de la fuerza de Sansón (16:5). Cuenta las veces que ella pregunta y él miente, y fíjate en que él sigue volviendo. Cuando por fin le cuenta todo (16:17), lee despacio el versículo 20: no sabía que el SEÑOR se había apartado de él. Y no pases por alto el versículo 22: el cabello le comenzó a crecer de nuevo.",
		},
		{
			title: "Dalila",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/063.Samson_and_Delilah.jpg/1280px-063.Samson_and_Delilah.jpg",
				alt: "Un grabado de un hombre barbado de cabello largo, sentado en una habitación ricamente decorada y tocándose el cabello, mientras a su lado una mujer con un velo blanco lo mira desde arriba.",
				caption:
					"Dalila lo presionaba día tras día hasta que su alma se angustió a muerte, y él le descubrió todo su corazón (Jueces 16:16–17).",
				credit: "Gustave Doré, Samson and Delilah, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:063.Samson_and_Delilah.jpg",
			},
		},
		{
			book: "JDG",
			startChapter: 16,
			startVerse: 23,
			endVerse: 31,
			title: "La última oración",
			explanation:
				"Los filisteos se reúnen para dar gracias a su dios Dagón por haber capturado a Sansón (16:23–24). Fíjate en la oración de Sansón en el versículo 28: le pide a Dios que se acuerde de él y lo fortalezca una vez más, y es sincero sobre el motivo: vengarse por sus dos ojos. El versículo 30 da el sobrio resumen del narrador, y el versículo 31, su sepultura en el sepulcro de su padre.",
		},
		{
			title: "La muerte de Sansón",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/064.The_Death_of_Samson.jpg/1280px-064.The_Death_of_Samson.jpg",
				alt: "Un grabado de enormes columnas de piedra que se desploman dentro de un templo, con un hombre de pie entre ellas mientras el techo se parte y la multitud cae y huye escaleras abajo.",
				caption:
					"Sansón se asió de las dos columnas del medio que sostenían la casa y empujó con todas sus fuerzas, y la casa se vino abajo (Jueces 16:29–30).",
				credit: "Gustave Doré, The Death of Samson, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:064.The_Death_of_Samson.jpg",
			},
		},
		{
			title: "Sansón en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"El ángel dijo que Sansón solo comenzaría a salvar a Israel de los filisteos (Jueces 13:5). La obra continuó mucho después de él: en tiempos de Samuel los filisteos fueron sometidos (1 Samuel 7:13), y más tarde David los derrotó (2 Samuel 8:1).\n\n" +
					"Sansón aparece una sola vez en el Nuevo Testamento, en la lista de personas de fe de Hebreos 11:32. El pasaje continúa hablando de aquellos que sacaron fuerzas de su debilidad (Hebreos 11:34).",
			},
		},
		{
			title: "Acuérdate de mí",
			content: {
				kind: "reflection",
				prompt:
					"La vida de Sansón está llena de fuerza gastada en sí mismo, y aun así, al final, le pide a Dios que se acuerde de él (Jueces 16:28). ¿Qué don te ha dado Dios, y cómo sería volver a ponerlo en sus manos?",
			},
			anchor: { book: "JDG", chapter: 16, verse: 28 },
		},
	],
};
