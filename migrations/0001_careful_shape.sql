ALTER TABLE "bible" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "bibleId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "abbreviation" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "chapter" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "chapter" ALTER COLUMN "bookId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "verse" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "verse" ALTER COLUMN "chapterId" SET NOT NULL;