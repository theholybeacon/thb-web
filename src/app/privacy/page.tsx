import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPlaceholder } from "../components/LegalPlaceholder";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPage() {
  const t = await getTranslations("legal");
  return <LegalPlaceholder title={t("privacyTitle")} />;
}
