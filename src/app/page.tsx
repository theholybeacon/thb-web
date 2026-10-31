import { Header } from "./layout/components/Header"
import { HeroSection } from "./components/HeroSection"
import { StartSection } from "./components/StartSection"
import { ExploreSection } from "./components/ExploreSection"
import { StudyPlansSection } from "./components/StudyPlansSection"
import { FeaturePreviewSection } from "./components/FeaturePreviewSection"
import { PricingSection } from "./components/PricingSection"
import { Footer } from "./layout/components/Footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StartSection />
        <ExploreSection />
        <StudyPlansSection />
        <FeaturePreviewSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}


