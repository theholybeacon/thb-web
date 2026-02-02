"use client";

import { Sun } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("landing.footer");

    return (
        <footer className="w-full border-t bg-background py-6 md:py-12">
            <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8 px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Sun className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">The Holy Beacon</span>
                </div>
                {/* <nav className="flex gap-4 sm:gap-6"> */}
                {/*     <Link href="#" className="text-sm font-medium hover:underline underline-offset-4"> */}
                {/*         Privacy */}
                {/*     </Link> */}
                {/*     <Link href="#" className="text-sm font-medium hover:underline underline-offset-4"> */}
                {/*         Terms */}
                {/*     </Link> */}
                {/*     <Link href="#" className="text-sm font-medium hover:underline underline-offset-4"> */}
                {/*         Contact */}
                {/*     </Link> */}
                {/* </nav> */}
                <div className="flex-1 text-center md:text-right text-sm">
                    &copy; {new Date().getFullYear()} The Holy Beacon. {t("allRightsReserved")}
                </div>
            </div>
        </footer>
    );

}
