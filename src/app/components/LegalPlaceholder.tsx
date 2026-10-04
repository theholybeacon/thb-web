import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "../layout/components/Header";
import { Footer } from "../layout/components/Footer";

/**
 * Shell for /terms and /privacy until the real legal text is written.
 * They exist now because the sign-up form links to them and, without a page,
 * those links bounced anonymous visitors to the login screen.
 */
export async function LegalPlaceholder({ title }: { title: string }) {
  const t = await getTranslations("legal");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h1 className="font-heading text-3xl font-bold mb-6">{title}</h1>
          {/* TODO: replace with the final legal text. */}
          <p className="text-muted-foreground mb-4">{t("comingSoon")}</p>
          <p className="text-muted-foreground">
            {t("questions")}{" "}
            <Link href="/" className="text-primary hover:text-primary/80">
              {t("backHome")}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
