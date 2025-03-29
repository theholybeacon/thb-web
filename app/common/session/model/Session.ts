
import { sessionTable } from "@/db/schema/session";
import { User } from "../../user/model/User";
import { Book } from "../../book/model/Book";
import { Chapter } from "../../chapter/model/Chapter";
import { Verse } from "../../verse/model/Verse";
import { StudyFull } from "../../study/model/Study";


export type SessionInsert = typeof sessionTable.$inferInsert;


export type Session = typeof sessionTable.$inferSelect;

export type SessionFull = typeof sessionTable.$inferSelect & {
    user: User,
    study: StudyFull,
    currentBook: Book | null,
    currentChapter: Chapter | null,
    currentVerse: Verse | null
};


