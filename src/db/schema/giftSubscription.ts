import { AnyPgColumn, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const giftStatusEnum = pgEnum("gift_status", [
	"pending",
	"claimed",
	"expired",
	"refunded",
]);

export const giftSubscriptionTable = pgTable("gift_subscription", {
	id: uuid().defaultRandom().primaryKey(),
	gifterId: uuid()
		.references((): AnyPgColumn => userTable.id)
		.notNull(),
	recipientId: uuid().references((): AnyPgColumn => userTable.id),
	recipientEmail: varchar({ length: 255 }),
	membershipRequestId: uuid(),
	stripePaymentIntentId: varchar({ length: 255 }).notNull(),
	stripeSubscriptionId: varchar({ length: 255 }),
	stripePriceId: varchar({ length: 255 }).notNull(),
	billingInterval: varchar({ length: 10 }).notNull(),
	status: giftStatusEnum().notNull().default("pending"),
	claimToken: varchar({ length: 255 }).notNull().unique(),
	claimedAt: timestamp(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const giftSubscriptionRelations = relations(giftSubscriptionTable, ({ one }) => ({
	gifter: one(userTable, {
		fields: [giftSubscriptionTable.gifterId],
		references: [userTable.id],
		relationName: "gifter",
	}),
	recipient: one(userTable, {
		fields: [giftSubscriptionTable.recipientId],
		references: [userTable.id],
		relationName: "recipient",
	}),
}));

export const insertGiftSubscriptionSchema = createInsertSchema(giftSubscriptionTable);
export const selectGiftSubscriptionSchema = createSelectSchema(giftSubscriptionTable);
