import { GlobalStudyDef } from "../globalStudy";

/**
 * "From Cover to Cover" — the whole canon in the order it is bound, one book at
 * a time. Genesis entire, then Exodus entire, then Leviticus, through to
 * Revelation.
 *
 * The counterpart to plans/chronological.ts: same 1,189 chapters, nothing
 * rearranged. It exists because the most common way anyone asks to read the
 * Bible is the plainest one, and a reader who wants that should not have to opt
 * into someone's reconstruction of the timeline to get it.
 *
 * One deliberate consequence, stated in the description so nobody is misled: a
 * step here is a whole book, not an evenly sized sitting. Psalms is a single
 * 150-chapter reading and Jude is a single-chapter one. That is the point of
 * reading it as a book — progress is measured in books finished. A reader who
 * wants comparable readings has the chronological plan's 102 chunked steps.
 *
 * Every step omits startChapter/endChapter, which stepChapterSpan resolves to
 * 1..book.chapters from CANON, so every canonical chapter appears exactly once
 * by construction — still enforced by validateGlobalStudy at seed time.
 */
export const COVER_TO_COVER_PLAN: GlobalStudyDef = {
	slug: "cover-to-cover",
	name: "From Cover to Cover",
	description:
		"The whole Bible the way you read a book: all of Genesis, then all of Exodus, then all of Leviticus, straight through to Revelation. 66 readings, one per book, covering all 1,189 chapters in the order they are bound. Nothing rearranged, nothing skipped, and never any doubt about where you are. A reading here is a whole book rather than an evenly sized sitting, so Psalms is one long stretch and Jude is one short one.",
	topic:
		"Read the entire Bible from Genesis to Revelation in canonical order, one whole book at a time, treating scripture as a book to be read cover to cover.",
	length: 10,
	depth: 5,
	sortOrder: 2,
	coversWholeCanon: true,
	steps: [
		// --- The Law ------------------------------------------------------------
		{
			book: "GEN",
			title: "Genesis",
			explanation: "Creation, the fall, the flood and Babel, and then one family: Abraham, Isaac, Jacob, Joseph. Almost everything the rest of scripture assumes about God, humanity and sin is laid down here. It ends with Israel in Egypt, which is where the next book picks up.",
		},
		{
			book: "EXO",
			title: "Exodus",
			explanation: "Slavery, plagues, Passover, the sea, Sinai — and a tabernacle built so that God can live among the people he rescued. The pattern of redemption that every later writer reads the rest of the story through.",
		},
		{
			book: "LEV",
			title: "Leviticus",
			explanation: "The manual for living close to a holy God: sacrifice, priesthood, clean and unclean, and the Day of Atonement at its exact center. Slow going, and Hebrews is unreadable without it.",
		},
		{
			book: "NUM",
			title: "Numbers",
			explanation: "Two censuses and forty years between them. A generation that watched the sea part refuses to enter the land, and the book becomes a long study in grumbling, judgment, and God's stubborn faithfulness anyway.",
		},
		{
			book: "DEU",
			title: "Deuteronomy",
			explanation: "Moses preaching his farewell on the plains of Moab: the law restated for the children of those who first heard it, with blessing and curse set plainly before them. No book is quoted by Jesus more often.",
		},

		// --- History ------------------------------------------------------------
		{
			book: "JOS",
			title: "Joshua",
			explanation: "The land promised to Abraham, entered and divided. Jericho, the failure at Ai, the long day, and a covenant renewal at Shechem where Israel is told to choose whom it will serve.",
		},
		{
			book: "JDG",
			title: "Judges",
			explanation: "The cycle that gives the book its shape: the people fall away, an oppressor comes, they cry out, a deliverer rises, and it begins again. It closes with the darkest chapters in the Old Testament.",
		},
		{
			book: "RUT",
			title: "Ruth",
			explanation: "Four quiet chapters set in the middle of the Judges era. A Moabite widow, a barley field, a kinsman-redeemer, and the great-grandmother of David.",
		},
		{
			book: "1SA",
			title: "1 Samuel",
			explanation: "Israel demands a king like the nations have. Samuel anoints Saul, Saul unravels, and a shepherd boy anointed in secret spends years running from the king he refuses to kill.",
		},
		{
			book: "2SA",
			title: "2 Samuel",
			explanation: "David reigns: Jerusalem taken, the ark brought home, and an everlasting covenant promised to his house in chapter 7. Then Bathsheba, and a family that never recovers.",
		},
		{
			book: "1KI",
			title: "1 Kings",
			explanation: "Solomon's wisdom, the temple, and the wealth that ends in idolatry; then the kingdom tears in two, and Elijah faces down Ahab and the prophets of Baal on Carmel.",
		},
		{
			book: "2KI",
			title: "2 Kings",
			explanation: "Elisha, and then the long decline. Assyria carries the north away in 722 BC and Babylon burns Jerusalem in 586. The book ends with Judah in exile and a captive king eating at a foreign table.",
		},
		{
			book: "1CH",
			title: "1 Chronicles",
			explanation: "Nine chapters of genealogy, then David's reign told a second time for the returned exiles — less about his failures, more about the ark, the temple plans, and the worship he set in order.",
		},
		{
			book: "2CH",
			title: "2 Chronicles",
			explanation: "Solomon's temple and the kings of Judah, each measured by whether he sought the Lord. It breaks off mid-sentence with the decree of Cyrus: the exiles may go home.",
		},
		{
			book: "EZR",
			title: "Ezra",
			explanation: "The return, in two waves. Zerubbabel rebuilds the altar and then the temple against local opposition, and decades later Ezra arrives with the law and a painful reform.",
		},
		{
			book: "NEH",
			title: "Nehemiah",
			explanation: "A cupbearer in Susa hears that the wall is still rubble and rebuilds it in fifty-two days with a weapon in one hand. Then Ezra reads the law aloud and the people weep.",
		},
		{
			book: "EST",
			title: "Esther",
			explanation: "Persia, a beauty contest, a genocidal edict, and a Jewish queen who risks her life for a people the king does not know she belongs to. God is never named in the book, which is precisely the point.",
		},

		// --- Wisdom and Poetry --------------------------------------------------
		{
			book: "JOB",
			title: "Job",
			explanation: "A righteous man loses everything, three friends explain why, and every one of them is wrong. God finally answers out of the whirlwind without answering the question. The oldest hard question in scripture.",
		},
		{
			book: "PSA",
			title: "Psalms",
			explanation: "The prayer book of Israel: 150 psalms in five books, holding praise, lament, rage and repentance side by side without apology. By far the longest reading in this plan, and the one most worth taking slowly.",
		},
		{
			book: "PRO",
			title: "Proverbs",
			explanation: "The fear of the Lord worked out in money, speech, work, sex and friendship. Wisdom calls aloud in the street, and the fool walks past her.",
		},
		{
			book: "ECC",
			title: "Ecclesiastes",
			explanation: "The Preacher tries pleasure, work, wisdom and wealth, and finds every one of them vapor. Bleak and completely honest, and it still ends by telling you to fear God and enjoy your bread.",
		},
		{
			book: "SNG",
			title: "Song of Solomon",
			explanation: "A love poem, unembarrassed. Read it for what it plainly is before you read it for anything else.",
		},

		// --- The Major Prophets -------------------------------------------------
		{
			book: "ISA",
			title: "Isaiah",
			explanation: "Judgment on Judah and the nations, and then the great chapters of comfort: a child born, a servant pierced for our transgressions, a new heavens and a new earth. No prophet is quoted more in the New Testament.",
		},
		{
			book: "JER",
			title: "Jeremiah",
			explanation: "Forty years of warning nobody wanted, from a man who begged to be allowed to stop. Jerusalem falls anyway — and in the middle of the wreckage, the promise of a new covenant written on hearts.",
		},
		{
			book: "LAM",
			title: "Lamentations",
			explanation: "Five poems over the ruins of Jerusalem, four of them acrostics working through the alphabet. At the exact center of the book: his mercies are new every morning.",
		},
		{
			book: "EZK",
			title: "Ezekiel",
			explanation: "A priest exiled by the Kebar canal sees wheels and living creatures, acts out the siege in the street, watches the glory leave the temple — and then sees dry bones stand up and a new temple measured stone by stone.",
		},
		{
			book: "DAN",
			title: "Daniel",
			explanation: "Six chapters of court stories — the furnace, the writing on the wall, the lions — and six of visions in which empires rise and fall on paper while a young man quietly refuses to bow.",
		},

		// --- The Minor Prophets -------------------------------------------------
		{
			book: "HOS",
			title: "Hosea",
			explanation: "God tells a prophet to marry a woman who will leave him, and then to take her back, so that Israel can watch what its own idolatry looks like from the inside.",
		},
		{
			book: "JOL",
			title: "Joel",
			explanation: "A locust plague read as a rehearsal for the day of the Lord, and the promise Peter reaches for at Pentecost: I will pour out my Spirit on all flesh.",
		},
		{
			book: "AMO",
			title: "Amos",
			explanation: "A shepherd from Tekoa walks north into a prosperous kingdom and indicts it for selling the poor for a pair of sandals. Let justice roll down like waters.",
		},
		{
			book: "OBA",
			title: "Obadiah",
			explanation: "Twenty-one verses against Edom, who stood by and gloated while Jerusalem was sacked. The shortest book in the Old Testament, and read in a few minutes.",
		},
		{
			book: "JON",
			title: "Jonah",
			explanation: "The prophet who ran, the fish, and a pagan city that repents at the worst sermon ever preached. The last chapter is about the prophet's fury that it did — that is the book.",
		},
		{
			book: "MIC",
			title: "Micah",
			explanation: "Judgment and hope alternating, Bethlehem named centuries early, and the line that sums up every prophet: do justice, love mercy, walk humbly with your God.",
		},
		{
			book: "NAM",
			title: "Nahum",
			explanation: "Nineveh again, a century after Jonah. This time there is no repentance and no reprieve, and the city that terrorized the ancient world is told exactly how it ends.",
		},
		{
			book: "HAB",
			title: "Habakkuk",
			explanation: "A prophet argues with God about why the wicked prosper, receives an answer he likes even less, and ends the book singing anyway. The righteous shall live by his faith.",
		},
		{
			book: "ZEP",
			title: "Zephaniah",
			explanation: "The day of the Lord against Judah and the nations, and then, without warning, God rejoicing over his people with singing.",
		},
		{
			book: "HAG",
			title: "Haggai",
			explanation: "Two chapters and four dated sermons with one point: the house of God is still rubble and your paneled houses are not. Remarkably, the people listen.",
		},
		{
			book: "ZEC",
			title: "Zechariah",
			explanation: "Eight night visions, then oracles that read almost like the Gospels written in advance: a king coming on a donkey, thirty pieces of silver, one whom they have pierced.",
		},
		{
			book: "MAL",
			title: "Malachi",
			explanation: "Robbed tithes, cynical priests and faithless divorce, answered by the promise of a messenger who will prepare the way. Then four hundred years of silence.",
		},

		// --- The Gospels --------------------------------------------------------
		{
			book: "MAT",
			title: "Matthew",
			explanation: "Jesus presented to readers who already know the Old Testament: a genealogy from Abraham, a fulfillment quotation on nearly every page, and five great blocks of teaching that open with the Sermon on the Mount.",
		},
		{
			book: "MRK",
			title: "Mark",
			explanation: "The shortest and fastest gospel, forever saying immediately. Nearly half of it is the road to the cross, and the confession that matters most comes from a Roman centurion standing at the foot of it.",
		},
		{
			book: "LUK",
			title: "Luke",
			explanation: "A physician's orderly account written for Theophilus, and the widest lens of the four: shepherds, Samaritans, women, tax collectors, the prodigal. Volume one of two.",
		},
		{
			book: "JHN",
			title: "John",
			explanation: "Written last and from a different angle: seven signs, seven I-am sayings, and long private conversations the others leave out. It states its own purpose at 20:31 — that you may believe.",
		},

		// --- Acts ---------------------------------------------------------------
		{
			book: "ACT",
			title: "Acts",
			explanation: "Luke's second volume: Pentecost, the church spilling out of Jerusalem, Saul knocked to the ground on the Damascus road, and the gospel carried by ship and prison escort to Rome. Every letter that follows sits inside this narrative.",
		},

		// --- Paul's Letters -----------------------------------------------------
		{
			book: "ROM",
			title: "Romans",
			explanation: "Paul's most systematic letter, written ahead of himself to a church he had never visited: sin, justification by faith, life in the Spirit, the place of Israel — and then all of it cashed out as how to actually live.",
		},
		{
			book: "1CO",
			title: "1 Corinthians",
			explanation: "A messy church answered point by point: factions, lawsuits, sex, meat offered to idols, chaotic worship, spiritual gifts. In the middle of the mess sits chapter 13, and at the end, the resurrection.",
		},
		{
			book: "2CO",
			title: "2 Corinthians",
			explanation: "The most personal thing Paul wrote. He defends a ministry marked by weakness, lists his sufferings where a rival would list credentials, and is refused when he asks for the thorn to be removed.",
		},
		{
			book: "GAL",
			title: "Galatians",
			explanation: "Written hot, with no thanksgiving at the top. Anyone adding circumcision to the gospel is preaching a different gospel, and Paul will not yield for an hour, because freedom is the whole point.",
		},
		{
			book: "EPH",
			title: "Ephesians",
			explanation: "Three chapters on what God has done — chosen, raised, reconciled, made one new humanity out of two — and then three on walking worthy of it, ending in armor.",
		},
		{
			book: "PHP",
			title: "Philippians",
			explanation: "A thank-you note from prison that will not stop saying rejoice, built around the hymn of chapter 2: he emptied himself and took the form of a servant.",
		},
		{
			book: "COL",
			title: "Colossians",
			explanation: "Christ supreme over everything created, held up against a homemade religion of visions, diets and festivals. Nothing whatsoever needs to be added to him.",
		},
		{
			book: "1TH",
			title: "1 Thessalonians",
			explanation: "Probably the earliest letter Paul wrote: warm, encouraging, and answering an anxious question from a young church about believers who had died before the Lord returned.",
		},
		{
			book: "2TH",
			title: "2 Thessalonians",
			explanation: "A follow-up to cool down a church convinced the day of the Lord had already arrived — and to tell those who had quit working on the strength of it to go back to work.",
		},
		{
			book: "1TI",
			title: "1 Timothy",
			explanation: "A young pastor left behind in Ephesus is told how to order a church: elders and deacons, widows, false teachers, and what money does to people who want it.",
		},
		{
			book: "2TI",
			title: "2 Timothy",
			explanation: "Paul's last letter, written with execution close and most friends gone. Guard the deposit, endure suffering, preach the word. I have fought the good fight.",
		},
		{
			book: "TIT",
			title: "Titus",
			explanation: "Crete, and a mandate to appoint elders town by town and teach sound doctrine — with grace itself training us to live self-controlled lives while we wait.",
		},
		{
			book: "PHM",
			title: "Philemon",
			explanation: "One chapter, one runaway slave, and one favor asked between friends. Paul offers to pay the debt himself and never quite says the thing he is obviously asking for.",
		},

		// --- The General Letters ------------------------------------------------
		{
			book: "HEB",
			title: "Hebrews",
			explanation: "Christ is better: better than angels, than Moses, than the priesthood, than the sacrifices. Written to Jewish believers tempted to go back, and unreadable without Leviticus behind you.",
		},
		{
			book: "JAS",
			title: "James",
			explanation: "Faith that never shows up in your calendar, your wallet or your speech is not faith. Short, blunt, and closer in feel to Proverbs than to Paul.",
		},
		{
			book: "1PE",
			title: "1 Peter",
			explanation: "Written to exiles under real pressure: suffering is not evidence that God has lost the plot, and holiness is how you answer it.",
		},
		{
			book: "2PE",
			title: "2 Peter",
			explanation: "False teachers already inside the church, and scoffers asking where the promised coming has got to. The Lord is not slow; he is patient.",
		},
		{
			book: "1JN",
			title: "1 John",
			explanation: "The same tests circled again and again — light, love, and confessing that Jesus came in the flesh — written so that you may know that you have eternal life.",
		},
		{
			book: "2JN",
			title: "2 John",
			explanation: "A single chapter to a chosen lady and her children: walk in love, and do not open your house to teachers who deny that Christ came in the flesh.",
		},
		{
			book: "3JN",
			title: "3 John",
			explanation: "A single chapter to Gaius, commending the hospitality he shows traveling missionaries and naming the man in the church who refuses to.",
		},
		{
			book: "JUD",
			title: "Jude",
			explanation: "A short, fierce warning about people who slipped in unnoticed, ending in one of the great benedictions in scripture.",
		},

		// --- Revelation ---------------------------------------------------------
		{
			book: "REV",
			title: "Revelation",
			explanation: "Letters to seven real churches, then seals, trumpets and bowls, the beast, the fall of Babylon — and finally a city coming down out of heaven, where God dwells with his people and death is gone.",
		},
	],
};
