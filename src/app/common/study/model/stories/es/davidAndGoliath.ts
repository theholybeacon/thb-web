import { GlobalStudyDef } from "../../globalStudy";

/** 1 Samuel 17: el joven pastor y el campeón de Gat. */
export const DAVID_AND_GOLIATH_ES: GlobalStudyDef = {
	slug: "story-david-and-goliath-es",
	kind: "story",
	language: "es",
	name: "David y Goliat",
	description:
		"Durante cuarenta días un gigante se burla de los ejércitos de Israel y nadie se atreve a enfrentarlo, hasta que llega un joven pastor con pan para sus hermanos. Lee la famosa pelea, y lo que David dijo que estaba realmente en juego.",
	topic: "La historia de David y Goliat en el valle de Ela (1 Samuel 17).",
	length: 1,
	depth: 3,
	sortOrder: 127,
	coversWholeCanon: false,
	steps: [
		{
			title: "Un rey desechado, un pastor escogido",
			content: {
				kind: "text",
				body:
					"Israel tenía su primer rey, Saúl, pero él desobedeció a Dios, y Samuel le dijo que el SEÑOR lo había desechado como rey (1 Samuel 15:26). Entonces Dios envió a Samuel a Belén, a la familia de Isaí, y pasó por alto a todos los hijos mayores para escoger al menor, que estaba afuera cuidando las ovejas (1 Samuel 16:10–13). El SEÑOR le dijo a Samuel que él no mira la apariencia exterior, sino el corazón (1 Samuel 16:7).\n\n" +
					"Samuel ungió a David, y desde aquel día el Espíritu del SEÑOR vino sobre él (1 Samuel 16:13). Por ahora seguía siendo un pastor, que además tocaba el arpa para el rey atormentado (1 Samuel 16:23). Mientras tanto, los filisteos fueron enemigos constantes de Israel durante todo el reinado de Saúl (1 Samuel 14:52).",
			},
		},
		{
			book: "1SA",
			startChapter: 17,
			startVerse: 1,
			endVerse: 30,
			title: "El gigante en el valle",
			explanation:
				"Fíjate en cuánto espacio dedica el capítulo a la armadura y las armas de Goliat (17:4–7), y en cómo reaccionan Saúl y todo Israel ante su desafío: se turban y tienen mucho miedo (17:11). Él sale mañana y tarde durante cuarenta días (17:16). Entonces llega David, enviado por su padre con un encargo (17:17–20). Presta atención a su primera pregunta en el versículo 26: ¿quién es este hombre para provocar a los escuadrones del Dios viviente?",
		},
		{
			title: "David",
			content: {
				kind: "character",
				entitySlug: "david_994",
				note:
					"David era el menor de los ocho hijos de Isaí, de Belén (1 Samuel 17:12–14), y llegó a ser el rey más grande de Israel. Samuel le había dicho a Saúl que el SEÑOR buscaría un hombre conforme a su corazón (1 Samuel 13:14), palabras que Pablo aplicó después a David (Hechos 13:22).",
			},
		},
		{
			book: "1SA",
			startChapter: 17,
			startVerse: 31,
			endVerse: 40,
			title: "El león y el oso",
			explanation:
				"Saúl solo ve a un muchacho (17:33). Fíjate en que David responde con su experiencia como pastor, rescatando corderos de un león y de un oso (17:34–36), y luego le da el mérito al SEÑOR que lo libró (17:37). Se prueba la armadura del rey y se la quita, porque nunca la ha usado (17:38–39). Observa lo que escoge en su lugar (17:40).",
		},
		{
			book: "1SA",
			startChapter: 17,
			startVerse: 41,
			endVerse: 58,
			title: "La batalla es del SEÑOR",
			explanation:
				"Antes de que se lance una sola piedra, escucha los dos discursos. Goliat maldice a David por sus dioses (17:43–44); David responde que viene en el nombre del SEÑOR de los ejércitos, para que toda la tierra sepa que hay Dios en Israel (17:45–46). El versículo 47 es el corazón del capítulo: la batalla es del SEÑOR. Fíjate también en el versículo 50: David no tenía espada en la mano.",
		},
		{
			title: "David y Goliat",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/071A.David_Slays_Goliath.jpg/1280px-071A.David_Slays_Goliath.jpg",
				alt: "Un grabado de un joven de pie sobre el cuerpo de un gigante caído con armadura de escamas, sosteniendo en alto la cabeza cortada del gigante, mientras detrás de él unos soldados con lanzas levantan los brazos.",
				caption:
					"David se puso sobre el filisteo y tomó su espada, y cuando los filisteos vieron muerto a su campeón, huyeron (1 Samuel 17:51).",
				credit: "Gustave Doré, David Slays Goliath, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:071A.David_Slays_Goliath.jpg",
			},
		},
		{
			title: "Después del gigante",
			content: {
				kind: "text",
				body:
					"La victoria cambió la vida de David. Cuando el ejército volvió a casa, las mujeres cantaban que Saúl había herido a sus miles y David a sus diez miles, y desde aquel día Saúl miró a David con recelo (1 Samuel 18:6–9). Años después, huyendo para salvar su vida, David recibió la propia espada de Goliat, que el sacerdote de Nob guardaba envuelta en un paño (1 Samuel 21:1, 21:8–9).\n\n" +
					"La confianza que David expresó en el valle recorre los salmos que llevan su nombre: el SEÑOR es su roca y su libertador (Salmos 18:2), y unos confían en carros y otros en caballos, pero nosotros confiamos en el nombre del SEÑOR nuestro Dios (Salmos 20:7).",
			},
		},
		{
			title: "Lo que Dios ya ha hecho",
			content: {
				kind: "reflection",
				prompt:
					"David enfrentó a Goliat recordando cómo Dios lo había rescatado en los campos donde cuidaba las ovejas (1 Samuel 17:37). ¿De qué te ha sacado Dios ya que podría darte valor para lo que enfrentas ahora?",
			},
			anchor: { book: "1SA", chapter: 17, verse: 47 },
		},
	],
};
