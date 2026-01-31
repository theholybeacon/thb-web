'use server';

import { SessionRepository } from "../repository/SessionRepository";

export async function sessionUpdateProgressSS(
    sessionId: string,
    bookAbbreviation: string | null,
    chapter: number | null,
    verse: number | null
): Promise<void> {
    const repository = new SessionRepository();
    await repository.updateProgress(sessionId, bookAbbreviation, chapter, verse);
}
