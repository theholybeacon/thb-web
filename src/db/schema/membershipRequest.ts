import { AnyPgColumn, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const membershipRequestStatusEnum = pgEnum("membership_request_status", [
	"pending",
	"fulfilled",
	"canceled",
	"expired",
]);

export const membershipRequestTable = pgTable("membership_request", {
	id: uuid().defaultRandom().primaryKey(),
	requesterId: uuid()
		.references((): AnyPgColumn => userTable.id)
		.notNull(),
	fulfillerId: uuid().references((): AnyPgColumn => userTable.id),
	status: membershipRequestStatusEnum().notNull().default("pending"),
	message: text(),
	requesterName: varchar({ length: 255 }).notNull(),
	requesterCountry: varchar({ length: 2 }),
	fulfilledAt: timestamp(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const membershipRequestRelations = relations(membershipRequestTable, ({ one }) => ({
	requester: one(userTable, {
		fields: [membershipRequestTable.requesterId],
		references: [userTable.id],
		relationName: "requester",
	}),
	fulfiller: one(userTable, {
		fields: [membershipRequestTable.fulfillerId],
		references: [userTable.id],
		relationName: "fulfiller",
	}),
}));

export const insertMembershipRequestSchema = createInsertSchema(membershipRequestTable);
export const selectMembershipRequestSchema = createSelectSchema(membershipRequestTable);
