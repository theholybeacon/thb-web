import { GlobalStudyDef } from "../../globalStudy";

/** Hechos 9:1–31: Saulo se encuentra con Jesús en el camino a Damasco. */
export const DAMASCUS_ROAD_ES: GlobalStudyDef = {
	slug: "story-damascus-road-es",
	kind: "story",
	language: "es",
	name: "Saulo en el camino a Damasco",
	description:
		"El enemigo más feroz de la iglesia sale a arrestar creyentes, y lo detienen una luz del cielo y una voz que le pregunta por qué lo persigue. Tres días después, un discípulo asustado le impone las manos y lo llama hermano.",
	topic: "La conversión de Saulo, más tarde el apóstol Pablo, y sus primeros días como seguidor de Jesús (Hechos 9:1–31).",
	length: 2,
	depth: 4,
	sortOrder: 150,
	coversWholeCanon: false,
	steps: [
		{
			title: "El perseguidor",
			content: {
				kind: "text",
				body:
					"Saulo aparece por primera vez en el apedreamiento de Esteban, un seguidor de Jesús: los testigos pusieron sus ropas a sus pies, y Saulo consentía en su muerte (Hechos 7:58; 8:1). Después se dedicó a asolar la iglesia, entrando casa por casa y arrastrando a hombres y mujeres a la cárcel (Hechos 8:3).\n\n" +
					"Era natural de Tarso (Hechos 9:11), instruido en Jerusalén a los pies del maestro Gamaliel (Hechos 22:3), y fariseo (Filipenses 3:5). Estaba convencido, diría más tarde, de que debía hacer todo lo posible contra el nombre de Jesús (Hechos 26:9).",
			},
		},
		{
			book: "ACT",
			startChapter: 9,
			startVerse: 1,
			endVerse: 9,
			title: "La luz en el camino",
			explanation:
				"Saulo todavía respira amenazas y muerte, y lleva cartas para arrestar a cualquiera en Damasco que sea \"del Camino\" (9:1–2). Escucha la pregunta que hace la voz: ¿por qué me persigues (9:4)? Jesús considera que lo que se les hace a sus seguidores se le hace a él mismo (9:5). Fíjate en cómo el hombre que salió a atar a otros es llevado de la mano, ciego, durante tres días (9:8–9).",
		},
		{
			title: "La conversión de san Pablo",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/The_Conversion_of_Saint_Paul-Caravaggio_%28c._1600-1%29.jpg/1280px-The_Conversion_of_Saint_Paul-Caravaggio_%28c._1600-1%29.jpg",
				alt: "Una pintura oscura de un joven tendido en el suelo, cubriéndose los ojos con las manos, junto a un caballo encabritado. Un soldado anciano con casco de penacho sostiene una lanza sobre él, y desde la parte superior derecha una figura sostenida por un ángel se inclina hacia él.",
				caption:
					"Caravaggio pinta a Saulo derribado en el suelo, con las manos sobre los ojos. El caballo y el ángel son cosa del pintor; Hechos dice solo que Saulo cayó en tierra y que los hombres que iban con él se pararon atónitos (Hechos 9:4, 7).",
				credit: "Caravaggio, The Conversion of Saint Paul (c. 1600). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Conversion_of_Saint_Paul-Caravaggio_(c._1600-1).jpg",
			},
		},
		{
			book: "ACT",
			startChapter: 9,
			startVerse: 10,
			endVerse: 19,
			title: "Ananías",
			explanation:
				"Ponte en el lugar de Ananías: ha oído cuántos males ha hecho este hombre (9:13–14). Fíjate en lo que el Señor dice que será Saulo: un vaso escogido para llevar su nombre a los gentiles, a los reyes y a Israel, y alguien que padecerá por ello (9:15–16). Luego escucha las primeras palabras de Ananías: \"Saulo hermano\" (9:17).",
		},
		{
			title: "Ananías de Damasco",
			content: {
				kind: "character",
				entitySlug: "ananias_259",
				note:
					"Ananías aparece solo aquí y cuando Pablo vuelve a contar la historia, donde lo llama varón pío conforme a la Ley, que tenía buen testimonio de todos los judíos que vivían en Damasco (Hechos 22:12). Fue a ver al hombre que había venido a arrestar a creyentes como él porque el Señor se lo mandó (Hechos 9:15–17).",
			},
		},
		{
			title: "Saulo recobra la vista",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Saint_Paul_Ananias_Sight_Restored.jpg",
				alt: "Una pintura de un hombre arrodillado, con manto rojo y armadura y los ojos cerrados, mientras un anciano barbado con túnica dorada le pone una mano sobre la cabeza. Un soldado lo sostiene por detrás, un joven sujeta un caballo y una paloma brilla entre las nubes, en lo alto.",
				caption:
					"Ananías le impuso las manos a Saulo, y le cayeron de los ojos como escamas, y recobró la vista (Hechos 9:17–18).",
				credit: "Pietro da Cortona, Ananias Restoring the Sight of Saint Paul (c. 1631). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Saint_Paul_Ananias_Sight_Restored.jpg",
			},
		},
		{
			book: "ACT",
			startChapter: 9,
			startVerse: 20,
			endVerse: 31,
			title: "De cazador a perseguido",
			explanation:
				"Fíjate en la palabra \"luego\" (9:20): Saulo va directo a las sinagogas a predicar que Jesús es el Hijo de Dios. Los que lo oyen apenas pueden creerlo (9:21). En pocos días él es el perseguido, y escapa por el muro en una espuerta (9:23–25). En Jerusalén los discípulos le tienen miedo, hasta que Bernabé responde por él (9:26–27).",
		},
		{
			title: "Pablo",
			content: {
				kind: "character",
				entitySlug: "paul_2479",
				note:
					"Saulo también se llama Pablo (Hechos 13:9), el nombre que usa en sus cartas (Romanos 1:1). Nunca olvidó de dónde venía: se llamaba a sí mismo el más pequeño de los apóstoles, indigno de ser llamado apóstol, porque había perseguido a la iglesia de Dios (1 Corintios 15:9).",
			},
		},
		{
			title: "Pablo vuelve a contar la historia",
			content: {
				kind: "text",
				body:
					"Pablo mismo contó esta historia dos veces más en Hechos: ante una multitud hostil en Jerusalén (Hechos 22:3–16) y ante el rey Agripa (Hechos 26:9–18). En el segundo relato añade las palabras \"Dura cosa te es dar coces contra el aguijón\" (Hechos 26:14), y el encargo de abrir los ojos de la gente para que se conviertan de las tinieblas a la luz (Hechos 26:18).\n\n" +
					"En sus cartas lo resume en una frase: había perseguido sobremanera a la iglesia, pero Dios tuvo a bien revelar a su Hijo en él para que lo predicara entre los gentiles (Gálatas 1:13–16). Se llama a sí mismo el primero de los pecadores, alcanzado por la misericordia como ejemplo de la paciencia de Cristo (1 Timoteo 1:15–16).",
			},
		},
		{
			title: "¿Fuera de alcance?",
			content: {
				kind: "reflection",
				prompt:
					"Jesús detuvo al hombre que perseguía a su pueblo y envió a un creyente asustado a llamarlo \"hermano\". ¿Hay alguien a quien has dado por perdido, fuera del alcance de Dios? ¿O eres tú quien necesita oír que no lo estás?",
			},
			anchor: { book: "ACT", chapter: 9, verse: 17 },
		},
	],
};
