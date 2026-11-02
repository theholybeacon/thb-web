import { GlobalStudyDef } from "../../globalStudy";

/** Números 13–14: el informe de los espías, la negativa de Israel a entrar en la tierra y cuarenta años en el desierto. */
export const TWELVE_SPIES_ES: GlobalStudyDef = {
	slug: "story-twelve-spies-es",
	kind: "story",
	language: "es",
	name: "Los doce espías",
	description:
		"Doce hombres exploran la tierra que Dios prometió y vuelven con los mismos hechos y conclusiones opuestas. Lee cómo el miedo se extendió por todo un pueblo, y cómo dos hombres que confiaron en Dios fueron los únicos de su generación que entraron en la tierra.",
	topic: "Los espías enviados a Canaán, la negativa del pueblo a entrar y la fe de Caleb y Josué (Números 13–14).",
	length: 2,
	depth: 4,
	sortOrder: 119,
	coversWholeCanon: false,
	steps: [
		{
			title: "A las puertas de la promesa",
			content: {
				kind: "text",
				body:
					"En la zarza ardiente Dios prometió llevar a su pueblo a \"una tierra que fluye leche y miel\" (Éxodo 3:8). Ahora, después del Sinaí, están acampados en Cades, en el desierto de Parán (Números 13:3, 26), y Moisés les dice que han llegado a los montes que Dios les está dando (Deuteronomio 1:19–21). Por el camino desde Horeb, Cades-barnea está a solo once días (Deuteronomio 1:2).\n\n" +
					"Antes de entrar, envían por delante a doce hombres, un príncipe de cada tribu (Números 13:2), para ver la tierra y traer algo de su fruto (13:20).",
			},
		},
		{
			book: "NUM",
			startChapter: 13,
			title: "Dos informes",
			explanation:
				"Fíjate en que Moisés le da a Oseas hijo de Nun un nuevo nombre: Josué (13:16). Observa el fruto que traen de vuelta: un solo racimo de uvas tan grande que lo cargan dos hombres en un palo (13:23). Luego escucha con atención el informe. Los doce están de acuerdo en que la tierra es buena (13:27); la pregunta es qué hacer con el pueblo fuerte y las ciudades amuralladas (13:28). Caleb dice: Subamos luego (13:30); los demás dicen: No podremos, difaman la tierra, y terminan diciendo que se veían como langostas (13:31–33).",
		},
		{
			title: "El regreso de los espías",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Dore_Return_of_the_Spies_From_the_Land_of_Promise.jpg",
				alt: "Un grabado de dos hombres que cargan un enorme racimo de uvas colgado de un palo entre ellos, con otros hombres detrás que llevan frutas, y una multitud y un campamento a lo lejos.",
				caption: "En el valle de Escol cortaron un sarmiento con un solo racimo de uvas y lo llevaron entre dos en un palo (Números 13:23).",
				credit: "Gustave Doré, The Return of the Spies from the Land of Promise, ilustración bíblica (siglo XIX). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Dore_Return_of_the_Spies_From_the_Land_of_Promise.jpg",
			},
		},
		{
			title: "Caleb",
			content: {
				kind: "character",
				entitySlug: "caleb_537",
				note:
					"El espía de la tribu de Judá (Números 13:6). Dios dice que en Caleb hubo otro espíritu y que lo siguió por completo (14:24), y cuarenta y cinco años después, a los ochenta y cinco, pide los montes donde vivían los anaceos y recibe Hebrón (Josué 14:10–14).",
			},
		},
		{
			book: "NUM",
			startChapter: 14,
			startVerse: 1,
			endVerse: 25,
			title: "Una noche de llanto",
			explanation:
				"Toda la congregación llora toda la noche y habla de elegir un capitán que los lleve de vuelta a Egipto (14:1–4). Fíjate en Josué y Caleb en los versículos 6–9: la tierra es en gran manera buena, y si el SEÑOR se agrada de nosotros, nos llevará a ella, así que no teman. La respuesta del pueblo es tomar piedras (14:10). Luego Moisés vuelve a orar, usando las mismas palabras que Dios le dijo en el Sinaí (14:18; Éxodo 34:6–7).",
		},
		{
			book: "NUM",
			startChapter: 14,
			startVerse: 26,
			endVerse: 45,
			title: "Cuarenta años",
			explanation:
				"Dios le da al pueblo lo que dijeron querer: habían deseado morir en el desierto (14:2), y allí morirán (14:28–29). Fíjate en que los niños por los que temían en el versículo 3 son los que entrarán en la tierra (14:31). Cuarenta días de exploración se convierten en cuarenta años de peregrinaje (14:34). Luego observa cómo el pueblo intenta subir de todos modos, sin el SEÑOR y contra la advertencia de Moisés, y fracasa (14:40–45).",
		},
		{
			title: "Los espías en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Moisés nunca deja que la siguiente generación olvide Cades. Vuelve a contar la historia a la siguiente generación (Números 32:8–13) y cuando están listos para entrar en la tierra (Deuteronomio 1:19–40).\n\n" +
					"El Salmo 95 advierte: No endurezcáis vuestro corazón como en el desierto, donde Dios estuvo disgustado cuarenta años (Salmos 95:8–11), y la carta a los Hebreos cita ese salmo a sus lectores y concluye que la generación del desierto no pudo entrar \"por causa de incredulidad\" (Hebreos 3:7–19). De los doce, solo Josué y Caleb vivieron para ver la tierra (Números 14:38; 32:12).",
			},
		},
		{
			title: "Gigantes y langostas",
			content: {
				kind: "reflection",
				prompt:
					"Diez espías miraron a los gigantes y se sintieron como langostas; Caleb y Josué miraron a los mismos gigantes y se acordaron de Dios. ¿Qué te parece demasiado grande en tu vida ahora mismo, y cómo sería verlo como lo vio Caleb?",
			},
			anchor: { book: "NUM", chapter: 14, verse: 9 },
		},
	],
};
