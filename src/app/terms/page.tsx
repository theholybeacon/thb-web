import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPlaceholder } from "../components/LegalPlaceholder";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default async function TermsPage() {
  const t = await getTranslations("legal");
  return <LegalPlaceholder title={t("termsTitle")} />;
}
