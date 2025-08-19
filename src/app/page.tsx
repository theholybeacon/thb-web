import { Header } from "./layout/components/Header"
import { HeroSection } from "./components/HeroSection"
import { StudyPlansSection } from "./components/StudyPlansSection"
import { RoadmapSection } from "./components/RoadmapSection"
import { FeaturePreviewSection } from "./components/FeaturePreviewSection"
import { PricingSection } from "./components/PricingSection"
import { Footer } from "./layout/components/Footer"

export default function LandingPage() {

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StudyPlansSection />
        <RoadmapSection />
        <FeaturePreviewSection />
        <PricingSection />
      </main>
      <Footer />
    </div >
  );
}


