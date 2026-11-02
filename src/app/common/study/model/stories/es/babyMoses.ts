import { GlobalStudyDef } from "../../globalStudy";

/** Éxodo 1–2: la esclavitud en Egipto, el bebé en la canasta y Moisés ya adulto. */
export const BABY_MOSES_ES: GlobalStudyDef = {
	slug: "story-baby-moses-es",
	kind: "story",
	language: "es",
	name: "El bebé Moisés en la canasta",
	description:
		"Un rey ordena echar al Nilo a todo niño hebreo que nazca, y una madre esconde a su hijo en una canasta entre los juncos. Lee cómo es hallado, cómo recibe su nombre y cómo es criado, y cómo Dios ya estaba obrando mucho antes de que alguien dijera su nombre.",
	topic: "La opresión de Israel en Egipto, el nacimiento y rescate de Moisés, y su huida a Madián (Éxodo 1–2).",
	length: 2,
	depth: 3,
	sortOrder: 112,
	coversWholeCanon: false,
	steps: [
		{
			title: "Un nuevo rey en Egipto",
			content: {
				kind: "text",
				body:
					"Génesis termina con la familia de Jacob establecida en Egipto, con tierras y alimentada por José durante el hambre (Génesis 47:11–12). Éxodo comienza contándolos: setenta personas descendieron con Jacob (Éxodo 1:5). Luego murieron José y toda aquella generación (1:6), y la familia creció hasta llenar la tierra (1:7).\n\n" +
					"Entonces se levantó sobre Egipto un nuevo rey que no conocía a José (1:8). Miró a un pueblo que crecía y vio una amenaza (1:9–10). La historia de Moisés comienza con miedo, con trabajos forzados y con un rey que intenta resolver su problema con la vida de los bebés.",
			},
		},
		{
			book: "EXO",
			startChapter: 1,
			title: "Esclavitud, y dos parteras valientes",
			explanation:
				"Observa cómo se va endureciendo el plan del rey: trabajo duro (1:11–14), luego órdenes secretas a las parteras (1:16), y después un mandato público de echar al río a todo niño recién nacido (1:22). Fíjate en quiénes se interponen: dos mujeres, Sifra y Fúa, que temieron a Dios más que al rey (1:17). En este capítulo nunca se dice el nombre del rey; el de las parteras, sí.",
		},
		{
			title: "El niño en el Nilo",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/030.The_Child_Moses_on_the_Nile.jpg/1280px-030.The_Child_Moses_on_the_Nile.jpg",
				alt: "Un grabado de un bebé dormido en una pequeña canasta que flota sobre un río oscuro entre juncos, con ángeles que vuelan sobre él bajo un cielo iluminado por la luna.",
				caption:
					"Doré llenó de ángeles el cielo nocturno sobre la canasta. El texto le da al bebé otra vigilante: su hermana, que se quedó a lo lejos para ver qué le pasaría (Éxodo 2:4).",
				credit: "Gustave Doré, The Child Moses on the Nile, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:030.The_Child_Moses_on_the_Nile.jpg",
			},
		},
		{
			book: "EXO",
			startChapter: 2,
			startVerse: 1,
			endVerse: 10,
			title: "Una canasta entre los juncos",
			explanation:
				"Fíjate en cuánto sucede a través de mujeres: una madre que esconde a su hijo durante tres meses (2:2), una hermana que vigila (2:4), y la propia hija de Faraón, que oye llorar al bebé y tiene compasión de él (2:6). Observa la rapidez de la hermana en el versículo 7: la madre termina recibiendo un salario por criar a su propio hijo (2:9). El nombre de Moisés se explica con las palabras de la princesa: \"de las aguas lo saqué\" (2:10).",
		},
		{
			title: "El hallazgo de Moisés",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/031.The_Finding_of_Moses.jpg/1280px-031.The_Finding_of_Moses.jpg",
				alt: "Un grabado de una princesa egipcia ricamente vestida, de pie junto a un río con sirvientes que sostienen abanicos de plumas, mientras una mujer arrodillada se inclina hacia un bebé acostado en una canasta a la orilla del agua.",
				caption: "La hija de Faraón ve la canasta entre los juncos y envía a su criada a traerla (Éxodo 2:5).",
				credit: "Gustave Doré, The Finding of Moses, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:031.The_Finding_of_Moses.jpg",
			},
		},
		{
			title: "La hija de Faraón",
			content: {
				kind: "character",
				entitySlug: "daughter_of_pharaoh_988",
				note:
					"Ella vio enseguida que era un bebé hebreo (Éxodo 2:6), uno de los mismos niños que su padre había mandado ahogar (1:22), y aun así lo salvó. Moisés llegó a ser su hijo (2:10), y el Nuevo Testamento recuerda que ella lo crió como suyo (Hechos 7:21).",
			},
		},
		{
			book: "EXO",
			startChapter: 2,
			startVerse: 11,
			endVerse: 25,
			title: "Moisés crece y huye",
			explanation:
				"Moisés ve a un egipcio golpeando a un hebreo y lo mata (2:11–12), y al día siguiente descubre que su propio pueblo no lo quiere como juez (2:14). Huye a Madián, se casa con Séfora y le pone a su hijo un nombre que dice lo que siente: forastero en tierra ajena (2:22). Luego lee despacio los últimos tres versículos. En todo el capítulo no se ha nombrado a Dios ni una vez, y ahora él oye, se acuerda, mira y reconoce (2:23–25).",
		},
		{
			title: "Moisés",
			content: {
				kind: "character",
				entitySlug: "moses_2108",
				note:
					"Nacido bajo una sentencia de muerte, criado en la casa de Faraón y, al final de este capítulo, pastor en el exilio. El Nuevo Testamento dice que fue enseñado en toda la sabiduría de los egipcios (Hechos 7:22), y que más tarde, por la fe, rehusó llamarse hijo de la hija de Faraón (Hebreos 11:24).",
			},
		},
		{
			title: "El nacimiento de Moisés en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"Éxodo 2 no da el nombre de los padres de Moisés, pero una genealogía posterior sí: Amram y Jocabed, de la tribu de Leví (Éxodo 6:20). La única hermana de Moisés que la Biblia nombra es María (Números 26:59).\n\n" +
					"El Nuevo Testamento recuerda que esconder al bebé fue un acto de fe: sus padres lo escondieron durante tres meses y no temieron el decreto del rey (Hebreos 11:23). Y el mismo patrón vuelve al comienzo de los Evangelios, cuando el rey Herodes manda matar a los niños de Belén (Mateo 2:16) y Jesús es llevado a salvo a Egipto (Mateo 2:14).",
			},
		},
		{
			title: "Dios obrando sin ser visto",
			content: {
				kind: "reflection",
				prompt:
					"En Éxodo 2, Dios no se menciona hasta el final, y sin embargo estaba obrando a través de una madre, una hermana y una princesa. Mirando hacia atrás, ¿dónde puedes ver que Dios estaba obrando en tu vida antes de que te dieras cuenta?",
			},
			anchor: { book: "EXO", chapter: 2, verse: 25 },
		},
	],
};
