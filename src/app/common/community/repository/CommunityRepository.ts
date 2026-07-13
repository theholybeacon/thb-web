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

export class CommunityRepository {
	private dao = new CommunityPostgreSQLDao();

	listContributions(entityId: string): Promise<(Contribution & { author: Author })[]> {
		return this.dao.listContributions(entityId);
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
