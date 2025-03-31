import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, Clock4, Headphones, Users } from "lucide-react";

export function FeaturePreviewSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-holyDark-100/5" >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-holyBlue-100 px-3 py-1 text-sm text-holyBlue-800">
              <Clock4 className="h-4 w-4" />
              <span>Coming Soon</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Feature Previews</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Get a sneak peek at the exciting features we're developing for future releases.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          {/* Scripture in HD Preview */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm bg-white/80 dark:bg-holyDark-100/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-holyBlue-900/10 dark:bg-holyDark-400/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="outline" className="bg-white/80 dark:bg-holyDark-200/80">
                <span className="mr-2">Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-full bg-holyGold-100 p-3 dark:bg-holyGold-100/20">
              <Bookmark className="h-8 w-8 text-holyTan-700 dark:text-holyGold-300" />
            </div>
            <div className="absolute top-2 right-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-holyBlue-100 px-2 py-1 text-xs text-holyBlue-800 dark:bg-holyBlue-900/20 dark:text-holyBlue-300">
                <Clock4 className="h-3 w-3" />
                <span>Q2 2025</span>
              </div>
            </div>
            <h3 className="text-xl font-bold">Scripture in HD</h3>
            <p className="text-center text-muted-foreground">
              Smart links, character profiles, and contextual layers that bring the Bible to life.
            </p>
          </div>

          {/* Multi-Modal Preview */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm bg-white/80 dark:bg-holyDark-100/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-holyBlue-900/10 dark:bg-holyDark-400/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="outline" className="bg-white/80 dark:bg-holyDark-200/80">
                <span className="mr-2">Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-full bg-holyGold-100 p-3 dark:bg-holyGold-100/20">
              <Headphones className="h-8 w-8 text-holyTan-700 dark:text-holyGold-300" />
            </div>
            <div className="absolute top-2 right-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-holyBlue-100 px-2 py-1 text-xs text-holyBlue-800 dark:bg-holyBlue-900/20 dark:text-holyBlue-300">
                <Clock4 className="h-3 w-3" />
                <span>Q3 2025</span>
              </div>
            </div>
            <h3 className="text-xl font-bold">Multi-Modal Bible</h3>
            <p className="text-center text-muted-foreground">
              Experience Scripture through reading, listening, and visual engagement.
            </p>
          </div>

          {/* Community Preview */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm bg-white/80 dark:bg-holyDark-100/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-holyBlue-900/10 dark:bg-holyDark-400/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="outline" className="bg-white/80 dark:bg-holyDark-200/80">
                <span className="mr-2">Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-full bg-holyGold-100 p-3 dark:bg-holyGold-100/20">
              <Users className="h-8 w-8 text-holyTan-700 dark:text-holyGold-300" />
            </div>
            <div className="absolute top-2 right-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-holyBlue-100 px-2 py-1 text-xs text-holyBlue-800 dark:bg-holyBlue-900/20 dark:text-holyBlue-300">
                <Clock4 className="h-3 w-3" />
                <span>Q4 2025</span>
              </div>
            </div>
            <h3 className="text-xl font-bold">Community Features</h3>
            <p className="text-center text-muted-foreground">
              Study circles, discussion boards, and shared spiritual growth.
            </p>
          </div>
        </div>
      </div>
    </section >

  );
}
