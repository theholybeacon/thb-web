import { CompletionPostgreSQLDao } from "../dao/CompletionPostgreSQLDao";
import {
	ChapterCompletion,
	ChapterCompletionInsert,
	ChapterTally,
	ModeTotals,
	UserBadge,
} from "../model/Completion";

export class CompletionRepository {
	private dao = new CompletionPostgreSQLDao();

	getTallies(userId: string): Promise<ChapterTally[]> {
		return this.dao.getTallies(userId);
	}
	getModeTotals(userId: string): Promise<Record<string, ModeTotals>> {
		return this.dao.getModeTotals(userId);
	}
	getCountsByDate(userId: string, sinceDate: string): Promise<Map<string, number>> {
		return this.dao.getCountsByDate(userId, sinceDate);
	}
	getChapterHistory(
		userId: string,
		bookAbbreviation: string,
		chapter: number,
	): Promise<ChapterCompletion[]> {
		return this.dao.getChapterHistory(userId, bookAbbreviation, chapter);
	}
	insert(row: ChapterCompletionInsert): Promise<ChapterCompletion | null> {
		return this.dao.insert(row);
	}
	getBadges(userId: string): Promise<UserBadge[]> {
		return this.dao.getBadges(userId);
	}
	awardBadges(userId: string, badgeKeys: string[]): Promise<string[]> {
		return this.dao.awardBadges(userId, badgeKeys);
	}
}
