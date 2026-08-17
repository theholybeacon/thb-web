"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Bookmark, CheckCircle2, Clock4, Columns2, FileText, Flame, Headphones, Users, ChevronLeft, ChevronRight, Link2, NotebookPen, User, Globe, BookOpen, Mic, Keyboard, Sparkles, LucideIcon } from "lucide-react";

interface PreviewSlide {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Marks a teaser slide for work that has not shipped yet. */
  upcoming?: boolean;
}

interface Feature {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  modalTitle: string;
  modalDescription: string;
  previews: PreviewSlide[];
}

function FeatureModal({
  feature,
  open,
  onOpenChange,
  comingNextText
}: {
  feature: Feature | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comingNextText: string;
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
              {current.upcoming && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  <Clock4 className="h-3 w-3" />
                  <span>{comingNextText}</span>
                </div>
              )}
              <div className={cn("rounded-2xl p-4", current.upcoming ? "bg-secondary" : "bg-primary/10")}>
                <current.icon className={cn("h-10 w-10", current.upcoming ? "text-muted-foreground" : "text-primary")} />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FeaturePreviewSection() {
  const t = useTranslations("landing.features");
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const features: Feature[] = useMemo(() => [
    {
      key: "scriptureHD",
      icon: Users,
      title: t("scriptureHD.title"),
      description: t("scriptureHD.description"),
      modalTitle: t("scriptureHD.modalTitle"),
      modalDescription: t("scriptureHD.modalDescription"),
      previews: [
        {
          title: t("scriptureHD.preview1Title"),
          description: t("scriptureHD.preview1Desc"),
          icon: User,
        },
        {
          title: t("scriptureHD.preview2Title"),
          description: t("scriptureHD.preview2Desc"),
          icon: Clock4,
        },
        {
          title: t("scriptureHD.preview3Title"),
          description: t("scriptureHD.preview3Desc"),
          icon: Link2,
        },
        {
          title: t("scriptureHD.preview4Title"),
          description: t("scriptureHD.preview4Desc"),
          icon: Globe,
          upcoming: true,
        },
      ],
    },
    {
      key: "multiModal",
      icon: Headphones,
      title: t("multiModal.title"),
      description: t("multiModal.description"),
      modalTitle: t("multiModal.modalTitle"),
      modalDescription: t("multiModal.modalDescription"),
      previews: [
        {
          title: t("multiModal.preview1Title"),
          description: t("multiModal.preview1Desc"),
          icon: BookOpen,
        },
        {
          title: t("multiModal.preview2Title"),
          description: t("multiModal.preview2Desc"),
          icon: Mic,
        },
        {
          title: t("multiModal.preview3Title"),
          description: t("multiModal.preview3Desc"),
          icon: Keyboard,
        },
        {
          title: t("multiModal.preview4Title"),
          description: t("multiModal.preview4Desc"),
          icon: Columns2,
          upcoming: true,
        },
      ],
    },
    {
      key: "studyNotes",
      icon: Bookmark,
      title: t("studyNotes.title"),
      description: t("studyNotes.description"),
      modalTitle: t("studyNotes.modalTitle"),
      modalDescription: t("studyNotes.modalDescription"),
      previews: [
        {
          title: t("studyNotes.preview1Title"),
          description: t("studyNotes.preview1Desc"),
          icon: Sparkles,
        },
        {
          title: t("studyNotes.preview2Title"),
          description: t("studyNotes.preview2Desc"),
          icon: NotebookPen,
        },
        {
          title: t("studyNotes.preview3Title"),
          description: t("studyNotes.preview3Desc"),
          icon: Flame,
        },
        {
          title: t("studyNotes.preview4Title"),
          description: t("studyNotes.preview4Desc"),
          icon: FileText,
          upcoming: true,
        },
      ],
    },
  ], [t]);

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
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary animate-fade-down opacity-0">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">{t("badge")}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-up opacity-0 animation-delay-100">
              {t("title")} <span className="gradient-text">{t("titleHighlight")}</span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed animate-fade-up opacity-0 animation-delay-200">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-12">
          {features.map((feature, index) => (
            <div
              key={feature.key}
              className="group relative flex flex-col items-center space-y-4 rounded-2xl border bg-background/50 p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/30 hover:-translate-y-2 animate-fade-up opacity-0"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Live badge */}
              <div className="absolute top-4 right-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t("liveBadge")}</span>
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
                <span className="mr-2">{t("learnMore")}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          ))}
        </div>

        {/* Pointer to what's still coming */}
        <div className="mt-10 text-center animate-fade-up opacity-0 animation-delay-600">
          <Link
            href="#roadmap"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{t("moreOnRoadmap")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Feature Modal */}
      <FeatureModal
        feature={selectedFeature}
        open={modalOpen}
        onOpenChange={setModalOpen}
        comingNextText={t("comingNext")}
      />
    </section>
  );
}
