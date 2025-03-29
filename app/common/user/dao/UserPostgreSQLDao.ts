import { User, UserInsert } from "../model/User";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { logger } from "../../../utils/logger";
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


    async update(u: User): Promise<void> {
        log.trace("update");
        await db.update(userTable).set({
            username: u.username,
            email: u.email,
            isEmailVerified: u.isEmailVerified,
        }).where(eq(userTable.id, u.id));
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

