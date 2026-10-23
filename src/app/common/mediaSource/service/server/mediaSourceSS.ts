"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSS } from "@/app/common/admin/service/server/requireAdminSS";
import { MediaSourceRepository } from "../../repository/MediaSourceRepository";
import { isMediaSourceKind, MediaSource } from "../../model/MediaSource";

/** The approved image and video sources, for the admin panel. Admins only. */
export async function mediaSourceListSS(): Promise<MediaSource[]> {
	await requireAdminSS();
	return await new MediaSourceRepository().getAll();
}

export type MediaSourceFormState = { error: string | null };

/** Adds a source from the admin panel's form. Admins only. */
export async function mediaSourceCreateSS(_prev: MediaSourceFormState, form: FormData): Promise<MediaSourceFormState> {
	const user = await requireAdminSS();

	const kind = String(form.get("kind") ?? "");
	const name = String(form.get("name") ?? "").trim();
	const url = String(form.get("url") ?? "").trim();
	const notes = String(form.get("notes") ?? "").trim();

	if (!isMediaSourceKind(kind)) return { error: "Choose what kind of source it is." };
	if (!name || name.length > 255) return { error: "Give the source a name (up to 255 characters)." };
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:") return { error: "The address must start with https://." };
	} catch {
		return { error: "The address is not a valid URL." };
	}
	if (url.length > 1000) return { error: "The address is too long." };

	await new MediaSourceRepository().create({ kind, name, url, notes: notes || null, addedById: user.id });
	revalidatePath("/admin/sources");
	return { error: null };
}

/** Removes a source. Admins only. Steps already using it are not touched. */
export async function mediaSourceDeleteSS(form: FormData): Promise<void> {
	await requireAdminSS();
	const id = String(form.get("id") ?? "");
	if (!/^[0-9a-f-]{36}$/i.test(id)) return;
	await new MediaSourceRepository().delete(id);
	revalidatePath("/admin/sources");
}
