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

    async getByEmail(email: string): Promise<User | null> {
        return await this.dao.getByEmail(email);
    }

    async update(u: User): Promise<void> {
        return await this.dao.update(u);
    }

    async updateProfile(id: string, data: { name?: string; username?: string; profilePicture?: string; country?: string }): Promise<User> {
        return await this.dao.updateProfile(id, data);
    }

    async delete(id: string): Promise<void> {
        return await this.dao.delete(id);
    }

}

