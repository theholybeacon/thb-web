import { userTable } from "@/db/schema/user";

export type UserInsert = typeof userTable.$inferInsert;
export type User = typeof userTable.$inferSelect;

