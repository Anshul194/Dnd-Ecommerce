"use client";
import React, { useEffect } from "react";
import { HeroSlider } from "../HeroSlider";
import { CustomerFavorites } from "../CustomerFavorites";
import { TimerBanner } from "../TimerBanner";
import { WhyUs } from "../WhyUs";
import { Features } from "../Features";
import { NewLaunchBanner } from "../NewLaunchBanner";
import { Reviews } from "../Reviews";
import { FAQ } from "../FAQ";
import { Certifications } from "../Certifications";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroupedContent } from "@/app/store/slices/contentSlice";
import Categories from "./Categories";
import { LoadingSpinner } from "../common/Loading";
import ValidatedSection2 from "./ValidatedSection2";

function DynamicHomepage2() {
  const { groupedContent, loading, error } = useSelector(
    (state) => state.content
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      !groupedContent ||
      !groupedContent.sections ||
      Object.keys(groupedContent.sections).length === 0
    ) {
      dispatch(fetchGroupedContent());
    }
  }, [dispatch]);

  if (loading) {
    return (
      <main>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  const renderSection = (section) => {
    const { sectionType, content, _id } = section;
    // console.log("Rendering section: ==>", section.sectionType);
    switch (sectionType) {
      case "offerBanner":
        return (
          <div key={_id} className=" mx-auto px-4">
            <TimerBanner content={content} />
          </div>
        );
      case "productSlider":
        return (
          <div
            key={_id}
            className=" mx-auto px-4 bg-gradient-to-b from-white to-gray-50"
          >
            <CustomerFavorites content={content} />
          </div>
        );

      case "whyUs":
        return (
          <div
            key={_id}
            className=" mx-auto px-4 bg-gradient-to-br from-[#3C950D]/5 via-transparent to-[#3C950D]/5"
          >
            <WhyUs content={content} />
          </div>
        );

      case "uniqueSellingPoints":
        return (
          <div
            key={_id}
            className=" mx-auto px-4 bg-gradient-to-br from-[#3C950D]/5 via-transparent to-[#3C950D]/5"
          >
            <Features content={content} />
          </div>
        );

      case "genuineHeartStory":
        return (
          <div
            key={_id}
            className=" mx-auto bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
          >
            <Reviews content={content} />{" "}
          </div>
        );

      case "noConfusion":
        return (
          <div key={_id} className="max-w-7xl mx-auto px-4">
            <FAQ content={content} />
          </div>
        );

      case "3V":
        return (
          <div key={_id} className="max-w-7xl mx-auto px-4">
            <ValidatedSection2 content={content} />
          </div>
        );

      default:
        console.warn("Unknown section type:", sectionType);
        return null;
    }
  };

  if (!groupedContent?.sections) {
    return null;
  }

  // Sort all sections by order and filter only visible ones
  const allSections = [];
  const heroSections = []; // Collect hero sections separately for carousel
  const categoryPickContent = []; // Collect categoryPick content for Categories component

  Object?.keys(groupedContent?.sections).forEach((sectionType) => {
    groupedContent?.sections[sectionType].forEach((section) => {
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
  // console.log("Available sections:", groupedContent.sections);
  // console.log("Visible sections:", allSections);

  // Sort by order
  allSections.sort((a, b) => a.order - b.order);
  heroSections.sort((a, b) => a.order - b.order);
  categoryPickContent.sort((a, b) => a.order - b.order);
  return (
    <main className="text-black">
      <HeroSlider content={heroSections} />
      <div className="max-w-7xl mx-auto px-4">
        <Categories dynamicContent={categoryPickContent[0]?.content || null} />
      </div>

      {allSections.map(renderSection)}
      {/* <NewLaunchBanner /> */}
    </main>
  );
}

export default DynamicHomepage2;
