"use server";

import { ENTITY_INDEX_PAGE_SIZE, EntityIndexPage } from "../../model/Entity";
import { EntityRepository } from "../../repository/EntityRepository";

/**
 * A page of the browsable character index at /bible/people, plus the set of
 * initial letters that actually have characters behind them.
 */
export async function entityListForIndexSS(opts: {
	letter?: string;
	query?: string;
	page?: number;
}): Promise<EntityIndexPage> {
	const repo = new EntityRepository();
	const page = Math.max(1, opts.page ?? 1);

	const [{ rows, total }, letters] = await Promise.all([
		repo.listForIndex({
			letter: opts.letter,
			query: opts.query,
			limit: ENTITY_INDEX_PAGE_SIZE,
			offset: (page - 1) * ENTITY_INDEX_PAGE_SIZE,
		}),
		repo.listIndexLetters(),
	]);

	return { rows, total, letters, page, pageSize: ENTITY_INDEX_PAGE_SIZE };
}
