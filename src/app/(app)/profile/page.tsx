"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { userUpdateProfileSS } from "@/app/common/user/service/server/userUpdateProfileSS";
import { AppShell } from "@/components/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Globe, Camera, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

// Common countries with ISO codes
const COUNTRIES = [
	{ code: "US", name: "United States" },
	{ code: "MX", name: "Mexico" },
	{ code: "ES", name: "Spain" },
	{ code: "AR", name: "Argentina" },
	{ code: "CO", name: "Colombia" },
	{ code: "PE", name: "Peru" },
	{ code: "VE", name: "Venezuela" },
	{ code: "CL", name: "Chile" },
	{ code: "EC", name: "Ecuador" },
	{ code: "GT", name: "Guatemala" },
	{ code: "CU", name: "Cuba" },
	{ code: "BO", name: "Bolivia" },
	{ code: "DO", name: "Dominican Republic" },
	{ code: "HN", name: "Honduras" },
	{ code: "PY", name: "Paraguay" },
	{ code: "SV", name: "El Salvador" },
	{ code: "NI", name: "Nicaragua" },
	{ code: "CR", name: "Costa Rica" },
	{ code: "PA", name: "Panama" },
	{ code: "UY", name: "Uruguay" },
	{ code: "PR", name: "Puerto Rico" },
	{ code: "BR", name: "Brazil" },
	{ code: "CA", name: "Canada" },
	{ code: "GB", name: "United Kingdom" },
	{ code: "DE", name: "Germany" },
	{ code: "FR", name: "France" },
	{ code: "IT", name: "Italy" },
	{ code: "PT", name: "Portugal" },
	{ code: "PH", name: "Philippines" },
	{ code: "IN", name: "India" },
	{ code: "AU", name: "Australia" },
	{ code: "NZ", name: "New Zealand" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function ProfilePage() {
	const t = useTranslations();
	const { user, loading, reload } = useLoggedUserContext();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [profilePicture, setProfilePicture] = useState("");
	const [country, setCountry] = useState("");
	const [saved, setSaved] = useState(false);
	const [uploading, setUploading] = useState(false);

	// Initialize form with user data
	useEffect(() => {
		if (user) {
			setName(user.name || "");
			setUsername(user.username || "");
			setProfilePicture(user.profilePicture || "");
			setCountry(user.country || "");
		}
	}, [user]);

	const updateMutation = useMutation({
		mutationFn: async () => {
			if (!user?.id) throw new Error("User not found");
			return await userUpdateProfileSS({
				userId: user.id,
				name,
				username,
				profilePicture,
				country,
			});
		},
		onSuccess: () => {
			reload?.();
			queryClient.invalidateQueries({ queryKey: ["user"] });
			toast.success(t("toast.saved"));
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		},
		onError: () => {
			toast.error(t("toast.failed"));
		},
	});

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error(t("profile.invalidFileType"));
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error(t("profile.fileTooLarge"));
			return;
		}

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const data = await response.json();
			setProfilePicture(data.url);
			toast.success(t("toast.updated"));
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(t("profile.uploadError"));
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateMutation.mutate();
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	if (loading) {
		return (
			<AppShell>
				<div className="flex h-full items-center justify-center py-20">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			<div className="p-6 lg:p-8">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-3xl font-bold mb-2">{t("profile.title")}</h1>
					<p className="text-muted-foreground mb-8">{t("profile.subtitle")}</p>

					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Profile Picture Section */}
						<div className="flex items-center gap-6">
							<div className="relative">
								<Avatar className="h-24 w-24">
									<AvatarImage src={profilePicture} alt={name} />
									<AvatarFallback className="text-2xl bg-primary/10 text-primary">
										{getInitials(name || "U")}
									</AvatarFallback>
								</Avatar>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleFileChange}
								/>
								<button
									type="button"
									disabled={uploading}
									className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
									onClick={() => fileInputRef.current?.click()}
								>
									{uploading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Camera className="h-4 w-4" />
									)}
								</button>
							</div>
							<div>
								<h3 className="font-semibold">{t("profile.profilePicture")}</h3>
								<p className="text-sm text-muted-foreground">{t("profile.profilePictureHint")}</p>
							</div>
						</div>

						{/* Name */}
						<div className="space-y-2">
							<Label htmlFor="name" className="flex items-center gap-2">
								<User className="h-4 w-4" />
								{t("profile.name")}
							</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t("profile.namePlaceholder")}
							/>
						</div>

						{/* Username */}
						<div className="space-y-2">
							<Label htmlFor="username" className="flex items-center gap-2">
								<span className="text-muted-foreground">@</span>
								{t("profile.username")}
							</Label>
							<Input
								id="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder={t("profile.usernamePlaceholder")}
							/>
						</div>

						{/* Email (read-only) */}
						<div className="space-y-2">
							<Label htmlFor="email" className="flex items-center gap-2">
								<Mail className="h-4 w-4" />
								{t("profile.email")}
							</Label>
							<Input
								id="email"
								value={user?.email || ""}
								disabled
								className="bg-muted"
							/>
							<p className="text-xs text-muted-foreground">{t("profile.emailHint")}</p>
						</div>

						{/* Country */}
						<div className="space-y-2">
							<Label htmlFor="country" className="flex items-center gap-2">
								<Globe className="h-4 w-4" />
								{t("profile.country")}
							</Label>
							<Select value={country} onValueChange={setCountry}>
								<SelectTrigger>
									<SelectValue placeholder={t("profile.selectCountry")} />
								</SelectTrigger>
								<SelectContent>
									{COUNTRIES.map((c) => (
										<SelectItem key={c.code} value={c.code}>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Submit Button */}
						<div className="flex items-center gap-4">
							<Button
								type="submit"
								disabled={updateMutation.isPending || uploading}
								className={cn(
									"min-w-[140px]",
									saved && "bg-green-600 hover:bg-green-600"
								)}
							>
								{updateMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t("common.saving")}
									</>
								) : saved ? (
									<>
										<Check className="mr-2 h-4 w-4" />
										{t("profile.saved")}
									</>
								) : (
									t("profile.saveChanges")
								)}
							</Button>
							{updateMutation.isError && (
								<p className="text-sm text-destructive">{t("common.error")}</p>
							)}
						</div>
					</form>
				</div>
			</div>
		</AppShell>
	);
}
