import { GlobalStudyDef } from "../../globalStudy";

/** Génesis 11: la torre, la dispersión y la familia de Abram. */
export const TOWER_OF_BABEL_ES: GlobalStudyDef = {
	slug: "story-tower-of-babel-es",
	kind: "story",
	language: "es",
	name: "La torre de Babel",
	description:
		"Todo el mundo habla una misma lengua, y la gente decide construir una torre que llegue al cielo y hacerse un nombre. Lee lo que Dios hace al respecto, y cómo el capítulo termina con una familia a la que Dios le dará un nombre.",
	topic: "La historia de la torre de Babel, la dispersión de las naciones y la línea familiar que lleva hasta Abram (Génesis 11).",
	length: 1,
	depth: 3,
	sortOrder: 105,
	coversWholeCanon: false,
	steps: [
		{
			title: "Después del diluvio",
			content: {
				kind: "text",
				body:
					"Cuando Noé y su familia salieron del arca, Dios los bendijo y les dijo que fructificaran, se multiplicaran y llenaran la tierra (Génesis 9:1). Génesis 10 enumera las familias que salieron de los hijos de Noé, repartidas por sus tierras, cada una con su propia lengua (Génesis 10:5, 20, 31). Una de ellas es Nimrod, cuyo reino comenzó en Babel, en la tierra de Sinar (Génesis 10:8–10).\n\n" +
					"Génesis 11 cuenta cómo la única lengua de la tierra se convirtió en muchas, y empieza en esa misma tierra de Sinar (Génesis 11:2).",
			},
		},
		{
			book: "GEN",
			startChapter: 11,
			startVerse: 1,
			endVerse: 9,
			title: "Hagámonos un nombre",
			explanation:
				"Fíjate en lo que quieren los constructores: una ciudad y una torre cuya cúspide llegue al cielo, un nombre para sí mismos, y no ser esparcidos por la tierra (11:4), justo lo contrario de lo que Dios le dijo a la familia de Noé (9:1). Luego observa el versículo 5: construyen una torre para alcanzar el cielo, y el SEÑOR desciende para verla. Fíjate también en el eco de \"vamos\": lo dice la gente (11:3–4), y luego lo dice Dios (11:7).",
		},
		{
			title: "La confusión de las lenguas",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/010.The_Tower_of_Babel.jpg/1280px-010.The_Tower_of_Babel.jpg",
				alt: "Un grabado de una torre enorme que se eleva por niveles hasta las nubes; en primer plano, personas sentadas y de pie entre grandes piedras talladas, algunas con las manos en la cabeza, mientras un hombre levanta los dos brazos al cielo.",
				caption:
					"La ciudad se llamó Babel, porque allí confundió el SEÑOR el lenguaje de toda la tierra, y desde allí los esparció (Génesis 11:9).",
				credit: "Gustave Doré, The Confusion of Tongues, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:010.The_Tower_of_Babel.jpg",
			},
		},
		{
			book: "GEN",
			startChapter: 11,
			startVerse: 10,
			endVerse: 26,
			title: "De Sem a Abram",
			explanation:
				"Después de la dispersión de todas las naciones, Génesis sigue una sola línea de descendientes: diez generaciones desde Sem, hijo de Noé (11:10), hasta Abram. Fíjate cómo la lista se va estrechando, de toda la tierra a un solo hombre y sus hijos. Termina con Taré, padre de Abram, Nacor y Harán (11:26).",
		},
		{
			book: "GEN",
			startChapter: 11,
			startVerse: 27,
			endVerse: 32,
			title: "La familia de Taré",
			explanation:
				"Presta atención a dos detalles de los que dependen los capítulos siguientes. Sarai, la esposa de Abram, es estéril: no tiene hijos (11:30). Y la familia sale de Ur rumbo a la tierra de Canaán, pero se detiene en Harán y se queda a vivir allí (11:31).",
		},
		{
			title: "Abram",
			content: {
				kind: "character",
				entitySlug: "abraham_58",
				note:
					"Génesis 11 termina con Abram, hijo de Taré (Génesis 11:26–27). En el capítulo siguiente Dios le promete lo que los constructores de Babel quisieron arrebatar por su cuenta: \"engrandeceré tu nombre\" (12:2), y en él serán benditas todas las familias de la tierra (12:3).",
			},
		},
		{
			title: "Babel en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"El profeta Sofonías anuncia un día en que Dios dará a los pueblos un lenguaje puro, para que todos invoquen el nombre del SEÑOR y le sirvan juntos (Sofonías 3:9).\n\n" +
					"En Pentecostés, el Espíritu Santo vino sobre los seguidores de Jesús y hablaron en otras lenguas, y una multitud de todas las naciones debajo del cielo los oyó, cada uno en su propia lengua (Hechos 2:4–6). En Babel, la lengua dispersó a la gente. En el último libro de la Biblia, Juan ve una gran multitud de todas las naciones, tribus, pueblos y lenguas, de pie juntos delante del trono de Dios (Apocalipsis 7:9).",
			},
		},
		{
			title: "¿El nombre de quién?",
			content: {
				kind: "reflection",
				prompt:
					"Los constructores de Babel querían hacerse un nombre; un capítulo después, Dios le prometió a Abram que él engrandecería su nombre. ¿En qué te estás esforzando más por hacerte un nombre, y cómo sería confiarle eso a Dios?",
			},
			anchor: { book: "GEN", chapter: 11, verse: 4 },
		},
	],
};
