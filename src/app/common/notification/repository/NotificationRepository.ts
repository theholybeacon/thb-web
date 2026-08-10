import { NotificationPostgreSQLDao } from "../dao/NotificationPostgreSQLDao";
import { ClaimedSend, EmailCandidate, EmailKind, EmailSendStatus } from "../model/Notification";

export class NotificationRepository {
	private dao = new NotificationPostgreSQLDao();

	getCandidates(limit: number): Promise<EmailCandidate[]> {
		return this.dao.getCandidates(limit);
	}
	claimSends(rows: { userId: string; kind: EmailKind; sendDate: string }[]): Promise<ClaimedSend[]> {
		return this.dao.claimSends(rows);
	}
	markStatus(ids: string[], status: EmailSendStatus, error?: string): Promise<void> {
		return this.dao.markStatus(ids, status, error);
	}
}
