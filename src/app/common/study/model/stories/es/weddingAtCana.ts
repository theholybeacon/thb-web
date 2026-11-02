import { GlobalStudyDef } from "../../globalStudy";

/** Juan 2: el agua convertida en vino en Caná, y Jesús en el templo. */
export const WEDDING_AT_CANA_ES: GlobalStudyDef = {
	slug: "story-wedding-at-cana-es",
	kind: "story",
	language: "es",
	name: "Las bodas de Caná",
	description:
		"En una boda de pueblo se acaba el vino, y la madre de Jesús acude a él. Lee la primera señal del Evangelio de Juan, tan discreta que el encargado del banquete nunca supo de dónde había salido el vino, y la escena en el templo que viene después.",
	topic: "Jesús convierte el agua en vino en una boda en Caná, la primera de sus señales, y purifica el templo de Jerusalén (Juan 2).",
	length: 1,
	depth: 3,
	sortOrder: 140,
	coversWholeCanon: false,
	steps: [
		{
			title: "Una boda en Galilea",
			content: {
				kind: "text",
				body:
					"Caná de Galilea era el pueblo de Natanael (Juan 21:2). Justo antes de esta historia, Jesús había llamado a sus primeros discípulos, entre ellos a Natanael (Juan 1:35–51).\n\n" +
					"Al tercer día se celebraron unas bodas en Caná. La madre de Jesús estaba allí, y también habían sido invitados Jesús y sus discípulos (Juan 2:1–2). El problema de esta historia es pequeño y cotidiano, y aquí es donde comienzan las señales de Jesús (Juan 2:11).",
			},
		},
		{
			book: "JHN",
			startChapter: 2,
			startVerse: 1,
			endVerse: 5,
			title: "No tienen vino",
			explanation:
				"Fíjate en las pocas palabras que usa María: simplemente le cuenta a Jesús el problema (2:3). La respuesta de él habla de su hora, que aún no ha venido (2:4). Luego observa lo que hace María: no discute, sino que se vuelve a los sirvientes y les dice que hagan todo lo que él les diga (2:5).",
		},
		{
			title: "María, la madre de Jesús",
			content: {
				kind: "character",
				entitySlug: "mary_1938",
				note:
					"Juan nunca dice su nombre; siempre es \"la madre de Jesús\" (Juan 2:1). Aquí Jesús la llama \"Mujer\" (2:4), la misma palabra que usará con ella desde la cruz, cuando la deja al cuidado de su discípulo (Juan 19:26–27).",
			},
		},
		{
			book: "JHN",
			startChapter: 2,
			startVerse: 6,
			endVerse: 12,
			title: "Seis tinajas de piedra",
			explanation:
				"Fíjate para qué servían las tinajas: para los ritos de purificación de los judíos (2:6). Los sirvientes las llenan hasta arriba (2:7). Observa quién sabe lo que ha pasado y quién no: el encargado del banquete no tiene idea, pero los sirvientes que sacaron el agua sí lo saben (2:9). El versículo 11 te dice por qué Juan lo dejó escrito.",
		},
		{
			title: "Las bodas de Caná",
			content: {
				kind: "image",
				url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Marriage_at_Cana_engraving_by_Gustave_Dor%C3%A9.jpg",
				alt: "Un grabado de un banquete de bodas bajo un toldo a rayas en una terraza elevada, con invitados a lo largo de una mesa; en primer plano, unos sirvientes se agachan junto a grandes tinajas de barro mientras otros las cargan sobre los hombros.",
				caption:
					"Doré pone en primer plano a los sirvientes y sus tinajas, los que sabían de dónde había salido el buen vino (Juan 2:9).",
				credit: "Gustave Doré, The Marriage at Cana, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:Marriage_at_Cana_engraving_by_Gustave_Dor%C3%A9.jpg",
			},
		},
		{
			title: "La primera de sus señales",
			content: {
				kind: "text",
				body:
					"Juan llama \"señales\" a los milagros de Jesús (Juan 2:11; 20:30). Esta fue la primera, y por medio de ella Jesús manifestó su gloria, y sus discípulos creyeron en él (Juan 2:11). La segunda señal también ocurrió en Caná, cuando Jesús sanó a distancia al hijo de un oficial del rey (Juan 4:46–54).\n\n" +
					"Cerca del final de su Evangelio, Juan explica por qué escribió estas señales: para que creas que Jesús es el Cristo, el Hijo de Dios, y para que, creyendo, tengas vida en su nombre (Juan 20:30–31).",
			},
		},
		{
			book: "JHN",
			startChapter: 2,
			startVerse: 13,
			endVerse: 25,
			title: "En el templo",
			explanation:
				"De una boda al templo en la Pascua. Fíjate en qué enoja a Jesús: la casa de su Padre convertida en casa de mercado (2:16). Escucha la extraña respuesta que da cuando le piden una señal (2:19), y la nota de Juan sobre lo que quiso decir (2:21). Los discípulos lo entendieron solo después de que resucitó de entre los muertos (2:22).",
		},
		{
			title: "Jesús",
			content: {
				kind: "character",
				entitySlug: "jesus_905",
				note:
					"El Evangelio de Juan comienza llamando a Jesús el Verbo que estaba con Dios, y que se hizo carne y habitó entre nosotros; \"y vimos su gloria\" (Juan 1:1, 1:14). En Caná, dice Juan, Jesús manifestó por primera vez esa gloria (Juan 2:11).",
			},
		},
		{
			title: "Haced todo lo que os dijere",
			content: {
				kind: "reflection",
				prompt:
					"María no sabía lo que Jesús iba a hacer, pero les dijo a los sirvientes que hicieran todo lo que él les dijera. ¿Qué necesidad tienes que llevarle a Jesús, para luego confiarle la respuesta?",
			},
			anchor: { book: "JHN", chapter: 2, verse: 5 },
		},
	],
};
