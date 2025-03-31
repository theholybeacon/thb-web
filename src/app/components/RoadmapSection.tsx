import { CheckCircle2, Clock4, } from "lucide-react";

export function RoadmapSection() {
  return (
    <section id="roadmap" className="w-full py-12 md:py-24 lg:py-32 bg-holyBlue-50/30 dark:bg-holyDark-200/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-holyGold-100 px-3 py-1 text-sm text-holyTan-800">
              Our Journey Ahead
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Feature Roadmap</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We're building The Holy Beacon step by step. Here's our plan for bringing all the promised features to
              life.
            </p>
          </div>
        </div>

        <div className="mt-16 relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-holyGold-200 dark:bg-holyGold-900/20"></div>

          {/* Phase 1 - Current */}
          <div className="relative mb-24">
            <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-6 h-6 rounded-full bg-holyGold-500 border-4 border-white dark:border-holyDark-100 z-10"></div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 md:text-right mb-8 md:mb-0">
                <div className="inline-flex items-center gap-2 rounded-lg bg-holyGold-100 px-3 py-1 text-sm text-holyTan-800 mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Phase 1 - Available Now</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">AI-Guided Study Plans</h3>
                <p className="text-muted-foreground">
                  Our core feature that helps you create personalized Bible study plans based on your interests,
                  schedule, and spiritual goals.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-8">
                <div className="bg-white dark:bg-holyDark-100/20 rounded-lg p-4 shadow-sm border">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>Customizable study durations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>Depth adjustment for all knowledge levels</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>Thematic exploration options</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 - Coming Soon */}
          <div className="relative mb-24">
            <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-6 h-6 rounded-full bg-holyBlue-200 dark:bg-holyBlue-700 border-4 border-white dark:border-holyDark-100 z-10"></div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 md:text-right mb-8 md:mb-0 order-1 md:order-1">
                <div className="bg-white dark:bg-holyDark-100/20 rounded-lg p-4 shadow-sm border">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 justify-end md:flex-row-reverse">
                      <span>Smart verse connections</span>
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                    </li>
                    <li className="flex items-center gap-2 justify-end md:flex-row-reverse">
                      <span>Character profiles and timelines</span>
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                    </li>
                    <li className="flex items-center gap-2 justify-end md:flex-row-reverse">
                      <span>Historical and cultural context layers</span>
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-8 order-0 md:order-2">
                <div className="inline-flex items-center gap-2 rounded-lg bg-holyBlue-100 px-3 py-1 text-sm text-holyBlue-800 mb-2">
                  <Clock4 className="h-4 w-4" />
                  <span>Phase 2 - Q2 2025</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Scripture in HD</h3>
                <p className="text-muted-foreground">
                  Smart links, timelines, and contextual layers that bring the Bible's interconnected tapestry to
                  life.
                </p>
              </div>
            </div>
          </div>

          {/* Phase 3 - Future */}
          <div className="relative mb-24">
            <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-6 h-6 rounded-full bg-holyBlue-200 dark:bg-holyBlue-700 border-4 border-white dark:border-holyDark-100 z-10"></div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 md:text-right mb-8 md:mb-0">
                <div className="inline-flex items-center gap-2 rounded-lg bg-holyBlue-100 px-3 py-1 text-sm text-holyBlue-800 mb-2">
                  <Clock4 className="h-4 w-4" />
                  <span>Phase 3 - Q3 2025</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Multi-Modal Bible Consumption</h3>
                <p className="text-muted-foreground">
                  Multiple ways to engage with Scripture through reading, listening, typing, and visual experiences.
                </p>
              </div>
              <div className="md:w-1/2 md:pl-8">
                <div className="bg-white dark:bg-holyDark-100/20 rounded-lg p-4 shadow-sm border">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                      <span>Distraction-free reading mode</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                      <span>High-quality audio narration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                      <span>AI-generated verse visualization</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 4 - Future */}
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-6 h-6 rounded-full bg-holyBlue-200 dark:bg-holyBlue-700 border-4 border-white dark:border-holyDark-100 z-10"></div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8 md:text-right mb-8 md:mb-0 order-1 md:order-1">
                <div className="bg-white dark:bg-holyDark-100/20 rounded-lg p-4 shadow-sm border">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 justify-end md:flex-row-reverse">
                      <span>Study circles for group learning</span>
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                    </li>
                    <li className="flex items-center gap-2 justify-end md:flex-row-reverse">
                      <span>Theological discussion boards</span>
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                    </li>
                    <li className="flex items-center gap-2 justify-end md:flex-row-reverse">
                      <span>Daily Word personalized feed</span>
                      <Clock4 className="h-5 w-5 text-holyBlue-500" />
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-8 order-0 md:order-2">
                <div className="inline-flex items-center gap-2 rounded-lg bg-holyBlue-100 px-3 py-1 text-sm text-holyBlue-800 mb-2">
                  <Clock4 className="h-4 w-4" />
                  <span>Phase 4 - Q4 2025</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Community & Daily Word</h3>
                <p className="text-muted-foreground">
                  Fellowship features and daily Scripture engagement to help believers grow together and maintain
                  consistency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

