// import Categories from "@/components/homepage/Categories";
// import FAQAccordion from "@/components/homepage/FAQAccordion";
// import LandingBanner from "@/components/homepage/LandingBanner";
// import SeasonSaleBanner from "@/components/homepage/SeasonSaleBanner";
// import TeaPartyBanner from "@/components/homepage/TeaPartyBanner";
// import TestimonialSlider from "@/components/homepage/TestimonialSlider";
// import TryItYourselfSlider from "@/components/homepage/TryItYourselfSliderj";
// import ValidatedSection from "@/components/homepage/ValidatedSection";
// import WhyUs from "@/components/homepage/WhyUs";
// import BlogSection from "@/components/BlogSection";
import DynamicHomepage from "@/components/homepage/DynamicHomepage";
import DynamicHomepage2 from "@/components/homepage/DynamicHomepage2";

export default function HomePage() {
  const page = 2;
  return <main>{page === 2 ? <DynamicHomepage2 /> : <DynamicHomepage />}</main>;
}
