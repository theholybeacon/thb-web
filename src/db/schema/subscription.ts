import { AnyPgColumn, boolean, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
	"active",
	"canceled",
	"past_due",
	"incomplete",
	"trialing",
	"unpaid",
]);

export const billingIntervalEnum = pgEnum("billing_interval", ["month", "year"]);

export const subscriptionTable = pgTable("subscription", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid()
		.references((): AnyPgColumn => userTable.id)
		.notNull()
		.unique(),
	stripeCustomerId: varchar({ length: 255 }).notNull(),
	stripeSubscriptionId: varchar({ length: 255 }).notNull().unique(),
	stripePriceId: varchar({ length: 255 }).notNull(),
	status: subscriptionStatusEnum().notNull().default("incomplete"),
	billingInterval: billingIntervalEnum().notNull(),
	currentPeriodStart: timestamp().notNull(),
	currentPeriodEnd: timestamp().notNull(),
	cancelAtPeriodEnd: boolean().notNull().default(false),
	canceledAt: timestamp(),
	gifterId: uuid().references((): AnyPgColumn => userTable.id),
	giftSubscriptionId: uuid(),
	membershipRequestId: uuid(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const subscriptionRelations = relations(subscriptionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [subscriptionTable.userId],
		references: [userTable.id],
		relationName: "subscriptionUser",
	}),
	gifter: one(userTable, {
		fields: [subscriptionTable.gifterId],
		references: [userTable.id],
		relationName: "subscriptionGifter",
	}),
}));

export const insertSubscriptionSchema = createInsertSchema(subscriptionTable);
export const selectSubscriptionSchema = createSelectSchema(subscriptionTable);
