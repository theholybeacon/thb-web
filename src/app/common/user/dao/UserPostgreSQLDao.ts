import { User, UserInsert } from "../model/User";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { logger } from "@/app/utils/logger";
import { userTable } from "@/db/schema/user";



const log = logger.child({ module: 'UserPostgreSQLDao' });
export class UserPostgreSQLDao {


    async create(u: UserInsert): Promise<User> {
        log.trace("create");
        const response = await db.insert(userTable).values(u).returning();
        return response[0];
    }

    async getById(id: string): Promise<User> {
        log.trace("getById");
        const response = await db.query.userTable.findFirst({
            where: eq(userTable.id, id),
        });
        if (!response) {
            throw ("User not found");
        } else {
            return response;
        }
    }

    async getByAuthId(authId: string): Promise<User> {
        log.trace("getByAuthId");

        const response = await db.query.userTable.findFirst({
            where: eq(userTable.authId, authId),
        });
        if (!response) {
            throw ("User not found");
        } else {
            return response;
        }
    }

    async getByEmail(email: string): Promise<User | null> {
        log.trace("getByEmail");

        const response = await db.query.userTable.findFirst({
            where: eq(userTable.email, email),
        });
        return response || null;
    }


    async update(u: User): Promise<void> {
        log.trace("update");
        await db.update(userTable).set({
            name: u.name,
            username: u.username,
            email: u.email,
            isEmailVerified: u.isEmailVerified,
            authId: u.authId,
            profilePicture: u.profilePicture,
            country: u.country,
        }).where(eq(userTable.id, u.id));
    }

    async updateProfile(id: string, data: { name?: string; username?: string; profilePicture?: string; country?: string }): Promise<User> {
        log.trace("updateProfile");
        const result = await db.update(userTable)
            .set(data)
            .where(eq(userTable.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string): Promise<void> {
        log.trace("delete");

        await db.transaction(async (tx) => {

            await tx
                .delete(userTable)
                .where(eq(userTable.id, id));

        });
    }
}

