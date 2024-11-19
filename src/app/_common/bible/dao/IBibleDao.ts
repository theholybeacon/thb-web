import { Bible } from "../model/Bible";

export interface IBibleDao {
	create(bible: Bible): Promise<Bible>;
	getAll(): Promise<Bible[]>;
}

