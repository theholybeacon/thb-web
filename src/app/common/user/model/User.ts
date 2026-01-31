import { userTable } from "@/db/schema/user";
import { Bible } from "../../bible/model/Bible";

export type UserInsert = typeof userTable.$inferInsert;
export type User = typeof userTable.$inferSelect;

export type UserWithDefaultBible = User & {
    defaultBible: Bible | null;
}
