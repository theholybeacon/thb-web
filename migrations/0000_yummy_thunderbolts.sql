CREATE TABLE IF NOT EXISTS "bible" (
	"id" uuid PRIMARY KEY NOT NULL,
	"apiId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"language" varchar(50) NOT NULL,
	"version" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"numBooks" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book" (
	"id" uuid PRIMARY KEY NOT NULL,
	"bibleId" uuid,
	"name" varchar(255) NOT NULL,
	"bookOrder" integer NOT NULL,
	"abbreviation" varchar(10) NOT NULL,
	"numChapters" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapter" (
	"id" uuid PRIMARY KEY NOT NULL,
	"bookId" uuid,
	"chapterNumber" integer NOT NULL,
	"numVerses" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verse" (
	"id" uuid PRIMARY KEY NOT NULL,
	"chapterId" uuid,
	"verseNumber" integer NOT NULL,
	"content" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
