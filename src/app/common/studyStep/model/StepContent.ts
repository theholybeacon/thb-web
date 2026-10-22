import { z } from "zod";

/**
 * What a study step is. A scripture step is a passage, read / listened to /
 * typed in the reader; every other kind carries its own material in
 * study_step.content and is completed with "done".
 *
 * Kept free of any drizzle/db imports so client components can use it.
 */
export const STEP_KINDS = ["scripture", "text", "reflection", "character", "image", "video", "link"] as const;

export type StepKind = (typeof STEP_KINDS)[number];

export function isStepKind(value: unknown): value is StepKind {
	return typeof value === "string" && (STEP_KINDS as readonly string[]).includes(value);
}

/** The material of a step that is not Scripture, one shape per kind. */
const https = z.string().url().refine((u) => u.startsWith("https://"), "must be an https URL");

export const textContentSchema = z.object({
	kind: z.literal("text"),
	/** Paragraphs separated by a blank line. Plain text: no markup is rendered. */
	body: z.string().trim().min(1).max(8000),
});

export const reflectionContentSchema = z.object({
	kind: z.literal("reflection"),
	/** The question the reader answers. Their answer is saved as a note. */
	prompt: z.string().trim().min(1).max(1000),
});

export const characterContentSchema = z.object({
	kind: z.literal("character"),
	/** entity.slug, e.g. "noah_2203". The step shows that character's profile. */
	entitySlug: z.string().trim().min(1).max(160),
	/** Why this person matters to the study, in a sentence or two. */
	note: z.string().trim().max(2000).optional(),
});

export const imageContentSchema = z.object({
	kind: z.literal("image"),
	url: https,
	/** Describes the picture for screen readers. */
	alt: z.string().trim().min(1).max(500),
	caption: z.string().trim().max(1000).optional(),
	/** Artist, work and licence, e.g. "Gustave Doré, The Deluge (1866). Public domain." */
	credit: z.string().trim().min(1).max(500),
	/** The page the image came from, for attribution. */
	sourceUrl: https.optional(),
});

export const videoContentSchema = z.object({
	kind: z.literal("video"),
	provider: z.literal("youtube"),
	/** The 11-character YouTube id, not a URL. */
	videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "must be an 11-character YouTube id"),
	/** Seconds into the video to start and stop at. */
	start: z.number().int().min(0).optional(),
	end: z.number().int().min(1).optional(),
	caption: z.string().trim().max(1000).optional(),
	/** The channel it comes from. */
	credit: z.string().trim().min(1).max(500),
});

export const LINK_TYPES = ["article", "book", "website"] as const;

export const linkContentSchema = z.object({
	kind: z.literal("link"),
	linkType: z.enum(LINK_TYPES),
	url: https,
	title: z.string().trim().min(1).max(500),
	author: z.string().trim().max(255).optional(),
	/** Publisher or site name. */
	source: z.string().trim().max(255).optional(),
	description: z.string().trim().max(2000).optional(),
});

export const stepContentSchema = z.discriminatedUnion("kind", [
	textContentSchema,
	reflectionContentSchema,
	characterContentSchema,
	imageContentSchema,
	videoContentSchema,
	linkContentSchema,
]).superRefine((content, ctx) => {
	if (content.kind === "video" && content.start !== undefined && content.end !== undefined && content.end <= content.start) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "video end must be after start", path: ["end"] });
	}
});

export type StepContent = z.infer<typeof stepContentSchema>;
export type TextContent = z.infer<typeof textContentSchema>;
export type ReflectionContent = z.infer<typeof reflectionContentSchema>;
export type CharacterContent = z.infer<typeof characterContentSchema>;
export type ImageContent = z.infer<typeof imageContentSchema>;
export type VideoContent = z.infer<typeof videoContentSchema>;
export type LinkContent = z.infer<typeof linkContentSchema>;

/** The kinds that live in `content`, i.e. every kind but scripture. */
export type ContentStepKind = StepContent["kind"];

/**
 * Problems with a step's kind and content, or none. The one check every path
 * that writes steps goes through: the seed, the AI generator, adoption.
 */
export function stepContentProblems(step: {
	kind?: string | null;
	content?: unknown;
	bookAbbreviation?: string | null;
}): string[] {
	const kind = step.kind ?? "scripture";
	if (!isStepKind(kind)) return [`unknown step kind "${kind}"`];

	if (kind === "scripture") {
		const problems: string[] = [];
		if (!step.bookAbbreviation) problems.push("a scripture step needs a book");
		if (step.content != null) problems.push("a scripture step has no content");
		return problems;
	}

	const parsed = stepContentSchema.safeParse(step.content);
	if (!parsed.success) {
		return parsed.error.issues.map((issue) => `${issue.path.join(".") || "content"}: ${issue.message}`);
	}
	if (parsed.data.kind !== kind) return [`content is "${parsed.data.kind}" but the step is "${kind}"`];
	return [];
}

/** The embed URL of a video step, starting where the step starts. */
export function youtubeEmbedUrl(video: Pick<VideoContent, "videoId" | "start" | "end">): string {
	const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
	if (video.start) params.set("start", String(video.start));
	if (video.end) params.set("end", String(video.end));
	// youtube-nocookie: no tracking cookies until the reader presses play.
	return `https://www.youtube-nocookie.com/embed/${video.videoId}?${params}`;
}

/**
 * True when every step is a passage, the only kind the study builder edits
 * (see studyBuilderSS). Anything else keeps the study out of the builder.
 */
export function studyIsOnlyPassages(steps: { kind?: string | null }[]): boolean {
	return steps.every((step) => (step.kind ?? "scripture") === "scripture");
}
