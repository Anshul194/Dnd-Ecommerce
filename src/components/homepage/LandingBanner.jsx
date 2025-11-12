"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import leaf from "../../../public/images/leaf.png";

const LandingBanner = ({
  heroSections = [],
  autoPlay = true,
  autoPlayInterval = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // Transform hero sections data into slides format
  console.log("Hero Sections Data:", heroSections);
  useEffect(() => {
    if (heroSections && heroSections.length > 0) {
      const transformedSlides = heroSections
        .filter((section) => section.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          title: section.content.title,
          subtitle: section.content.description,
          buttonText: section.content.cta?.title || "Learn More",
          buttonLink: section.content.cta?.link || "#",
          productImage: section.content.image,
          centerElements: `Featured Content ${section.order}`,
          id: section._id,
        }));

        console.log("Transformed Slides:", transformedSlides);
      setSlides(transformedSlides);
    } else {
      // Fallback to default slides if no hero sections provided
      setSlides([
        {
          title: "GOOD BUYS TAKE YOU TO GOOD PLACES.",
          subtitle:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolor magna aliqua.",
          buttonText: "Know more about us",
          buttonLink: "/about",
          productImage: "/images/one.webp",
          centerElements: "[Tea Leaves & Ginger Images]",
        },
      ]);
    }
  }, [heroSections]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, slides.length, autoPlayInterval]);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      // Pause auto-play when user manually navigates
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(autoPlay), 10000); // Resume after 10 seconds
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      // Pause auto-play when user manually navigates
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(autoPlay), 10000); // Resume after 10 seconds
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(autoPlay), 10000); // Resume after 10 seconds
  };

  // Don't render if no slides available
  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full min-h-[500px] overflow-hidden flex items-center justify-center">
        <p className="text-gray-500">Loading hero content...</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-[500px] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(autoPlay)}
    >
      {/* Fixed Left Leaf Image */}
      <div className="absolute -left-30 md:-left-50 top-1/2 transform -translate-y-1/2 z-50">
        <Image
          className="w-[40vh] md:w-[60vh] rotate-[210deg] max-h-[600px]"
          src={leaf}
          alt="Leaf"
          width="auto"
          height="auto"
        />
      </div>

      {/* Fixed Right Leaf Image */}
      <div className="absolute -right-50 top-1/2 transform -translate-y-1/2 z-50">
        <Image
          className="w-[60vh] -rotate-[40deg] max-h-[600px]"
          src={leaf}
          alt="Leaf"
          width="auto"
          height="auto"
        />
      </div>

      {/* Navigation Arrows - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div className="relative h-full overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{
            transform: `translateX(-${currentSlide * 50}%)`,
            width: `${slides.length * 100}%`,
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="w-full flex-shrink-0"
              style={{ width: `${100 / slides.length}%` }}
            >
              {/* Slide Content */}
              <div className="relative h-full max-w-7xl mx-auto flex items-center justify-center px-4">
                <div className="flex items-center justify-between w-full flex-col md:flex-row py-12">
                  {/* Left Content */}
                  <div className="relative md:w-1/2 max-w-xl z-50">
                    <h1 className="!font-bebas relative z-50 text-4xl md:text-5xl font-black text-gray-800 leading-tight mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-black relative z-50 text-lg leading-relaxed mb-8">
                      {slide.subtitle}
                    </p>
                    <a
                      href={slide.buttonLink || "#"}
                      className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center gap-2 inline-flex"
                    >
                      {slide.buttonText}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Right Content - Product and Elements */}
                  <div className="md:w-1/2 relative flex items-center justify-center">
                    {/* Center Elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-32 bg-yellow-100 rounded-lg flex items-center justify-center z-0">
                        <span className="text-yellow-800 font-medium text-center">
                          {slide.centerElements}
                        </span>
                      </div>
                    </div>

                    {/* Main Product Image */}
                    <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
                      <div className="w-fit h-full lg:h-[80vh] max-h-[600px] rounded-2xl overflow-hidden">
                        <Image
                          src={slide.productImage}
                          alt={`Hero image ${index + 1}`}
                          width={600}
                          height={600}
                          className="w-full h-full object-cover"
                          priority={index === 0}
                          onError={(e) => {
                            e.target.src = "/images/placeholder.jpg"; // Fallback image
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-gray-800 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-green-300 rounded-full opacity-60"></div>
        <div className="absolute bottom-32 right-1/4 w-3 h-3 bg-yellow-300 rounded-full opacity-40"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-300 rounded-full opacity-80"></div>
      </div>
    </div>
  );
};

export default LandingBanner;
