import { UserPostgreSQLDao } from "../dao/UserPostgreSQLDao";
import { User, UserInsert } from "../model/User";

export class UserRepository {

    dao: UserPostgreSQLDao = new UserPostgreSQLDao();

    async create(u: UserInsert): Promise<User> {
        return await this.dao.create(u);
    }

    async getById(id: string): Promise<User> {
        return await this.dao.getById(id);
    }
    async getByAuthId(authId: string): Promise<User> {
        return await this.dao.getByAuthId(authId);
    }

    async update(u: User): Promise<void> {
        return await this.dao.update(u);
    }

    async delete(id: string): Promise<void> {
        return await this.dao.delete(id);
    }

}

