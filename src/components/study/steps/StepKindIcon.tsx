import { BookOpen, FileText, Image as ImageIcon, Link2, MessageCircleQuestion, PlayCircle, User } from "lucide-react";
import type { StepKind } from "@/app/common/studyStep/model/StepContent";
import { cn } from "@/lib/utils";

/** One icon per step kind, shared by the session sidebar, the study page and the catalog. */
export function StepKindIcon({ kind, className }: { kind: StepKind | string; className?: string }) {
	const cls = cn("h-3.5 w-3.5", className);
	switch (kind) {
		case "text":
			return <FileText className={cls} />;
		case "reflection":
			return <MessageCircleQuestion className={cls} />;
		case "character":
			return <User className={cls} />;
		case "image":
			return <ImageIcon className={cls} />;
		case "video":
			return <PlayCircle className={cls} />;
		case "link":
			return <Link2 className={cls} />;
		default:
			return <BookOpen className={cls} />;
	}
}

/** Literal keys so next-intl can type-check them; a template key cannot be. */
export const STEP_KIND_LABEL_KEY: Record<StepKind, string> = {
	scripture: "stepKinds.scripture",
	text: "stepKinds.text",
	reflection: "stepKinds.reflection",
	character: "stepKinds.character",
	image: "stepKinds.image",
	video: "stepKinds.video",
	link: "stepKinds.link",
};
