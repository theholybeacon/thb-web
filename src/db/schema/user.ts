import { AnyPgColumn, pgTable, uuid, varchar, boolean, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { studyTable } from './study';
import { relations } from 'drizzle-orm';
import { bibleTable } from './bible';

export const userTable = pgTable("user", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 255 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),
	authId: varchar({ length: 255 }).notNull().unique(),
	isEmailVerified: boolean().notNull().default(false),
	defaultBibleId: uuid().references((): AnyPgColumn => bibleTable.id),
	// Profile fields
	profilePicture: text(),
	country: varchar({ length: 2 }), // ISO 3166-1 alpha-2 country code
	timezone: varchar({ length: 64 }), // IANA zone (e.g. America/Bogota), captured client-side
	// Notifications
	emailRemindersEnabled: boolean().notNull().default(true),
	// Opt-in gate for the public /u/[username] progress profile. Off by default —
	// reading habits must never become public without an explicit choice.
	publicProfileEnabled: boolean().notNull().default(false),
	// Stripe
	stripeCustomerId: varchar({ length: 255 }),
	// Comp tier granted out-of-band (scripts/grant-lifetime.ts), independent of
	// Stripe — a lifetime user has no `subscription` row. See src/lib/premium.ts.
	lifetimePremium: boolean().notNull().default(false),
	lifetimePremiumGrantedAt: timestamp(),
	// The welcome week: premium until this moment, granted once per reader on
	// the first sign-in after it shipped (welcomePremiumClaimSS). NULL means not
	// granted yet; a past date means it was used up. See src/lib/premium.ts.
	welcomePremiumEndsAt: timestamp(),
	// Opens the /admin panel. Set by hand in the database and nowhere else: no
	// DAO, service or script in this codebase writes it, and none may.
	isAdmin: boolean().notNull().default(false),
	createdAt: timestamp().defaultNow(),
});

export const userRelations = relations(userTable, ({ one, many }) => ({
	studies: many(studyTable, { relationName: "studyOwner" }),
	createdStudies: many(studyTable, { relationName: "studyCreator" }),
	defaultBible: one(bibleTable, {
		fields: [userTable.defaultBibleId],
		references: [bibleTable.id],
	}),
}));

export const insertUserSchema = createInsertSchema(userTable);
export const selectUserSchema = createSelectSchema(userTable);
