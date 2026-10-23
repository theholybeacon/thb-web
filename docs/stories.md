# The Holy Beacon's stories

The 50 stories The Holy Beacon offers in the catalog, as studies of kind `story`. Each one is a file in
`src/app/common/study/model/stories/`, listed in `stories/index.ts` in this order, which is the order
they happen in the Bible. `sortOrder` is 100 + its number, so stories always follow the reading plans.

Check a story after writing or editing it with `npm run check:stories -- <slug or file>`, then seed
it with `npm run seed:studies`.

| # | Story | Main passages | Slug | File | Export |
|---|---|---|---|---|---|
| 1 | The Creation | GEN 1–2 | `story-creation` | `creation.ts` | `CREATION` |
| 2 | Adam, Eve and the Fall | GEN 3 | `story-the-fall` | `theFall.ts` | `THE_FALL` |
| 3 | Cain and Abel | GEN 4 | `story-cain-and-abel` | `cainAndAbel.ts` | `CAIN_AND_ABEL` |
| 4 | Noah's Ark | GEN 6–9 | `story-noahs-ark` | `noahsArk.ts` | `NOAHS_ARK` |
| 5 | The Tower of Babel | GEN 11 | `story-tower-of-babel` | `towerOfBabel.ts` | `TOWER_OF_BABEL` |
| 6 | The Call of Abraham | GEN 12; 15 | `story-call-of-abraham` | `callOfAbraham.ts` | `CALL_OF_ABRAHAM` |
| 7 | Sodom and Gomorrah | GEN 18–19 | `story-sodom-and-gomorrah` | `sodomAndGomorrah.ts` | `SODOM_AND_GOMORRAH` |
| 8 | Abraham and Isaac | GEN 22 | `story-abraham-and-isaac` | `abrahamAndIsaac.ts` | `ABRAHAM_AND_ISAAC` |
| 9 | Jacob and Esau | GEN 25; 27; 33 | `story-jacob-and-esau` | `jacobAndEsau.ts` | `JACOB_AND_ESAU` |
| 10 | Jacob's Ladder and the Night of Wrestling | GEN 28; 32 | `story-jacobs-ladder` | `jacobsLadder.ts` | `JACOBS_LADDER` |
| 11 | Joseph and His Brothers | GEN 37–45 | `story-joseph-and-his-brothers` | `josephAndHisBrothers.ts` | `JOSEPH_AND_HIS_BROTHERS` |
| 12 | Baby Moses in the Basket | EXO 1–2 | `story-baby-moses` | `babyMoses.ts` | `BABY_MOSES` |
| 13 | Moses and the Burning Bush | EXO 3–4 | `story-burning-bush` | `burningBush.ts` | `BURNING_BUSH` |
| 14 | The Plagues and the Passover | EXO 7–12 | `story-ten-plagues` | `tenPlagues.ts` | `TEN_PLAGUES` |
| 15 | Crossing the Red Sea | EXO 14–15 | `story-red-sea` | `redSea.ts` | `RED_SEA` |
| 16 | Manna and Water from the Rock | EXO 16–17 | `story-manna` | `manna.ts` | `MANNA` |
| 17 | The Ten Commandments | EXO 19–20 | `story-ten-commandments` | `tenCommandments.ts` | `TEN_COMMANDMENTS` |
| 18 | The Golden Calf | EXO 32 | `story-golden-calf` | `goldenCalf.ts` | `GOLDEN_CALF` |
| 19 | The Twelve Spies | NUM 13–14 | `story-twelve-spies` | `twelveSpies.ts` | `TWELVE_SPIES` |
| 20 | Rahab and the Spies | JOS 2 | `story-rahab` | `rahab.ts` | `RAHAB` |
| 21 | The Walls of Jericho | JOS 6 | `story-walls-of-jericho` | `wallsOfJericho.ts` | `WALLS_OF_JERICHO` |
| 22 | Deborah and Jael | JDG 4–5 | `story-deborah` | `deborah.ts` | `DEBORAH` |
| 23 | Gideon | JDG 6–7 | `story-gideon` | `gideon.ts` | `GIDEON` |
| 24 | Samson and Delilah | JDG 13–16 | `story-samson` | `samson.ts` | `SAMSON` |
| 25 | Ruth and Naomi | RUT 1–4 | `story-ruth` | `ruth.ts` | `RUTH` |
| 26 | Hannah and the Boy Samuel | 1SA 1–3 | `story-hannah-and-samuel` | `hannahAndSamuel.ts` | `HANNAH_AND_SAMUEL` |
| 27 | David and Goliath | 1SA 17 | `story-david-and-goliath` | `davidAndGoliath.ts` | `DAVID_AND_GOLIATH` |
| 28 | David and Jonathan | 1SA 18–20 | `story-david-and-jonathan` | `davidAndJonathan.ts` | `DAVID_AND_JONATHAN` |
| 29 | David and Bathsheba | 2SA 11–12 | `story-david-and-bathsheba` | `davidAndBathsheba.ts` | `DAVID_AND_BATHSHEBA` |
| 30 | The Wisdom of Solomon | 1KI 3 | `story-solomons-wisdom` | `solomonsWisdom.ts` | `SOLOMONS_WISDOM` |
| 31 | Elijah on Mount Carmel | 1KI 18–19 | `story-elijah-on-mount-carmel` | `elijahOnMountCarmel.ts` | `ELIJAH_ON_MOUNT_CARMEL` |
| 32 | Elisha and Naaman | 2KI 5 | `story-naaman` | `naaman.ts` | `NAAMAN` |
| 33 | Esther | EST 1–10 | `story-esther` | `esther.ts` | `ESTHER` |
| 34 | Job | JOB 1–2; 38–42 | `story-job` | `job.ts` | `JOB` |
| 35 | The Fiery Furnace | DAN 3 | `story-fiery-furnace` | `fieryFurnace.ts` | `FIERY_FURNACE` |
| 36 | Daniel in the Lions' Den | DAN 6 | `story-daniel-lions-den` | `danielLionsDen.ts` | `DANIEL_LIONS_DEN` |
| 37 | Jonah and the Great Fish | JON 1–4 | `story-jonah` | `jonah.ts` | `JONAH` |
| 38 | The Birth of Jesus | MAT 1–2; LUK 1–2 | `story-birth-of-jesus` | `birthOfJesus.ts` | `BIRTH_OF_JESUS` |
| 39 | The Baptism and Temptation of Jesus | MAT 3–4 | `story-baptism-and-temptation` | `baptismAndTemptation.ts` | `BAPTISM_AND_TEMPTATION` |
| 40 | The Wedding at Cana | JHN 2 | `story-wedding-at-cana` | `weddingAtCana.ts` | `WEDDING_AT_CANA` |
| 41 | Jesus Calms the Storm and Walks on Water | MRK 4; MAT 14 | `story-calming-the-storm` | `calmingTheStorm.ts` | `CALMING_THE_STORM` |
| 42 | The Feeding of the Five Thousand | JHN 6 | `story-feeding-five-thousand` | `feedingFiveThousand.ts` | `FEEDING_FIVE_THOUSAND` |
| 43 | The Good Samaritan | LUK 10 | `story-good-samaritan` | `goodSamaritan.ts` | `GOOD_SAMARITAN` |
| 44 | The Prodigal Son | LUK 15 | `story-prodigal-son` | `prodigalSon.ts` | `PRODIGAL_SON` |
| 45 | Zacchaeus | LUK 19 | `story-zacchaeus` | `zacchaeus.ts` | `ZACCHAEUS` |
| 46 | The Raising of Lazarus | JHN 11 | `story-raising-of-lazarus` | `raisingOfLazarus.ts` | `RAISING_OF_LAZARUS` |
| 47 | The Last Supper | LUK 22; JHN 13 | `story-last-supper` | `lastSupper.ts` | `LAST_SUPPER` |
| 48 | The Cross and the Empty Tomb | LUK 23–24; JHN 20 | `story-crucifixion-and-resurrection` | `crucifixionAndResurrection.ts` | `CRUCIFIXION_AND_RESURRECTION` |
| 49 | Pentecost | ACT 2 | `story-pentecost` | `pentecost.ts` | `PENTECOST` |
| 50 | Saul on the Road to Damascus | ACT 9 | `story-damascus-road` | `damascusRoad.ts` | `DAMASCUS_ROAD` |

## What a story is made of

A story mixes the step kinds (see `src/app/common/studyStep/model/StepContent.ts`):

- **scripture**: the passages, a whole chapter or a verse range inside one chapter;
- **text**: the background, written by us, citing a verse for every claim;
- **character**: the profile of a person in the story;
- **image**: a public-domain work of art from Wikimedia Commons (`npx tsx scripts/commons-image.ts`);
- **reflection**: a question, whose answer is saved to the reader's notes;
- **link**: an article or a book, sparingly;
- **video**: only from the sources approved in the admin panel (/admin/sources). None of the stories has one yet.

Each story is in one language. A Spanish version is another study with its own slug.
