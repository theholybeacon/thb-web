"use client";

import { BookOpen, Calendar, Clock4, Lightbulb, Sparkles, Target, Layers } from "lucide-react";

export function StudyPlansSection() {
  return (
    <section id="study-plans" className="relative w-full py-16 md:py-24 lg:py-32 bg-card overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container relative px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary animate-fade-down opacity-0">
              <Clock4 className="h-4 w-4" />
              <span className="font-medium">Coming soon!</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-up opacity-0 animation-delay-100">
              Learn With <span className="gradient-text">Purpose</span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed animate-fade-up opacity-0 animation-delay-200">
              The beating heart of The Holy Beacon is its AI-powered Study Plan Generator. Simply describe what you
              want to learn, and receive a personalized study plan tailored to your needs.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Feature list */}
          <div className="flex flex-col justify-center space-y-6 animate-slide-in-left opacity-0 animation-delay-300">
            <ul className="grid gap-6">
              <li className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50 hover-lift transition-all duration-300 group">
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Customizable Duration</h3>
                  <p className="text-muted-foreground mt-1">
                    From quick daily devotionals to in-depth multi-week studies, tailor your plan to fit your
                    schedule.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50 hover-lift transition-all duration-300 group">
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Adjustable Depth</h3>
                  <p className="text-muted-foreground mt-1">
                    From beginner-friendly introductions to theological deep dives for seasoned scholars.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50 hover-lift transition-all duration-300 group">
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Thematic Exploration</h3>
                  <p className="text-muted-foreground mt-1">
                    Focus on specific themes like forgiveness, leadership, or end times prophecy.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: Visual representation */}
          <div className="relative flex items-center justify-center animate-slide-in-right opacity-0 animation-delay-400">
            <div className="relative w-full max-w-md">
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse-glow" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse-glow animation-delay-300" />

              {/* Main card */}
              <div className="relative glass rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">AI Study Generator</h4>
                    <p className="text-sm text-muted-foreground">Personalized for you</p>
                  </div>
                </div>

                {/* Simulated input */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">What would you like to study?</p>
                    <p className="font-medium">&quot;Understanding the parables of Jesus&quot;</p>
                  </div>

                  {/* Generated plan preview */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Generated Study Plan</span>
                    </div>
                    <div className="space-y-2">
                      {["The Sower & Seeds", "The Prodigal Son", "The Good Samaritan", "The Mustard Seed"].map((item, i) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 p-2 rounded-lg bg-background/50 text-sm animate-fade-up opacity-0"
                          style={{ animationDelay: `${600 + i * 100}ms` }}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                            {i + 1}
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>4 weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>Intermediate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
