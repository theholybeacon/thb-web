import { CompletionPostgreSQLDao } from "../dao/CompletionPostgreSQLDao";
import {
	ChapterCompletion,
	ChapterCompletionInsert,
	ChapterTally,
	ChapterTallyPair,
	JourneyScopeOption,
	ModeTotals,
	UserBadge,
} from "../model/Completion";

export class CompletionRepository {
	private dao = new CompletionPostgreSQLDao();

	/** `bibleId` undefined = every translation; a set value narrows to one. */
	getTallies(userId: string, bibleId?: string | null): Promise<ChapterTally[]> {
		return this.dao.getTallies(userId, bibleId);
	}
	getTallyPairs(userId: string, bibleId: string): Promise<ChapterTallyPair[]> {
		return this.dao.getTallyPairs(userId, bibleId);
	}
	getModeTotals(userId: string, bibleId?: string | null): Promise<Record<string, ModeTotals>> {
		return this.dao.getModeTotals(userId, bibleId);
	}
	getCountsByDate(
		userId: string,
		sinceDate: string,
		bibleId?: string | null,
	): Promise<Map<string, number>> {
		return this.dao.getCountsByDate(userId, sinceDate, bibleId);
	}
	getChapterHistory(
		userId: string,
		bookAbbreviation: string,
		chapter: number,
	): Promise<ChapterCompletion[]> {
		return this.dao.getChapterHistory(userId, bookAbbreviation, chapter);
	}
	getChapterHistoryInBible(
		userId: string,
		bookAbbreviation: string,
		chapter: number,
		bibleId: string | null,
	): Promise<ChapterCompletion[]> {
		return this.dao.getChapterHistoryInBible(userId, bookAbbreviation, chapter, bibleId);
	}
	getRecordedBibles(userId: string): Promise<JourneyScopeOption[]> {
		return this.dao.getRecordedBibles(userId);
	}
	insert(row: ChapterCompletionInsert): Promise<ChapterCompletion | null> {
		return this.dao.insert(row);
	}
	getBadges(userId: string): Promise<UserBadge[]> {
		return this.dao.getBadges(userId);
	}
	/** `bibleId` null awards the global badge, a set value the translation-scoped one. */
	awardBadges(userId: string, badgeKeys: string[], bibleId: string | null): Promise<string[]> {
		return this.dao.awardBadges(userId, badgeKeys, bibleId);
	}
}
