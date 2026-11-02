import { GlobalStudyDef } from "../../globalStudy";

/** Rut 1–4: Noemí, Rut y Booz, desde el hambre hasta la familia de David. */
export const RUTH_ES: GlobalStudyDef = {
	slug: "story-ruth-es",
	kind: "story",
	language: "es",
	name: "Rut y Noemí",
	description:
		"Una viuda vuelve a casa vacía y amargada, seguida por una nuera extranjera que se niega a dejarla. Lee una historia sencilla de lealtad, bondad y un redentor, que termina con el abuelo del rey David.",
	topic: "La historia de Rut, Noemí y Booz, de Moab a Belén (Rut 1–4).",
	length: 2,
	depth: 4,
	sortOrder: 125,
	coversWholeCanon: false,
	steps: [
		{
			title: "Cuando gobernaban los jueces",
			content: {
				kind: "text",
				body:
					"El libro de Rut transcurre \"en los días que gobernaban los jueces\" (Rut 1:1), los mismos años inestables de Débora, Gedeón y Sansón. Un hambre obligó a un hombre de Belén llamado Elimelec a irse con su esposa Noemí y sus dos hijos a vivir a la tierra de Moab, al este de Israel (Rut 1:1–2).\n\n" +
					"Dos leyes de Moisés ayudan a entender la historia. Los agricultores debían dejar sin segar las orillas de sus campos y no recoger las espigas caídas, para que los pobres y los extranjeros pudieran recogerlas; a eso se le llama espigar (Levítico 19:9–10). Y cuando alguien caía en la pobreza y tenía que vender su tierra, el pariente más cercano debía intervenir para rescatarla (Levítico 25:25).",
			},
		},
		{
			book: "RUT",
			startChapter: 1,
			title: "Donde quiera que tú fueres, iré yo",
			explanation:
				"En cinco versículos Noemí pierde a su esposo y a sus dos hijos (1:3–5). Fíjate en que ella insiste en que sus nueras vuelvan a su casa, y en que Orfa se despide con un beso mientras Rut se queda abrazada a ella (1:14). La promesa de Rut en los versículos 16–17 es el corazón del capítulo. Luego escucha a Noemí en Belén: se fue llena y el SEÑOR la ha hecho volver vacía (1:21). Presta atención al último versículo: es el comienzo de la cosecha de la cebada.",
		},
		{
			title: "Noemí y sus nueras",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/068.Naomi_and_Her_Daughters-in-Law.jpg/1280px-068.Naomi_and_Her_Daughters-in-Law.jpg",
				alt: "Un grabado de dos mujeres abrazadas en lo alto de una colina desnuda, mientras una tercera mujer se aleja de ellas con el rostro entre las manos.",
				caption: "Orfa besó a su suegra para despedirse, pero Rut se quedó con ella (Rut 1:14).",
				credit: "Gustave Doré, Naomi and Her Daughters-in-Law, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:068.Naomi_and_Her_Daughters-in-Law.jpg",
			},
		},
		{
			title: "Rut",
			content: {
				kind: "character",
				entitySlug: "ruth_2450",
				note:
					"Rut era una mujer moabita que se casó con alguien de una familia israelita (Rut 1:4). Booz dice que todo el pueblo sabe que es una mujer virtuosa (3:11), y Mateo la nombra en la genealogía de Jesús (Mateo 1:5).",
			},
		},
		{
			book: "RUT",
			startChapter: 2,
			title: "Espigando en el campo de Booz",
			explanation:
				"Rut sale a espigar, y da la casualidad de que llega a la parte del campo que pertenece a Booz (2:3). Fíjate en cómo Booz saluda a sus segadores en el nombre del SEÑOR (2:4), y en todo lo que ya ha oído sobre lo que Rut hizo por Noemí (2:11). Presta atención a su oración en el versículo 12, sobre el Dios bajo cuyas alas ella ha venido a refugiarse, y a la sorpresa de Noemí al final del capítulo: ese hombre es uno de sus redentores (2:20).",
		},
		{
			title: "Booz",
			content: {
				kind: "character",
				entitySlug: "boaz_519",
				note:
					"Booz era pariente del esposo de Noemí, un hombre importante de la familia de Elimelec (Rut 2:1). En la genealogía de Jesús que da Mateo, es hijo de Salmón y Rahab, y padre de Obed, que tuvo con Rut (Mateo 1:5).",
			},
		},
		{
			title: "Rut en los campos de Booz",
			content: {
				kind: "image",
				url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/069.Ruth_and_Boaz.jpg/1280px-069.Ruth_and_Boaz.jpg",
				alt: "Un grabado de una joven arrodillada recogiendo espigas en un campo, mientras detrás de ella hay segadores con gavillas y al fondo pasan hombres montados en camellos.",
				caption: "Booz le dijo a Rut que se quedara junto a sus criadas y que no fuera a espigar a ningún otro campo (Rut 2:8).",
				credit: "Gustave Doré, Ruth and Boaz, de La Grande Bible de Tours (1866). Dominio público.",
				sourceUrl: "https://commons.wikimedia.org/wiki/File:069.Ruth_and_Boaz.jpg",
			},
		},
		{
			book: "RUT",
			startChapter: 3,
			title: "En la era",
			explanation:
				"Ahora Noemí busca descanso y seguridad para Rut (3:1). Fíjate en lo que Rut le pide a Booz en el versículo 9: que extienda el borde de su manto sobre ella, porque él es un redentor. En hebreo es la misma palabra que las alas de 2:12: a Booz se le pide que sea parte de la respuesta a su propia oración. Presta atención al obstáculo del versículo 12: hay un pariente más cercano.",
		},
		{
			book: "RUT",
			startChapter: 4,
			title: "El redentor a la puerta de la ciudad",
			explanation:
				"El asunto se resuelve en público, ante diez ancianos a la puerta de la ciudad (4:1–2). Fíjate en por qué el pariente más cercano se hace a un lado (4:6), y en cómo Booz toma a Rut por esposa (4:10, 4:13). Escucha a las mujeres de Belén alabar al SEÑOR por no haber dejado a Noemí sin redentor (4:14), y observa cómo los últimos versículos llevan la historia hasta David (4:17–22).",
		},
		{
			title: "Rut en el resto de la Biblia",
			content: {
				kind: "text",
				body:
					"El libro termina con una genealogía: Obed, el hijo de Rut, fue el padre de Isaí, e Isaí fue el padre de David (Rut 4:17, 4:21–22). Una viuda extranjera que llegó a Belén sin nada se convirtió en la bisabuela del rey más grande de Israel.\n\n" +
					"El Evangelio de Mateo comienza con la genealogía de Jesús y nombra en ella a Rut, una de las pocas mujeres que aparecen allí, junto a Tamar, Rahab, \"la que fue mujer de Urías\" y María (Mateo 1:3, 1:5–6, 1:16). Siglos después, José y María subieron a Belén, la ciudad de David, donde nació Jesús (Lucas 2:4–7).",
			},
		},
		{
			title: "Bajo sus alas",
			content: {
				kind: "reflection",
				prompt:
					"Rut se quedó con Noemí cuando irse habría sido más fácil, y encontró refugio bajo las alas del Dios de Israel (Rut 1:16; 2:12). ¿A quién ha puesto Dios a tu lado para que le seas fiel, y en qué área se te pide confiar en su cuidado?",
			},
			anchor: { book: "RUT", chapter: 1, verse: 16 },
		},
	],
};
