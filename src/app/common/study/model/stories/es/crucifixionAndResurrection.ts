import { GlobalStudyDef } from "../../globalStudy";

/** Lucas 23–24 y Juan 20: el juicio, la cruz, el sepulcro y Jesús resucitado. */
export const CRUCIFIXION_AND_RESURRECTION_ES: GlobalStudyDef = {
	slug: "story-crucifixion-and-resurrection-es",
	kind: "story",
	language: "es",
	name: "La cruz y el sepulcro vacío",
	description:
		"Un hombre inocente es condenado, crucificado entre dos malhechores y sepultado antes de la puesta del sol. Tres días después, las mujeres encuentran la piedra removida, y una amiga que llora lo oye llamarla por su nombre.",
	topic: "El juicio, la muerte y la sepultura de Jesús, y su resurrección (Lucas 23–24; Juan 20).",
	length: 3,
	depth: 5,
	sortOrder: 148,
	coversWholeCanon: false,
	steps: [
		{
			title: "La noche anterior",
			content: {
				kind: "text",
				body:
					"Después de la última cena, Jesús fue al monte de los Olivos a orar, y allí llegó Judas con una turba y lo arrestaron (Lucas 22:39, 47–54). En el patio del sumo sacerdote, Pedro negó tres veces que lo conocía (Lucas 22:54–62).\n\n" +
					"Al amanecer, el concilio interrogó a Jesús (Lucas 22:66–71). Luego lo llevaron ante Pilato, el gobernador romano, diciéndole que a ellos no les era lícito matar a nadie (Juan 18:31). Ahí comienza Lucas 23.",
			},
		},
		{
			book: "LUK",
			startChapter: 23,
			startVerse: 1,
			endVerse: 25,
			title: "Ante Pilato y Herodes",
			explanation:
				"Cuenta cuántas veces dice Pilato que no halla culpa en Jesús (23:4, 14, 22). Fíjate en que Herodes, que hacía tiempo deseaba verlo, no recibe ninguna respuesta (23:8–9). Y observa lo que elige la multitud: pide que suelten en su lugar a Barrabás, un hombre preso por sedición y homicidio (23:18–19, 25).",
		},
		{
			book: "LUK",
			startChapter: 23,
			startVerse: 26,
			endVerse: 56,
			title: "La cruz y la sepultura",
			explanation:
				"Escucha las tres cosas que Jesús dice desde la cruz en Lucas: una oración por los que lo crucifican (23:34), una promesa a un malhechor que muere a su lado (23:43) y sus últimas palabras, en las que encomienda su espíritu al Padre (23:46). Fíjate en quiénes miran: gobernantes y soldados que se burlan (23:35–36), un centurión que da gloria a Dios (23:47) y las mujeres de Galilea (23:49). Luego José de Arimatea pone el cuerpo en un sepulcro nuevo, y las mujeres ven dónde (23:50–55).",
		},
		{
			title: "Lo que nuestro Señor vio desde la cruz",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Brooklyn_Museum_-_What_Our_Lord_Saw_from_the_Cross_%28Ce_que_voyait_Notre-Seigneur_sur_la_Croix%29_-_James_Tissot.jpg/1280px-Brooklyn_Museum_-_What_Our_Lord_Saw_from_the_Cross_%28Ce_que_voyait_Notre-Seigneur_sur_la_Croix%29_-_James_Tissot.jpg",
				alt: "Una acuarela vista desde lo alto, que mira hacia una multitud en una ladera rocosa: soldados, hombres a caballo con ricas vestiduras y, en primer plano, un grupo de mujeres que lloran y un joven que mira hacia arriba.",
				caption:
					"Tissot pinta la escena desde la cruz misma, mirando los rostros desde arriba. Lucas nombra a los que estaban allí: el pueblo que miraba, los gobernantes que se burlaban, los soldados (Lucas 23:35–36) y las mujeres que lo habían seguido desde Galilea (23:49).",
				credit: "James Tissot, What Our Lord Saw from the Cross, de The Life of Our Lord Jesus Christ (1886–1894). Dominio público.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_What_Our_Lord_Saw_from_the_Cross_(Ce_que_voyait_Notre-Seigneur_sur_la_Croix)_-_James_Tissot.jpg",
			},
		},
		{
			book: "LUK",
			startChapter: 24,
			startVerse: 1,
			endVerse: 12,
			title: "El sepulcro vacío",
			explanation:
				"Las mujeres llegan con especias aromáticas y encuentran la piedra removida y ningún cuerpo (24:1–3). Escucha la pregunta de los dos varones con vestiduras resplandecientes: \"¿Por qué buscáis entre los muertos al que vive?\" (24:5). Fíjate en la palabra \"acordaos\" (24:6): Jesús les había dicho que esto sucedería. Los apóstoles lo toman por un desvarío, pero Pedro corre a ver (24:11–12).",
		},
		{
			book: "JHN",
			startChapter: 20,
			startVerse: 1,
			endVerse: 18,
			title: "María en el huerto",
			explanation:
				"Juan cuenta aquella mañana desde el lado de María Magdalena. Dos discípulos corren al sepulcro y ven los lienzos puestos allí (20:3–7). María se queda llorando y no reconoce a Jesús; piensa que es el hortelano (20:14–15). Observa lo que sucede cuando él dice una sola palabra: su nombre (20:16). Ella es la primera en anunciar \"que había visto al Señor\" (20:18).",
		},
		{
			title: "Jesús se aparece a María Magdalena",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Brooklyn_Museum_-_Jesus_Appears_to_Mary_Magdalene_%28Apparition_de_J%C3%A9sus_%C3%A0_Madeleine%29_-_James_Tissot.jpg",
				alt: "Una acuarela de una mujer con un manto oscuro en un sendero de un huerto junto a un sepulcro, volviéndose hacia atrás, mientras una figura vestida de blanco está de pie entre los árboles detrás de ella.",
				caption:
					"María se volvió y vio a Jesús que estaba allí, pero no sabía que era Jesús (Juan 20:14).",
				credit: "James Tissot, Jesus Appears to Mary Magdalene, de The Life of Our Lord Jesus Christ (1886–1894). Dominio público.",
				sourceUrl:
					"https://commons.wikimedia.org/wiki/File:Brooklyn_Museum_-_Jesus_Appears_to_Mary_Magdalene_(Apparition_de_J%C3%A9sus_%C3%A0_Madeleine)_-_James_Tissot.jpg",
			},
		},
		{
			title: "María Magdalena",
			content: {
				kind: "character",
				entitySlug: "mary_1943",
				note:
					"María Magdalena era una de las mujeres que siguieron a Jesús desde Galilea, una mujer de la cual habían salido siete demonios (Lucas 8:2). Estuvo junto a la cruz (Juan 19:25), y en el Evangelio de Juan es la primera en ver a Jesús resucitado y la que él envía a avisar a los demás (Juan 20:14–18).",
			},
		},
		{
			book: "JHN",
			startChapter: 20,
			startVerse: 19,
			endVerse: 31,
			title: "Tomás",
			explanation:
				"Los discípulos están tras las puertas cerradas por miedo (20:19). Fíjate en las primeras palabras de Jesús, que se repiten tres veces en este pasaje: \"Paz a vosotros\" (20:19, 21, 26). Tomás no quiere creer sin tocar las heridas (20:25); una semana después dice: \"¡Señor mío, y Dios mío!\" (20:28). Luego Juan te dice por qué escribió su libro (20:31).",
		},
		{
			title: "La resurrección en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"La tarde de aquel primer día, Jesús abrió el entendimiento de sus discípulos para que comprendieran las Escrituras: estaba escrito que el Cristo padecería y resucitaría de los muertos al tercer día (Lucas 24:44–46).\n\n" +
					"Más tarde Pablo resumió lo que había recibido y transmitido como lo primero en importancia: que Cristo murió por nuestros pecados conforme a las Escrituras, que fue sepultado, que resucitó al tercer día, y que apareció a Pedro, a los doce y a más de quinientas personas a la vez, la mayoría de las cuales aún vivían cuando él escribió (1 Corintios 15:3–6).",
			},
		},
		{
			title: "Para que creas",
			content: {
				kind: "reflection",
				prompt:
					"Juan dice que escribió todo esto para que creas y tengas vida en el nombre de Jesús (Juan 20:31). De los que estuvieron en el sepulcro (María, Pedro, Tomás), ¿cuál se parece más a tu respuesta ahora mismo? ¿Qué haría falta para que dijeras lo que dijo Tomás?",
			},
			anchor: { book: "JHN", chapter: 20, verse: 31 },
		},
	],
};
