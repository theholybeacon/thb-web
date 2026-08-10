import { ActivityPostgreSQLDao } from "../dao/ActivityPostgreSQLDao";

export class ActivityRepository {
	private dao = new ActivityPostgreSQLDao();

	upsert(userId: string, activityDate: string, source: string | null): Promise<void> {
		return this.dao.upsert(userId, activityDate, source);
	}
	getDates(userId: string, sinceDate: string): Promise<string[]> {
		return this.dao.getDates(userId, sinceDate);
	}
	getDatesForUsers(userIds: string[], sinceDate: string): Promise<Map<string, string[]>> {
		return this.dao.getDatesForUsers(userIds, sinceDate);
	}
}
