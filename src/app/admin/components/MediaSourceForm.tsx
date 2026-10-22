"use client";

import { useActionState, useEffect, useRef } from "react";
import { mediaSourceCreateSS, MediaSourceFormState } from "@/app/common/mediaSource/service/server/mediaSourceSS";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Adds an approved source; clears itself once the source is saved. */
export function MediaSourceForm() {
	const [state, action, pending] = useActionState<MediaSourceFormState, FormData>(mediaSourceCreateSS, { error: null });
	const form = useRef<HTMLFormElement>(null);
	const submitted = useRef(false);

	useEffect(() => {
		if (submitted.current && !pending && !state.error) form.current?.reset();
	}, [pending, state]);

	return (
		<form ref={form} action={(data) => { submitted.current = true; action(data); }} className="grid gap-4 md:grid-cols-2">
			<div className="space-y-1.5">
				<Label htmlFor="source-kind">Kind</Label>
				<select
					id="source-kind"
					name="kind"
					required
					defaultValue="youtube_channel"
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="youtube_channel">YouTube channel</option>
					<option value="image_archive">Image archive</option>
					<option value="website">Website</option>
				</select>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="source-name">Name</Label>
				<Input id="source-name" name="name" required maxLength={255} placeholder="BibleProject" />
			</div>
			<div className="space-y-1.5 md:col-span-2">
				<Label htmlFor="source-url">Address</Label>
				<Input id="source-url" name="url" type="url" required placeholder="https://www.youtube.com/@bibleproject" />
			</div>
			<div className="space-y-1.5 md:col-span-2">
				<Label htmlFor="source-notes">Notes</Label>
				<Textarea id="source-notes" name="notes" rows={2} placeholder="What to use it for, licence terms, anything to avoid." />
			</div>
			<div className="flex items-center gap-3 md:col-span-2">
				<Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add source"}</Button>
				{state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
			</div>
		</form>
	);
}
