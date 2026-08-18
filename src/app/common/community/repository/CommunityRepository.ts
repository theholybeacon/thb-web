import { CommunityPostgreSQLDao } from "../dao/CommunityPostgreSQLDao";
import {
	Author,
	CommunityComment,
	CommunityCommentInsert,
	CommunityFlagInsert,
	Contribution,
	ContributionInsert,
	VoteTargetType,
} from "../model/Community";
import type { RefLinkMap } from "@/components/entity/CitationLinks";
import type {
	CommunityFeedFacets,
	CommunityFeedFilters,
	CommunityFeedRow,
	CommunityFeedSort,
} from "../model/CommunityFeed";

export class CommunityRepository {
	private dao = new CommunityPostgreSQLDao();

	listContributions(entityId: string): Promise<(Contribution & { author: Author })[]> {
		return this.dao.listContributions(entityId);
	}
	listScriptureContributions(
		bibleId: string,
		bookAbbreviation: string,
		chapter: number,
		limit?: number,
	): Promise<(Contribution & { author: Author })[]> {
		return this.dao.listScriptureContributions(bibleId, bookAbbreviation, chapter, limit);
	}
	/** A page of the global feed. Filters removed rows in SQL — see the DAO. */
	listFeed(
		opts: CommunityFeedFilters & { sort: CommunityFeedSort; limit: number; offset: number },
	): Promise<{ rows: CommunityFeedRow[]; total: number }> {
		return this.dao.listFeed(opts);
	}
	listFeedFacets(): Promise<CommunityFeedFacets> {
		return this.dao.listFeedFacets();
	}
	listCitationLinkMaps(bibleIds: string[]): Promise<Record<string, RefLinkMap>> {
		return this.dao.listCitationLinkMaps(bibleIds);
	}
	listComments(contributionIds: string[]): Promise<(CommunityComment & { author: Author })[]> {
		return this.dao.listComments(contributionIds);
	}
	getUserVotes(userId: string, targetType: VoteTargetType, targetIds: string[]): Promise<Map<string, number>> {
		return this.dao.getUserVotes(userId, targetType, targetIds);
	}
	createContribution(input: ContributionInsert): Promise<Contribution> {
		return this.dao.createContribution(input);
	}
	createComment(input: CommunityCommentInsert): Promise<CommunityComment> {
		return this.dao.createComment(input);
	}
	/** Soft-delete, scoped to the author — a no-op on someone else's post. */
	remove(targetType: VoteTargetType, id: string, userId: string): Promise<void> {
		return this.dao.remove(targetType, id, userId);
	}
	setVote(targetType: VoteTargetType, targetId: string, userId: string, value: number): Promise<number> {
		return this.dao.setVote(targetType, targetId, userId, value);
	}
	createFlag(input: CommunityFlagInsert): Promise<void> {
		return this.dao.createFlag(input);
	}
	getLastContributionAt(userId: string): Promise<Date | null> {
		return this.dao.getLastContributionAt(userId);
	}
}
