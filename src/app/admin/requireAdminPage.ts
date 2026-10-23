import { notFound } from "next/navigation";
import { requireAdminSS } from "@/app/common/admin/service/server/requireAdminSS";

/**
 * The admin check for a page. The layout makes the same check, but Next
 * renders a page alongside its layout rather than after it, so each page
 * answers 404 itself instead of letting its data calls throw.
 */
export async function requireAdminPage(): Promise<void> {
	try {
		await requireAdminSS();
	} catch {
		notFound();
	}
}
