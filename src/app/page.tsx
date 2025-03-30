import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  BookOpen,
  Calendar,
  Lightbulb,
  Users,
  Headphones,
  Bookmark,
  Sun,
  CheckCircle2,
  Clock4,
  ArrowRight,
  Gift,
  Check,
  X,
  FlameIcon as Fire,
  Eye,
  Footprints,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sun className="h-8 w-8 text-holyGold-500" />
            <span className="text-xl font-bold">The Holy Beacon</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#study-plans" className="text-sm font-medium hover:text-primary">
              Study Plans
            </Link>
            <Link href="#roadmap" className="text-sm font-medium hover:text-primary">
              Roadmap
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link href="/auth/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-holyBlue-50/30 to-transparent dark:from-holyDark-300/30 dark:to-transparent">
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
        </section>

        {/* AI Study Plans Section - Available Now */}
        <section id="study-plans" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-holyDark-100/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-lg bg-holyGold-100 px-3 py-1 text-sm text-holyTan-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Available Now</span>
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
                  src="/placeholder.svg?height=310&width=550"
                  width={550}
                  height={310}
                  alt="AI Study Plan Generator"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section - NEW */}
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

        {/* Feature Preview Section - Coming Soon Features */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-holyDark-100/5">
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
        </section>

        {/* Pricing Section - NEW */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-holyBlue-50/30 dark:bg-holyDark-200/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-holyGold-100 px-3 py-1 text-sm text-holyTan-800">
                  Subscription Plans
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Path</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Select the plan that best fits your spiritual journey, with the ability to share or gift each
                  subscription.
                </p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {/* Free Tier - "The Glimpse" */}
              <div className="flex flex-col rounded-xl border bg-white dark:bg-holyDark-100/20 shadow-sm transition-all hover:shadow-md">
                <div className="p-6 pt-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-holyBlue-100/50 p-2 dark:bg-holyBlue-900/20">
                      <Eye className="h-8 w-8 text-holyBlue-600 dark:text-holyBlue-400" />
                    </div>
                  </div>
                  <h3 className="text-center text-2xl font-bold">The Glimpse</h3>
                  <div className="mt-1 text-center text-sm text-muted-foreground italic">
                    "Taste and see..." — Psalm 34:8
                  </div>
                  <div className="mt-6 text-center text-4xl font-bold">Free</div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Read-only access to the Chronological Bible (text only)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No AI Study Plans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No Smart Links or Contextual Layers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No Audio or Typing Mode</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-auto p-6 pt-0">
                  <Button className="w-full" variant="outline">
                    Sign Up Free
                  </Button>
                </div>
              </div>

              {/* Standard Tier - "The Walk" */}
              <div className="flex flex-col rounded-xl border bg-white dark:bg-holyDark-100/20 shadow-sm transition-all hover:shadow-md relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-holyTan-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
                </div>
                <div className="p-6 pt-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-holyTan-100 p-2 dark:bg-holyTan-900/20">
                      <Footprints className="h-8 w-8 text-holyTan-600 dark:text-holyTan-400" />
                    </div>
                  </div>
                  <h3 className="text-center text-2xl font-bold">The Walk</h3>
                  <div className="mt-1 text-center text-sm text-muted-foreground italic">
                    "Walk in the way of love..." — Ephesians 5:2
                  </div>
                  <div className="mt-6 text-center">
                    <span className="text-4xl font-bold">$9</span>
                    <span className="text-muted-foreground">/month</span>
                    <div className="mt-1 text-sm text-muted-foreground">or $90/year (save $18)</div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Full access to AI Study Plans (up to 3 active)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Entire Chronological Bible with Smart Links</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Reading, Typing, and Audio Modes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>20 Monthly Verse Images via AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Join Study Circles & Community Discussions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="h-5 w-5 text-holyGold-500 shrink-0 mt-0.5" />
                      <span className="font-medium">Add 1 person to your subscription</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-auto p-6 pt-0">
                  <Button className="w-full bg-holyTan-600 hover:bg-holyTan-700 text-white">Subscribe Now</Button>
                  <div className="mt-3 text-center text-xs text-muted-foreground">
                    <span className="flex items-center justify-center gap-1">
                      <Gift className="h-3 w-3" />
                      <span>Can be gifted or shared with a loved one</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Premium Tier - "The Fire" */}
              <div className="flex flex-col rounded-xl border bg-gradient-to-b from-holyGold-50 to-white dark:from-holyDark-200 dark:to-holyDark-100/20 shadow-sm transition-all hover:shadow-md">
                <div className="p-6 pt-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-holyGold-100 p-2 dark:bg-holyGold-900/20">
                      <Fire className="h-8 w-8 text-holyGold-600 dark:text-holyGold-400" />
                    </div>
                  </div>
                  <h3 className="text-center text-2xl font-bold">The Fire</h3>
                  <div className="mt-1 text-center text-sm text-muted-foreground italic">
                    "His Word burns in my heart like a fire..." — Jeremiah 20:9
                  </div>
                  <div className="mt-6 text-center">
                    <span className="text-4xl font-bold">$39</span>
                    <span className="text-muted-foreground">/month</span>
                    <div className="mt-1 text-sm text-muted-foreground">or $399/year (save $69)</div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Unlimited AI Study Plans with deep-dive options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Creator Mode – Build & publish custom Study Plans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Multiple Bible versions & translation comparisons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Unlimited AI Image Generation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Lead your own Study Circles & track engagement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="h-5 w-5 text-holyGold-500 shrink-0 mt-0.5" />
                      <span className="font-medium">Add 1 person to your subscription</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-auto p-6 pt-0">
                  <Button className="w-full bg-gradient-to-r from-holyGold-500 to-holyTan-600 hover:from-holyGold-600 hover:to-holyTan-700 text-white">
                    Upgrade to Premium
                  </Button>
                  <div className="mt-3 text-center text-xs text-muted-foreground">
                    <span className="flex items-center justify-center gap-1">
                      <Gift className="h-3 w-3" />
                      <span>Can be gifted or shared with a loved one</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sponsorship Queue Section */}
            <div className="mt-16 bg-white dark:bg-holyDark-100/20 rounded-xl p-8 border shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Sponsorship Program</h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Our community-driven sponsorship program connects those who want to support others with those who need
                  access to The Holy Beacon.
                </p>
              </div>

              {/* Queue Visualization */}
              <div className="mb-10 relative">
                <div className="h-4 bg-holyBlue-100 dark:bg-holyBlue-900/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-holyTan-400 to-holyGold-500 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>0</span>
                  <span>Current Queue: 42 people waiting</span>
                  <span>100</span>
                </div>

                {/* Queue Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-holyBlue-50 dark:bg-holyDark-200/30 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-holyBlue-700 dark:text-holyBlue-300">42</div>
                    <div className="text-sm text-muted-foreground">People in Queue</div>
                  </div>
                  <div className="bg-holyTan-50 dark:bg-holyDark-200/30 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-holyTan-700 dark:text-holyTan-300">128</div>
                    <div className="text-sm text-muted-foreground">Sponsorships Gifted</div>
                  </div>
                  <div className="bg-holyGold-50 dark:bg-holyDark-200/30 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-holyGold-700 dark:text-holyGold-300">14</div>
                    <div className="text-sm text-muted-foreground">Days Avg. Wait Time</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <div className="flex-1 max-w-md bg-holyBlue-50/50 dark:bg-holyDark-300/20 p-6 rounded-xl border border-holyBlue-100 dark:border-holyBlue-900/20">
                  <h4 className="text-xl font-bold mb-2">Need a Subscription?</h4>
                  <p className="text-muted-foreground mb-4">
                    Join our sponsorship queue if you're unable to afford a subscription. Our community of sponsors will
                    help you access The Holy Beacon.
                  </p>
                  <Button className="w-full bg-holyBlue-600 hover:bg-holyBlue-700 text-white">
                    <Users className="mr-2 h-5 w-5" />
                    <span>Join Sponsorship Queue</span>
                  </Button>
                </div>

                <div className="flex-1 max-w-md bg-holyGold-50/50 dark:bg-holyDark-300/20 p-6 rounded-xl border border-holyGold-100 dark:border-holyGold-900/20">
                  <h4 className="text-xl font-bold mb-2">Become a Sponsor</h4>
                  <p className="text-muted-foreground mb-4">
                    Gift subscriptions to those in need. Choose how many people you'd like to sponsor and help clear the
                    queue.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-holyGold-500 to-holyTan-600 hover:from-holyGold-600 hover:to-holyTan-700 text-white">
                    <Gift className="mr-2 h-5 w-5" />
                    <span>Gift Subscriptions</span>
                  </Button>
                </div>
              </div>

              {/* Testimonials */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-4 italic text-sm text-muted-foreground">
                  <span>
                    "Thanks to a generous sponsor, I've been able to deepen my faith journey through The Holy Beacon."
                  </span>
                  <span>—</span>
                  <span>Sarah K., Sponsored Member</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-holyBlue-50/30 to-transparent dark:from-holyDark-300/20 dark:to-transparent">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Journey</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Be part of The Holy Beacon's development. Sign up to get early access to new features and updates.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex flex-col sm:flex-row gap-2">
                  <Input type="email" placeholder="Enter your email" className="max-w-lg flex-1" />
                  <Button type="submit" className="bg-holyTan-600 hover:bg-holyTan-700 text-white">
                    Join Waitlist
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  Be the first to know when we launch new features.{" "}
                  <Link href="/terms" className="underline underline-offset-2">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background py-6 md:py-12">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-holyGold-500" />
            <span className="text-lg font-semibold">The Holy Beacon</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <div className="flex-1 text-center md:text-right text-sm">
            &copy; {new Date().getFullYear()} The Holy Beacon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

