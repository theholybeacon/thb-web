import { Bible } from "../model/Bible";

export interface IBibleDao {
	create(bible: Bible): Promise<string>;
	getAll(): Promise<Bible[]>;
}

