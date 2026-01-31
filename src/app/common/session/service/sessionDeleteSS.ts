'use server';

import { SessionRepository } from "../repository/SessionRepository";

export async function sessionDeleteSS(id: string): Promise<void> {
    const repository = new SessionRepository();
    await repository.delete(id);
}
