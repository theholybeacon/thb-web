"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowRight, Bookmark, Clock4, Headphones, Users, ChevronLeft, ChevronRight, Link2, User, Globe, BookOpen, Mic, Image, MessageCircle, Rss, LucideIcon } from "lucide-react";

interface PreviewSlide {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  timeline: string;
  modalTitle: string;
  modalDescription: string;
  previews: PreviewSlide[];
}

const features: Feature[] = [
  {
    icon: Bookmark,
    title: "Scripture in HD",
    description: "Smart links, character profiles, and contextual layers that bring the Bible to life.",
    timeline: "Q4 2025",
    modalTitle: "Scripture in HD",
    modalDescription: "Experience the Bible like never before with rich, interconnected content.",
    previews: [
      {
        title: "Smart Verse Connections",
        description: "Instantly see related verses, cross-references, and thematic connections. Tap any verse to explore its relationship with other scriptures throughout the Bible.",
        icon: Link2,
      },
      {
        title: "Character Profiles",
        description: "Dive deep into biblical figures with comprehensive profiles including their timeline, key events, relationships, and character arc throughout Scripture.",
        icon: User,
      },
      {
        title: "Historical & Cultural Context",
        description: "Understand the world behind the text. Access maps, cultural insights, historical events, and archaeological discoveries that illuminate Scripture's meaning.",
        icon: Globe,
      },
    ],
  },
  {
    icon: Headphones,
    title: "Multi-Modal Bible",
    description: "Experience Scripture through reading, listening, and visual engagement.",
    timeline: "Q1 2026",
    modalTitle: "Multi-Modal Bible",
    modalDescription: "Engage with God's Word in the way that works best for you.",
    previews: [
      {
        title: "Distraction-Free Reading",
        description: "A beautifully designed reading experience that removes all distractions. Customizable fonts, themes, and layouts to match your reading preferences.",
        icon: BookOpen,
      },
      {
        title: "High-Quality Audio",
        description: "Listen to professionally narrated Scripture. Perfect for commutes, workouts, or when you want to close your eyes and let the Word wash over you.",
        icon: Mic,
      },
      {
        title: "AI Verse Visualization",
        description: "Generate beautiful, shareable images of your favorite verses. Perfect for social media, personal reflection, or creating meaningful gifts.",
        icon: Image,
      },
    ],
  },
  {
    icon: Users,
    title: "Community Features",
    description: "Study circles, discussion boards, and shared spiritual growth.",
    timeline: "Q2 2026",
    modalTitle: "Community Features",
    modalDescription: "Grow together in faith with believers around the world.",
    previews: [
      {
        title: "Study Circles",
        description: "Create or join small groups to study Scripture together. Share insights, track progress, and hold each other accountable in your spiritual journey.",
        icon: Users,
      },
      {
        title: "Discussion Boards",
        description: "Engage in thoughtful theological discussions. Ask questions, share discoveries, and learn from diverse perspectives within a respectful community.",
        icon: MessageCircle,
      },
      {
        title: "Daily Word Feed",
        description: "A personalized feed of Scripture, devotionals, and community insights. Start each day with curated content tailored to your spiritual journey.",
        icon: Rss,
      },
    ],
  },
];

function FeatureModal({
  feature,
  open,
  onOpenChange
}: {
  feature: Feature | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!feature) return null;

  const previews = feature.previews;
  const current = previews[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % previews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + previews.length) % previews.length);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) setCurrentSlide(0);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-primary/10 p-2">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-left">{feature.modalTitle}</DialogTitle>
              <DialogDescription className="text-left">
                {feature.modalDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Carousel */}
        <div className="mt-4">
          {/* Slide content */}
          <div className="relative bg-secondary/30 rounded-xl p-6 min-h-[200px]">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-2xl bg-primary/10 p-4">
                <current.icon className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-lg font-bold">{current.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="hover:bg-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {previews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-primary w-6"
                      : "bg-primary/30 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="hover:bg-secondary"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Timeline badge */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              <Clock4 className="h-3 w-3" />
              <span>Expected {feature.timeline}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FeaturePreviewSection() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLearnMore = (feature: Feature) => {
    setSelectedFeature(feature);
    setModalOpen(true);
  };

  return (
    <section id="features" className="relative w-full py-16 md:py-24 lg:py-32 bg-card overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="container relative px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-1.5 text-sm text-secondary-foreground animate-fade-down opacity-0">
              <Clock4 className="h-4 w-4" />
              <span className="font-medium">Coming Soon</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-up opacity-0 animation-delay-100">
              Feature <span className="gradient-text">Previews</span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed animate-fade-up opacity-0 animation-delay-200">
              Get a sneak peek at the exciting features we&apos;re developing for future releases.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative flex flex-col items-center space-y-4 rounded-2xl border bg-background/50 p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/30 hover:-translate-y-2 animate-fade-up opacity-0"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Timeline badge */}
              <div className="absolute top-4 right-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  <Clock4 className="h-3 w-3" />
                  <span>{feature.timeline}</span>
                </div>
              </div>

              {/* Icon */}
              <div className="relative rounded-2xl bg-primary/10 p-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-bold">{feature.title}</h3>
              <p className="relative text-center text-muted-foreground">
                {feature.description}
              </p>

              {/* CTA */}
              <Button
                variant="ghost"
                className="relative mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => handleLearnMore(feature)}
              >
                <span className="mr-2">Learn More</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Modal */}
      <FeatureModal
        feature={selectedFeature}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
}
