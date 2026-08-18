import { GlobalStudyDef } from "../globalStudy";

/**
 * "Just read the Bible" — the whole canon, in the order the events happened
 * rather than the order the books are bound in.
 *
 * Two deliberate simplifications, both stated in the study's description so the
 * reader is not misled:
 *
 *  1. The plan is chronological at the level of books and sections, not
 *     individual chapters. Psalms is read as its own five books beside David's
 *     reign rather than scattered psalm-by-psalm across five centuries, because
 *     the Psalter's internal order is not chronological — a chapter-range step
 *     could not place Psalm 137 (exilic) between 136 and 138 without one step
 *     per psalm, and 150 one-chapter steps would bury the plan.
 *  2. The four Gospels are read one after another rather than harmonized into a
 *     single interleaved life of Christ, which would need pericope-level steps
 *     (study_step addresses a chapter range in one book) and would commit the
 *     plan to one particular harmony.
 *
 * Everything else follows the standard chronological arrangement: Job in the
 * patriarchal era, Chronicles beside Samuel and Kings, each prophet against the
 * reign he spoke into, and the epistles interleaved into the journeys of Acts.
 *
 * Every canonical chapter appears exactly once — enforced by
 * validateGlobalStudy, which the seed script runs before writing anything.
 */
export const CHRONOLOGICAL_PLAN: GlobalStudyDef = {
	slug: "chronological",
	name: "Just Read the Bible",
	description:
		"The whole Bible, in the order the events happened. Job sits with the patriarchs, Chronicles beside Samuel and Kings, each prophet in the reign he preached to, and the letters of Paul interleaved into the journeys of Acts. 102 readings covering all 1,189 chapters exactly once. Chronological by book and section rather than chapter by chapter: the Psalms are read as their own five books beside David's reign, and the four Gospels one after another rather than harmonized.",
	topic:
		"Read the entire Bible from Genesis to Revelation in chronological order, with each book and section placed at the point in history where it belongs.",
	length: 10,
	depth: 5,
	sortOrder: 1,
	coversWholeCanon: true,
	steps: [
		// --- Beginnings ---------------------------------------------------------
		{
			book: "GEN", startChapter: 1, endChapter: 11,
			title: "In the Beginning",
			explanation: "Creation, the fall, the flood and Babel — the world before Abraham. Almost everything the rest of the Bible assumes about God, humanity and sin is established in these eleven chapters.",
		},
		{
			book: "JOB",
			title: "The Man from Uz",
			explanation: "Job names no king, no temple and no law of Moses, and counts his wealth in livestock — marks of the patriarchal age, which is why a chronological reading puts him this early. The oldest question in scripture: why do the righteous suffer?",
		},
		{
			book: "GEN", startChapter: 12, endChapter: 25,
			title: "Abraham and the Promise",
			explanation: "God calls one man out of Ur and stakes the whole story on a promise: land, descendants, and blessing for every nation on earth. Roughly 2100-1900 BC.",
		},
		{
			book: "GEN", startChapter: 26, endChapter: 36,
			title: "Isaac and Jacob",
			explanation: "The promise passes to a second and third generation through deception, exile, and a night of wrestling that leaves Jacob limping and renamed Israel.",
		},
		{
			book: "GEN", startChapter: 37, endChapter: 50,
			title: "Joseph in Egypt",
			explanation: "A betrayed son becomes Egypt's ruler, and a family of seventy settles in Goshen — the move that sets up four centuries of silence before Exodus opens.",
		},

		// --- Exodus and the Law -------------------------------------------------
		{
			book: "EXO", startChapter: 1, endChapter: 18,
			title: "Out of Egypt",
			explanation: "Israel has become a nation of slaves. God answers with a burning bush, ten plagues, and a road through the sea.",
		},
		{
			book: "EXO", startChapter: 19, endChapter: 40,
			title: "Covenant at Sinai",
			explanation: "The law is given, the covenant is broken at the golden calf before the ink is dry, and the tabernacle is built so that God can live among a people who cannot keep it.",
		},
		{
			book: "LEV",
			title: "Holy to the LORD",
			explanation: "The manual for living near a holy God: sacrifice, priesthood, clean and unclean, the Day of Atonement. Read it slowly — Hebrews spends its entire argument here.",
		},
		{
			book: "NUM",
			title: "Forty Years in the Wilderness",
			explanation: "Israel refuses to enter the land and spends a generation walking in circles. Census, rebellion, a talking donkey, and a faithfulness that outlasts all of it.",
		},
		{
			book: "DEU",
			title: "Moses' Last Words",
			explanation: "On the plains of Moab, forty years later, Moses preaches the law again to the children of the generation that refused it — then climbs a mountain to die.",
		},

		// --- Conquest and Judges ------------------------------------------------
		{
			book: "JOS",
			title: "Taking the Land",
			explanation: "Around 1400 BC. Jericho, the failure at Ai, the long campaigns, and the land divided out tribe by tribe.",
		},
		{
			book: "JDG",
			title: "Everyone Did What Was Right in His Own Eyes",
			explanation: "Three centuries of the same cycle: Israel forgets, is oppressed, cries out, is rescued, forgets again. Deborah, Gideon, Samson — and an ending that is hard to read.",
		},
		{
			book: "RUT",
			title: "In the Days of the Judges",
			explanation: "The same dark years seen through one Moabite widow's loyalty — and the great-grandmother of David.",
		},

		// --- United Kingdom -----------------------------------------------------
		{
			book: "1SA", startChapter: 1, endChapter: 15,
			title: "Samuel and Saul",
			explanation: "The last judge anoints the first king. Israel asks for a king like the other nations have, and gets exactly that.",
		},
		{
			book: "1SA", startChapter: 16, endChapter: 31,
			title: "David and Saul",
			explanation: "A shepherd is anointed in secret, kills a giant, and then spends years as a fugitive from the king he twice refuses to kill.",
		},
		{
			book: "2SA",
			title: "The Reign of David",
			explanation: "About 1010-970 BC. The kingdom united, Jerusalem taken, an everlasting throne promised — and Bathsheba, Absalom, and the price of all of it.",
		},
		{
			book: "1CH", startChapter: 1, endChapter: 9,
			title: "The Genealogies",
			explanation: "Chronicles retells everything you have just read, for the exiles who came home centuries later. It opens with nine chapters of names, which is its way of saying: you are still that people.",
		},
		{
			book: "1CH", startChapter: 10, endChapter: 29,
			title: "David, Retold",
			explanation: "The same reign as 2 Samuel, seen from the temple. Chronicles keeps David's preparation for the house of God and passes over his failures — a difference of purpose, not of fact.",
		},
		{
			book: "PSA", startChapter: 1, endChapter: 41,
			title: "Psalms, Book One",
			explanation: "The Psalter is five books collected over centuries; most of Book One is traditionally David's. Read here, beside his life, these stop being poetry in the abstract.",
		},
		{
			book: "PSA", startChapter: 42, endChapter: 72,
			title: "Psalms, Book Two",
			explanation: "The sons of Korah, Asaph, and David at his most exposed — including Psalm 51, written after Bathsheba. It ends: 'the prayers of David son of Jesse are ended.'",
		},
		{
			book: "PSA", startChapter: 73, endChapter: 89,
			title: "Psalms, Book Three",
			explanation: "The dark book. Asaph on the prosperity of the wicked, and Psalm 89 left staring at a promise that looks broken.",
		},
		{
			book: "PSA", startChapter: 90, endChapter: 106,
			title: "Psalms, Book Four",
			explanation: "Opens with Moses' own psalm, the oldest in the collection, and answers Book Three's despair with the refrain 'The LORD reigns.'",
		},
		{
			book: "PSA", startChapter: 107, endChapter: 150,
			title: "Psalms, Book Five",
			explanation: "Return from exile, the songs of ascent sung walking up to Jerusalem, the vast Psalm 119, and five straight hallelujahs to finish.",
		},
		{
			book: "1KI", startChapter: 1, endChapter: 11,
			title: "Solomon's Glory",
			explanation: "About 970-930 BC. Wisdom asked for and given, the temple built, and a thousand small compromises that end in a divided heart.",
		},
		{
			book: "2CH", startChapter: 1, endChapter: 9,
			title: "Solomon, Retold",
			explanation: "Chronicles' account of the same reign, weighted almost entirely toward the building and dedication of the temple.",
		},
		{
			book: "PRO",
			title: "The Wisdom of Solomon",
			explanation: "Not promises but patterns — how the world usually goes for the wise and for the fool. Written to be read a chapter at a time for the rest of your life.",
		},
		{
			book: "ECC",
			title: "Everything Is Vapor",
			explanation: "The same king, older. Wealth, work, pleasure and wisdom all weighed and found to be breath. The most honest book in the Bible about the limits of a life lived under the sun.",
		},
		{
			book: "SNG",
			title: "The Song of Songs",
			explanation: "Love poetry, unembarrassed — and read by Israel and the church ever since as the picture of covenant love itself.",
		},

		// --- Divided Kingdom ----------------------------------------------------
		{
			book: "1KI", startChapter: 12, endChapter: 16,
			title: "The Kingdom Divides",
			explanation: "930 BC. Rehoboam's answer to a reasonable request splits the nation in two: Israel in the north, Judah in the south. Nothing after this is ever whole again.",
		},
		{
			book: "2CH", startChapter: 10, endChapter: 16,
			title: "Judah's First Kings",
			explanation: "The southern half of the same years — Rehoboam, Abijah, and Asa, who tore down the idols and then leaned on Syria instead of God.",
		},
		{
			book: "1KI", startChapter: 17, endChapter: 22,
			title: "Elijah and Ahab",
			explanation: "The prophet against the throne: three years of drought, fire on Carmel, a still small voice in a cave, and Naboth's vineyard.",
		},
		{
			book: "2CH", startChapter: 17, endChapter: 20,
			title: "Jehoshaphat",
			explanation: "Meanwhile in Judah: reform, an alliance with Ahab that nearly costs everything, and a battle won by sending the choir out first.",
		},
		{
			book: "OBA",
			title: "Edom's Doom",
			explanation: "The shortest book in the Old Testament, against the brother-nation that stood by and watched Jerusalem fall. Its date is debated; it is read here with the ninth-century raids on Judah.",
		},
		{
			book: "2KI", startChapter: 1, endChapter: 8,
			title: "Elisha",
			explanation: "A double portion of Elijah's spirit, and a run of miracles — an axe head, a widow's oil, a Syrian general in the Jordan — insisting that God has not written off the north.",
		},
		{
			book: "2KI", startChapter: 9, endChapter: 13,
			title: "Jehu's Purge",
			explanation: "Blood in Jezreel, Athaliah's coup in Judah, and the boy king Joash hidden in the temple for six years.",
		},
		{
			book: "2CH", startChapter: 21, endChapter: 24,
			title: "Judah on the Edge",
			explanation: "The same years from Jerusalem: Jehoram, Ahaziah, Athaliah, and Joash — who repairs the temple and then murders the priest who raised him.",
		},
		{
			book: "JOL",
			title: "The Day of the LORD",
			explanation: "A locust plague read as the warning of a greater day, and the promise of an outpoured Spirit that Peter will quote at Pentecost. Joel's date is genuinely uncertain; tradition places him here.",
		},
		{
			book: "2KI", startChapter: 14, endChapter: 15,
			title: "The Long Prosperity",
			explanation: "Jeroboam II in the north, Uzziah in the south: the wealthiest decades either kingdom ever saw, and the ones the prophets found most dangerous.",
		},
		{
			book: "JON",
			title: "The Reluctant Prophet",
			explanation: "About 780 BC. Sent to Assyria's capital, Jonah runs the opposite way — and is angriest at the end, when his enemies repent and are spared.",
		},
		{
			book: "AMO",
			title: "Let Justice Roll Down",
			explanation: "A shepherd from Judah walks north into Jeroboam's boom and tells them their worship is worthless while they sell the poor for a pair of sandals.",
		},
		{
			book: "HOS",
			title: "A Marriage as a Sermon",
			explanation: "God tells Hosea to marry a woman who will betray him, so that the northern kingdom can see its own idolatry from the other side of it.",
		},
		{
			book: "2CH", startChapter: 25, endChapter: 27,
			title: "Amaziah, Uzziah, Jotham",
			explanation: "Judah's version of the same prosperous decades, and the pride that ended Uzziah's reign in a leper's isolation.",
		},
		{
			book: "ISA", startChapter: 1, endChapter: 39,
			title: "Isaiah: The Coming Judgment",
			explanation: "Isaiah preaches through four reigns, roughly 740-690 BC. Assyria at the gates, Hezekiah on his knees, and a child who will be called Mighty God, Everlasting Father.",
		},
		{
			book: "MIC",
			title: "Micah",
			explanation: "Isaiah's contemporary, working the villages rather than the court. 'What does the LORD require of you?' — and Bethlehem, named seven centuries early.",
		},
		{
			book: "2KI", startChapter: 16, endChapter: 20,
			title: "Assyria at the Gate",
			explanation: "Ahaz's faithless alliance, the fall of Samaria in 722 BC that ends the northern kingdom, and the night 185,000 besiegers die outside Jerusalem.",
		},
		{
			book: "2CH", startChapter: 28, endChapter: 32,
			title: "Hezekiah's Reform",
			explanation: "Chronicles gives Hezekiah's Passover — the first kept properly in generations — the space that Kings gives to his politics.",
		},
		{
			book: "ISA", startChapter: 40, endChapter: 66,
			title: "Isaiah: Comfort My People",
			explanation: "The tone turns completely: exile assumed, return promised, idols mocked, and the Servant who is wounded for our transgressions.",
		},
		{
			book: "NAM",
			title: "Nineveh Falls",
			explanation: "A century after Jonah, the same city gets no second reprieve. Assyria falls in 612 BC, exactly as this book says it will.",
		},
		{
			book: "2KI", startChapter: 21, endChapter: 21,
			title: "Manasseh",
			explanation: "Fifty-five years, the longest reign in Judah's history and the worst. Kings names it as the reason the exile finally became certain.",
		},
		{
			book: "2CH", startChapter: 33, endChapter: 33,
			title: "Manasseh Repents",
			explanation: "Chronicles adds what Kings leaves out: dragged to Babylon with a hook in his nose, Manasseh prays — and is heard.",
		},
		{
			book: "ZEP",
			title: "Zephaniah",
			explanation: "About 630 BC, in Josiah's early years. The day of the LORD as fire, and at the end a God who rejoices over his people with singing.",
		},
		{
			book: "HAB",
			title: "Habakkuk",
			explanation: "A prophet argues with God about why he would use Babylon, of all nations, to punish Judah — and is answered with the line Paul builds Romans on: the righteous shall live by his faith.",
		},
		{
			book: "2KI", startChapter: 22, endChapter: 23,
			title: "Josiah and the Book",
			explanation: "621 BC. A scroll lost in the temple is found during repairs, and sets off the deepest reform Judah ever had — thirty years before the end.",
		},
		{
			book: "2CH", startChapter: 34, endChapter: 35,
			title: "Josiah's Passover",
			explanation: "The same reform from Chronicles' angle, ending in the greatest Passover kept since the days of Samuel.",
		},
		{
			book: "JER", startChapter: 1, endChapter: 29,
			title: "Jeremiah: The Weeping Prophet",
			explanation: "Forty years telling Jerusalem that the city will fall, while every other prophet in town promises peace. Nobody listens; he is beaten, jailed, and lowered into a cistern for it.",
		},
		{
			book: "JER", startChapter: 30, endChapter: 52,
			title: "Jeremiah: The New Covenant",
			explanation: "In the middle of the collapse, the clearest promise in the Old Testament: a covenant written on hearts, not tablets. Then the fall itself, in 586 BC.",
		},
		{
			book: "LAM",
			title: "Lamentations",
			explanation: "Five poems over the ruins, written in strict alphabetical acrostics — grief given a form so that it can be carried. 'His mercies are new every morning' sits at the exact center.",
		},
		{
			book: "2KI", startChapter: 24, endChapter: 25,
			title: "Jerusalem Falls",
			explanation: "Three deportations, the temple burned, the walls broken, the last king blinded. Kings ends with a Judean king eating at Babylon's table — a thin, deliberate thread of hope.",
		},
		{
			book: "2CH", startChapter: 36, endChapter: 36,
			title: "The End, and a Decree",
			explanation: "Chronicles closes the same years differently: with Cyrus of Persia telling the exiles to go home and build.",
		},

		// --- Exile --------------------------------------------------------------
		{
			book: "EZK", startChapter: 1, endChapter: 24,
			title: "Ezekiel: Before the Fall",
			explanation: "Deported in 597 BC, Ezekiel prophesies to the exiles in Babylon while Jerusalem is still standing — wheels of fire, street theater, and the glory of God walking out of the temple.",
		},
		{
			book: "EZK", startChapter: 25, endChapter: 48,
			title: "Ezekiel: After the Fall",
			explanation: "Judgment on the surrounding nations, a valley of dry bones raised into an army, and a visionary temple with a river running out of it that heals the sea.",
		},
		{
			book: "DAN",
			title: "Daniel in Babylon",
			explanation: "Taken as a boy in 605 BC and still serving under Persia seventy years later. Court stories of impossible faithfulness, then visions of every empire that follows.",
		},

		// --- Return -------------------------------------------------------------
		{
			book: "EZR", startChapter: 1, endChapter: 6,
			title: "The First Return",
			explanation: "538 BC. Cyrus lets them go. Fifty thousand return, lay a foundation, are stopped by their neighbors for sixteen years, and finish the second temple in 516.",
		},
		{
			book: "HAG",
			title: "Rebuild the House",
			explanation: "520 BC: four blunt sermons in as many months, aimed at people living in paneled houses while the temple lies in rubble. It works — the building restarts.",
		},
		{
			book: "ZEC",
			title: "Zechariah",
			explanation: "Haggai's colleague, with eight night visions and the plainest pictures of the Messiah outside Isaiah: the branch, the pierced one, the king riding in on a donkey.",
		},
		{
			book: "EST",
			title: "Esther",
			explanation: "In Persia around 480 BC, among the Jews who never went home. God is not named once in the book, which is precisely its argument.",
		},
		{
			book: "EZR", startChapter: 7, endChapter: 10,
			title: "Ezra's Reform",
			explanation: "458 BC. A scribe returns with the law in his hands and finds a community that has quietly stopped being distinct from its neighbors.",
		},
		{
			book: "NEH",
			title: "Nehemiah Builds the Wall",
			explanation: "445 BC. The Persian king's cupbearer takes leave, rebuilds Jerusalem's wall in fifty-two days against constant sabotage, and then has the harder job of rebuilding the people.",
		},
		{
			book: "MAL",
			title: "Malachi",
			explanation: "The last word of the Old Testament, around 430 BC: worship gone cynical, a promised messenger who will prepare the way — and then four hundred years of silence.",
		},

		// --- The Gospels --------------------------------------------------------
		{
			book: "MAT", startChapter: 1, endChapter: 13,
			title: "Matthew: The Promised King",
			explanation: "The four Gospels cover the same three years from four angles; this plan reads them one after another rather than interleaved. Matthew writes for readers who know the Old Testament by heart: the genealogy, the Sermon on the Mount, the parables of the kingdom.",
		},
		{
			book: "MAT", startChapter: 14, endChapter: 28,
			title: "Matthew: The Cross and the Commission",
			explanation: "The confession at Caesarea Philippi, the road up to Jerusalem, the last week hour by hour, and a commission given on a hillside in Galilee.",
		},
		{
			book: "MRK",
			title: "Mark: The Servant",
			explanation: "The shortest and probably the earliest gospel — urgent and physical, with 'immediately' forty times over. Traditionally Peter's own memories, written down for Rome.",
		},
		{
			book: "LUK", startChapter: 1, endChapter: 12,
			title: "Luke: The Son of Man",
			explanation: "A physician's orderly account for a Greek reader, and the widest angle of the four: shepherds, Samaritans, women, tax collectors, the poor.",
		},
		{
			book: "LUK", startChapter: 13, endChapter: 24,
			title: "Luke: The Road to Jerusalem",
			explanation: "The prodigal son, the long journey up, the trial before Pilate and Herod, and a seven-mile walk to Emmaus with a stranger explaining everything you have read so far.",
		},
		{
			book: "JHN",
			title: "John: The Word Made Flesh",
			explanation: "The last gospel, written decades later and from much higher up: seven signs, seven 'I am' sayings, and a purpose stated outright — that you may believe.",
		},

		// --- The Church ---------------------------------------------------------
		{
			book: "ACT", startChapter: 1, endChapter: 12,
			title: "The Church Is Born",
			explanation: "Pentecost, the first thousands, Stephen stoned, the gospel forced out of Jerusalem by the persecution meant to end it, and Saul knocked to the ground on the Damascus road.",
		},
		{
			book: "JAS",
			title: "James",
			explanation: "Probably the earliest letter in the New Testament, around 45 AD, from Jesus' own brother. Plain, practical, and unimpressed by a faith that produces nothing.",
		},
		{
			book: "ACT", startChapter: 13, endChapter: 14,
			title: "The First Journey",
			explanation: "Antioch sends Barnabas and Saul out, and somewhere on Cyprus Saul becomes Paul. The first churches planted among Gentiles — and the first stoning.",
		},
		{
			book: "GAL",
			title: "Galatians",
			explanation: "Around 49 AD, written white-hot to churches he had just planted and someone had just told to get circumcised. Nobody, ever, is justified by works of the law.",
		},
		{
			book: "ACT", startChapter: 15, endChapter: 18,
			title: "The Council and the Second Journey",
			explanation: "Jerusalem rules that Gentiles need not become Jews first. Then Macedonia, the Philippian jail, Thessalonica, Athens, and eighteen months in Corinth.",
		},
		{
			book: "1TH",
			title: "1 Thessalonians",
			explanation: "Around 51 AD, Paul's earliest surviving letter: relief that a young church under pressure is holding, and the return of Christ offered as an answer to their grief.",
		},
		{
			book: "2TH",
			title: "2 Thessalonians",
			explanation: "A quick follow-up for people who had concluded the day of the Lord had already come, and had accordingly stopped working.",
		},
		{
			book: "ACT", startChapter: 19, endChapter: 20,
			title: "The Third Journey",
			explanation: "Three years in Ephesus, a riot started by silversmiths losing money on idols, and a farewell at Miletus that Paul knows is final.",
		},
		{
			book: "1CO",
			title: "1 Corinthians",
			explanation: "A church of factions, lawsuits, incest, drunken communion and competitive tongues — and, written straight into that mess, the chapter on love read at every wedding since.",
		},
		{
			book: "2CO",
			title: "2 Corinthians",
			explanation: "The most personal thing Paul wrote: a defense of his ministry against slicker rivals, and the strange logic of a strength made perfect in weakness.",
		},
		{
			book: "ROM",
			title: "Romans",
			explanation: "Around 57 AD, to a church he has never visited, laying the gospel out from first principles. The most systematic argument in the New Testament, and the one that has restarted the church twice.",
		},
		{
			book: "ACT", startChapter: 21, endChapter: 28,
			title: "To Rome in Chains",
			explanation: "Arrested in the temple, two years in Caesarea, an appeal to Caesar, a shipwreck off Malta — and Acts ends mid-sentence with Paul preaching under house arrest.",
		},
		{
			book: "EPH",
			title: "Ephesians",
			explanation: "Written from that Roman imprisonment. Three chapters on what God has done, three on how to live inside it, and armor at the end.",
		},
		{
			book: "PHP",
			title: "Philippians",
			explanation: "A thank-you note from prison to his favorite church, with the oldest surviving hymn about Christ's humility set in the middle of it.",
		},
		{
			book: "COL",
			title: "Colossians",
			explanation: "Against a religion of extra rules and secret knowledge: Christ is supreme over everything, and you are already complete in him.",
		},
		{
			book: "PHM",
			title: "Philemon",
			explanation: "One page, to a slave owner about a runaway slave who is now a brother. Paul never quite issues the command he obviously wants obeyed.",
		},
		{
			book: "1TI",
			title: "1 Timothy",
			explanation: "Released and traveling again, Paul writes to a young pastor in Ephesus about elders, false teachers, and the unglamorous work of holding a church together.",
		},
		{
			book: "TIT",
			title: "Titus",
			explanation: "The same brief, for Crete: appoint elders town by town, silence the loudmouths, and let grace train you.",
		},
		{
			book: "1PE",
			title: "1 Peter",
			explanation: "Around 64 AD, to Christians scattered across Asia Minor as Nero's persecution begins. Suffering that is neither punishment nor accident.",
		},
		{
			book: "2PE",
			title: "2 Peter",
			explanation: "Peter's last letter, written knowing he has little time: false teachers already inside, and a promise that the delay is patience rather than indifference.",
		},
		{
			book: "HEB",
			title: "Hebrews",
			explanation: "An anonymous sermon to Jewish Christians tempted to go back to the old system. Everything you read in Leviticus, shown to be the shadow of one better priest and one final sacrifice.",
		},
		{
			book: "JUD",
			title: "Jude",
			explanation: "Twenty-five verses of alarm about people who had quietly gotten in — and then the doxology everyone quotes.",
		},
		{
			book: "2TI",
			title: "2 Timothy",
			explanation: "Paul's last letter, from a cold cell, expecting execution and asking for his coat and his books. 'I have fought the good fight.'",
		},
		{
			book: "1JN",
			title: "1 John",
			explanation: "Sixty years on, the last surviving apostle writes about the three tests of a real faith: what you believe, how you live, and whether you love.",
		},
		{
			book: "2JN",
			title: "2 John",
			explanation: "A short note to a church about hospitality — specifically, about not extending it to teachers who deny that Christ came in the flesh.",
		},
		{
			book: "3JN",
			title: "3 John",
			explanation: "A short note about a man who liked being first, and another who was simply good.",
		},
		{
			book: "REV",
			title: "Revelation",
			explanation: "Around 95 AD, from exile on Patmos: seven letters to seven real churches, then the whole conflict of history and its ending, written in the vocabulary of the prophets you have just spent months reading. The story closes where it started — a river, a tree of life, and God living with his people.",
		},
	],
};
