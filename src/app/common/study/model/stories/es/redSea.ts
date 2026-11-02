import { GlobalStudyDef } from "../../globalStudy";

/** Éxodo 14–15: Israel atrapado junto al mar, el paso en seco y el cántico en la otra orilla. */
export const RED_SEA_ES: GlobalStudyDef = {
	slug: "story-red-sea-es",
	kind: "story",
	language: "es",
	name: "El paso del mar Rojo",
	description:
		"Los carros de Faraón detrás, el mar delante, y ningún lugar adonde huir. Lee cómo Dios abrió un camino a través de las aguas, y el cántico que su pueblo entonó en la otra orilla.",
	topic: "La huida de Israel a través del mar, la derrota del ejército de Faraón y el cántico de Moisés y María (Éxodo 14–15).",
	length: 2,
	depth: 3,
	sortOrder: 115,
	coversWholeCanon: false,
	steps: [
		{
			title: "Por el camino largo",
			content: {
				kind: "text",
				body:
					"Israel sale de Egipto a toda prisa, la misma noche en que Faraón les dice que se vayan (Éxodo 12:31–33). Dios no los lleva por el camino corto de la costa, no sea que al ver la guerra se vuelvan a Egipto; los lleva por el camino largo, a través del desierto, hacia el mar Rojo (13:17–18). Llevan consigo los huesos de José, como él lo había pedido (13:19).\n\n" +
					"Y no van solos. El SEÑOR va delante de ellos en una columna de nube de día y en una columna de fuego de noche, y nunca se aparta de ellos (13:21–22).",
			},
		},
		{
			book: "EXO",
			startChapter: 14,
			startVerse: 1,
			endVerse: 14,
			title: "Atrapados junto al mar",
			explanation:
				"Fíjate en que es Dios mismo quien le dice a Israel que se vuelva y acampe junto al mar, donde Faraón pensará que están perdidos (14:2–3). Luego Faraón cambia de opinión y los persigue con sus carros (14:5–7). Escucha el terror del pueblo (14:11–12), y después la respuesta de Moisés en los versículos 13 y 14: no teman, estense quietos y vean lo que el SEÑOR hará. El SEÑOR peleará por ustedes.",
		},
		{
			book: "EXO",
			startChapter: 14,
			startVerse: 15,
			endVerse: 31,
			title: "Por en medio del mar, en seco",
			explanation:
				"Ahora Dios le dice a Moisés que deje de clamar y que el pueblo marche (14:15). Observa cómo la nube pasa de delante del campamento a la parte de atrás, y se queda toda la noche entre Israel y Egipto (14:19–20). Las aguas se levantan como un muro a la derecha y a la izquierda (14:22), y al amanecer el mar ha vuelto sobre el ejército que los seguía (14:27–28). Fíjate en el último versículo: el pueblo temió al SEÑOR y creyó (14:31).",
		},
		{
			title: "Los egipcios ahogados en el mar",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/037.The_Egyptians_Drown_in_the_Sea.jpg/1280px-037.The_Egyptians_Drown_in_the_Sea.jpg",
				alt: "Un grabado de olas enormes que se desploman sobre caballos y soldados en primer plano, mientras a lo lejos una multitud está a salvo sobre una colina bajo un cielo que se abre.",
				caption:
					"Doré pone la orilla segura a lo lejos, en la luz, y los carros de Egipto abajo entre las olas, mientras el mar vuelve sobre ellos (Éxodo 14:27–28).",
				credit: "Gustave Doré, The Egyptians Drown in the Sea, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:037.The_Egyptians_Drown_in_the_Sea.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 15,
			startVerse: 1,
			endVerse: 21,
			title: "El cántico en la orilla",
			explanation:
				"Moisés y el pueblo cantan este cántico al SEÑOR (15:1), y habla de lo que él ha hecho, no de ellos. Fíjate en las preguntas del versículo 11: ¿quién como tú entre los dioses? Fíjate también en que el cántico mira hacia adelante y no solo hacia atrás: a las naciones que oyen y tiemblan (15:14–16) y a Dios plantando a su pueblo en su propia tierra (15:17). Luego María toma un pandero, y las mujeres responden con el primer verso del cántico (15:20–21).",
		},
		{
			title: "María",
			content: {
				kind: "character",
				entitySlug: "miriam_2087",
				note:
					"Éxodo la llama profetisa y hermana de Aarón (15:20), y ella guía a las mujeres en el canto en la otra orilla. Siglos después, el profeta Miqueas la recuerda, junto con Moisés y Aarón, como una de los tres que Dios envió para sacar a su pueblo de Egipto (Miqueas 6:4).",
			},
		},
		{
			title: "El mar en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Israel nunca olvida este paso. Cuando cruzan el Jordán cuarenta años después, Josué les dice que Dios lo secó tal como había secado el mar Rojo (Josué 4:23). Los salmos lo cantan, y también confiesan lo pronto que el pueblo lo olvidó (Salmos 106:9–13). Isaías llama a Dios el que abre camino en el mar (Isaías 43:16).\n\n" +
					"En el Nuevo Testamento, Pablo dice que todos \"en Moisés fueron bautizados en la nube y en la mar\" (1 Corintios 10:1–2), Hebreos cuenta el paso como un acto de fe (Hebreos 11:29), y en Apocalipsis los que han vencido cantan \"el cántico de Moisés\" y el cántico del Cordero (Apocalipsis 15:3).",
			},
		},
		{
			title: "Estense quietos",
			content: {
				kind: "reflection",
				prompt:
					"Moisés le dijo a un pueblo aterrado que el SEÑOR pelearía por ellos y que solo tenían que estar quietos. ¿Dónde te sientes atrapado entre algo que viene detrás de ti y algo que tienes delante, y cómo sería confiar en que Dios pelee por ti allí?",
			},
			anchor: { book: "EXO", chapter: 14, verse: 14 },
		},
	],
};
