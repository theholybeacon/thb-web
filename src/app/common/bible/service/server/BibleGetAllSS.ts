import { Bible } from "../../model/Bible";
import { BibleRepository } from "../../repository/BibleRepository";

export class BibleGetAllSS {

	_bibleRepository = new BibleRepository();

	async execute(): Promise<Bible[]> {
		return await this._bibleRepository.getAll();
	}
}


