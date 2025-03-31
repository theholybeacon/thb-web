import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
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
import { Header } from "./layout/components/Header"
import { HeroSection } from "./components/HeroSection"
import { StudyPlansSection } from "./components/StudyPlansSection"
import { RoadmapSection } from "./components/RoadmapSection"
import { FeaturePreviewSection } from "./components/FeaturePreviewSection"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StudyPlansSection />
        <RoadmapSection />
        <FeaturePreviewSection />

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
            <div className="mt-16 bg-white dark:bg-holyDark-100/20 rounded-xl p-8 border shadow-sm relative overflow-hidden">
              {/* Coming Soon Ribbon */}
              <div className="absolute -right-12 top-6 bg-holyGold-500 text-holyDark-900 font-bold py-1 px-10 transform rotate-45 shadow-md z-10">
                COMING SOON
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Sponsorship Program</h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Our community-driven sponsorship program connects those who want to support others with those who need
                  access to The Holy Beacon.
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Note: The numbers below are simulated for demonstration purposes only.
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
                    "Here is where your awesome testimonial will appear after you've experienced The Holy Beacon's
                    sponsorship program."
                  </span>
                  <span>—</span>
                  <span>Future Sponsored Member</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Twitch & Support */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-holyBlue-50/30 to-transparent dark:from-holyDark-300/20 dark:to-transparent">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-lg bg-holyGold-100 px-3 py-1 text-sm text-holyTan-800">
                  <Sun className="h-4 w-4" />
                  <span>Support The Journey</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Built Live on Twitch</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The Holy Beacon is a side project that's being built live on Twitch. Follow along as we bring this
                  vision to life!
                </p>
              </div>

              <div className="max-w-3xl mx-auto bg-white/80 dark:bg-holyDark-100/30 p-6 md:p-8 rounded-xl border shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-4 text-left">
                    <h3 className="text-2xl font-bold">Watch the Development</h3>
                    <p className="text-muted-foreground">
                      Join us at{" "}
                      <a
                        href="https://www.twitch.tv/a2xres"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-holyTan-600 hover:text-holyTan-700 font-medium underline underline-offset-2"
                      >
                        www.twitch.tv/a2xres
                      </a>{" "}
                      to watch as we build The Holy Beacon live. Your support can help transform this from a side
                      project into our main focus.
                    </p>
                    <p className="text-muted-foreground">
                      With enough support, we can hire developers and designers to accelerate development and expand to
                      multiple Bible translations and languages, reaching the whole world with the Holy Word.
                    </p>
                    <div className="pt-2">
                      <Button className="bg-[#6441a5] hover:bg-[#4b367c] text-white" asChild>
                        <a href="https://www.twitch.tv/a2xres" target="_blank" rel="noopener noreferrer">
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5 mr-2 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                          </svg>
                          Follow on Twitch
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h4 className="text-lg font-bold">How You Can Help</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Subscribe to the Twitch channel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Follow our social media accounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Consider purchasing a subscription even while in development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Share The Holy Beacon with your community</span>
                      </li>
                    </ul>
                    <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                      <Button variant="outline" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-twitter"
                        >
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                        </svg>
                        Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-instagram"
                        >
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                        Instagram
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-youtube"
                        >
                          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                          <path d="m10 15 5-3-5-3z" />
                        </svg>
                        YouTube
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground max-w-2xl">
                Your support is greatly appreciated and will help us convert The Holy Beacon into a full-time project.
                Even though it's not a finished product yet, every subscription, follow, and share brings us closer to
                our vision.
              </p>
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


