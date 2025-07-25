import Categories from "@/components/homepage/Categories";
import FAQAccordion from "@/components/homepage/FAQAccordion";
import LandingBanner from "@/components/homepage/LandingBanner";
import SeasonSaleBanner from "@/components/homepage/SeasonSaleBanner";
import TeaPartyBanner from "@/components/homepage/TeaPartyBanner";
import TestimonialSlider from "@/components/homepage/TestimonialSlider";
import TryItYourselfSlider from "@/components/homepage/TryItYourselfSliderj";
import ValidatedSection from "@/components/homepage/ValidatedSection";
import WhyUs from "@/components/homepage/WhyUs";

export default function HomePage() {
  return (
    <main>
      <LandingBanner/>
      <div className="max-w-7xl mx-auto px-4">
      <Categories/>
      </div>
      <SeasonSaleBanner/>
      <div className="max-w-7xl mx-auto px-4">
      <TryItYourselfSlider/>
      <WhyUs/>
      <TeaPartyBanner/>
      <TestimonialSlider/>
      <FAQAccordion/>
      <ValidatedSection/>
      </div>
    </main>
  );
}