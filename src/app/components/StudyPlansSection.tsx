
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image"
import { BookOpen, Calendar, CheckCircle2, Clock4, Lightbulb } from "lucide-react";

export function StudyPlansSection() {
  return (
    <section id="study-plans" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-holyDark-100/5" >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-holyBlue-100 px-3 py-1 text-sm text-holyBlue-800 mb-2">
              <Clock4 className="h-4 w-4" />
              <span>Coming soon!</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Learn With Purpose</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              The beating heart of The Holy Beacon is its AI-powered Study Plan Generator. Simply describe what you
              want to learn, and receive a personalized study plan tailored to your needs.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <ul className="grid gap-6">
              <li className="flex items-start gap-4">
                <div className="rounded-full bg-holyGold-100 p-2 dark:bg-holyGold-100/20">
                  <Calendar className="h-6 w-6 text-holyTan-700 dark:text-holyGold-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Customizable Duration</h3>
                  <p className="text-muted-foreground">
                    From quick daily devotionals to in-depth multi-week studies, tailor your plan to fit your
                    schedule.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="rounded-full bg-holyGold-100 p-2 dark:bg-holyGold-100/20">
                  <Lightbulb className="h-6 w-6 text-holyTan-700 dark:text-holyGold-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Adjustable Depth</h3>
                  <p className="text-muted-foreground">
                    From beginner-friendly introductions to theological deep dives for seasoned scholars.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="rounded-full bg-holyGold-100 p-2 dark:bg-holyGold-100/20">
                  <BookOpen className="h-6 w-6 text-holyTan-700 dark:text-holyGold-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Thematic Exploration</h3>
                  <p className="text-muted-foreground">
                    Focus on specific themes like forgiveness, leadership, or end times prophecy.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="mx-auto aspect-video overflow-hidden rounded-xl bg-holyBlue-50 dark:bg-holyDark-200/50 object-cover">
            <Image
              src="/images/learn-with-purpose.png?height=310&width=550"
              width={550}
              height={310}
              alt="AI Study Plan Generator"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section >
  );
}
