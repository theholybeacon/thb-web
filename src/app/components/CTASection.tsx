import { Button } from "@/components/ui/button";
import { Check, Sun } from "lucide-react";

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-holyBlue-50/30 to-transparent dark:from-holyDark-300/20 dark:to-transparent" >
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
                    href="https://www.twitch.tv/andresrub10"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-holyTan-600 hover:text-holyTan-700 font-medium underline underline-offset-2"
                  >
                    www.twitch.tv/andresrub10
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
                    <a href="https://www.twitch.tv/andresrub10" target="_blank" rel="noopener noreferrer">
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
                  <Button variant="outline" size="sm" className="gap-1" asChild >
                    <a
                      href="https://www.youtube.com/@andresrub10"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open YouTube channel"
                    >
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
                    </a>
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
    </section >
  );
}
