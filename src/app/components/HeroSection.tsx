import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-holyBlue-50/30 to-transparent dark:from-holyDark-300/30 dark:to-transparent" >
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Illuminate Your Path Through the Word
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                The Holy Beacon is a smart, spiritually-aligned productivity tool that helps believers build a
                deeper, more meaningful relationship with Scripture—one that adapts to your lifestyle, learning
                style, and spiritual maturity.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="bg-holyTan-600 hover:bg-holyTan-700 text-white">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="#roadmap">
                <Button size="lg" variant="outline">
                  View Roadmap
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto flex items-center justify-center">
            <Image
              src="/placeholder.svg?height=550&width=550"
              width={550}
              height={550}
              alt="The Holy Beacon App"
              className="rounded-xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </section >
  );
}
