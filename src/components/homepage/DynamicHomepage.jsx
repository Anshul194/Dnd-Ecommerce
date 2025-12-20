"use client";

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupedContent } from "@/app/store/slices/contentSlice";

// Import all existing components
import Categories from "./Categories";
import FAQAccordion from "./FAQAccordion";
import SeasonSaleBanner from "./SeasonSaleBanner";
import TeaPartyBanner from "./TeaPartyBanner";
import TestimonialSlider from "./TestimonialSlider";
import TryItYourselfSlider from "./TryItYourselfSliderj";
import ValidatedSection from "./ValidatedSection";
import WhyUs from "./WhyUs";
import BlogSection from "../BlogSection";
import LandingBanner from "./LandingBanner";

// Import new dynamic components
import DynamicHeroSection from "./sections/DynamicHeroSection";
import DynamicCategoryPick from "./sections/DynamicCategoryPick";
import DynamicOfferBanner from "./sections/DynamicOfferBanner";
import DynamicProductSlider from "./sections/DynamicProductSlider";
import DynamicWhyUs from "./sections/DynamicWhyUs";
import DynamicUniqueSellingPoints from "./sections/DynamicUniqueSellingPoints";
import ProductGrid from "./sections/ProductGrid";
import AllProducts from "./sections/AllProducts";
import { LoadingSpinner, LoadingSection } from "../common/Loading";

const DynamicHomepage = () => {
  const dispatch = useDispatch();
  const { groupedContent, loading, error, lastFetched } = useSelector(
    (state) => state.content
  );
  const hasFetchedRef = useRef(false);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const isCacheValid = lastFetched && (Date.now() - lastFetched < CACHE_DURATION);
    
    // Only fetch if we don't already have grouped content or cache expired
    if (
      !hasFetchedRef.current &&
      (!groupedContent ||
        !groupedContent.sections ||
        Object.keys(groupedContent.sections).length === 0 ||
        !isCacheValid)
    ) {
      hasFetchedRef.current = true;
      dispatch(fetchGroupedContent());
    }
  }, [dispatch, groupedContent, lastFetched]);

  if (loading) {
    return (
      <main>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  if (error) {
    //console.error("Content loading error:", error);
    // Fallback to static components if there's an error
    return (
      <main>
        <LandingBanner />
        <div className="max-w-7xl mx-auto px-4">
          <Categories />
        </div>
        <SeasonSaleBanner />
        <div className="max-w-7xl mx-auto px-4">
          <TeaPartyBanner />
          <TestimonialSlider />
          <BlogSection />
          <FAQAccordion />
          <ValidatedSection />
        </div>
      </main>
    );
  }

  if (!groupedContent?.sections) {
    return null;
  }

  // Sort all sections by order and filter only visible ones
  const allSections = [];
  const heroSections = []; // Collect hero sections separately for carousel
  const categoryPickContent = []; // Collect categoryPick content for Categories component

  Object.keys(groupedContent.sections).forEach((sectionType) => {
    groupedContent.sections[sectionType].forEach((section) => {
      // Show all sections for testing - you can change back to section.isVisible later
      if (true || section.isVisible) {
        if (sectionType === "hero") {
          heroSections.push(section); // Collect hero sections for carousel
        } else if (sectionType === "categoryPick") {
          categoryPickContent.push(section); // Collect categoryPick for Categories component
        } else {
          allSections.push({ ...section, sectionType });
        }
      }
    });
  });

  // Debug logging to see what sections we have
  //console.log("Available sections:", groupedContent.sections);
  //console.log("Visible sections:", allSections);

  // Sort by order
  allSections.sort((a, b) => a.order - b.order);
  heroSections.sort((a, b) => a.order - b.order);
  categoryPickContent.sort((a, b) => a.order - b.order);

  const renderSection = (section, index) => {
    const { sectionType, content, _id } = section;
    const uniqueKey = _id || `section-${index}`;
    //console.log("Rendering section: --->", section);
    switch (sectionType) {
      case "offerBanner":
        return <DynamicOfferBanner key={uniqueKey} content={content} />;

      case "productSlider":
        return (
          <div key={uniqueKey}>
            <div className="max-w-7xl mx-auto px-4">
              <DynamicProductSlider content={content} />
            </div>
            <div className="max-w-7xl mx-auto px-4">
              <ProductGrid />
            </div>
          </div>
        );

      case "whyUs":
        return (
          <div key={uniqueKey} className="max-w-7xl mx-auto px-4">
            <DynamicWhyUs content={content} />
          </div>
        );

      case "uniqueSellingPoints":
        return (
          <div key={uniqueKey} className="max-w-7xl mx-auto px-4">
            <DynamicUniqueSellingPoints content={content} />
          </div>
        );

      case "genuineHeartStory":
        return (
          <div key={uniqueKey} className="max-w-7xl mx-auto px-4">
            <TestimonialSlider content={content} />
          </div>
        );

      case "secondaryBanner":
        return (
          <div key={uniqueKey} className="max-w-7xl mx-auto px-4">
            <TeaPartyBanner content={content} />
          </div>
        );

      case "blogs":
        return (
          <div key={uniqueKey} className="max-w-7xl mx-auto px-4">
            <BlogSection content={content} />
          </div>
        );

      case "noConfusion":
        return (
          <div key={uniqueKey} className="max-w-7xl mx-auto px-4">
            <FAQAccordion content={content} />
          </div>
        );

      case "3V":
        return (
          <div key={uniqueKey} className="max-w-7xl mx-auto px-4">
            <ValidatedSection content={content} />
          </div>
        );
      default:
        //console.warn("Unknown section type:", sectionType);
        return null;
    }
  };

  // Collect dynamic banners from content API
  const bannerSections = [];
  if (groupedContent?.sections?.banner) {
    groupedContent.sections.banner.forEach((section) => {
      if (section.isVisible) {
        bannerSections.push(section);
      }
    });
  }

  return (
    <main>
      {/* Hero Carousel - Render all hero sections as one carousel */}
      {heroSections.length > 0 && (
        <LandingBanner
          content={heroSections}
          autoPlay={true}
          autoPlayInterval={5000}
        />
      )}

      {/* Categories Section with Dynamic Content */}
      <div className="max-w-7xl mx-auto px-4">
        <Categories dynamicContent={categoryPickContent[0]?.content || null} />
      </div>

      {/* Other sections */}
      {allSections.map((section, index) => renderSection(section, index))}

      {/* All Products Section */}
      {/* <div className="max-w-7xl mx-auto px-4">
        <AllProducts />
      </div> */}
    </main>
  );
};

export default DynamicHomepage;
