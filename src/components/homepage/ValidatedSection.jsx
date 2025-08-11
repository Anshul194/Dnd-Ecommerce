"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ValidatedSection({ content }) {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full py-10 lg:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between flex-col md:flex-row items-start mb-16">
          <div className="flex-1">
            <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0 ">
              {content?.title}
            </h1>
          </div>

          <div className="flex-1 flex justify-end items-start">
            <div className="max-w-md text-start">
              <p className="text-black relative poppins-medium leading-tight max-w-lg text-lg ml-auto">
                {content?.description}
                <span className="relative">
                  <img
                    src="/images/smile.png"
                    alt="smiley face"
                    className="w-12 h-12 absolute -right-10 -bottom-10"
                  />
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Green Circles Section with Arrows */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 translate-x-12 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Green Circles Section */}
          <div
            ref={scrollContainerRef}
            className="flex justify-start lg:justify-center flex-nowrap overflow-x-scroll gap-5 just"
          >
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="w-32 h-32 md:w-40 md:h-40 lg:w-[30vh] lg:h-[30vh] flex-shrink-0 rounded-full border-4 border-green-500 bg-white"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
