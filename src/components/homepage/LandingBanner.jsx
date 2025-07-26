"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import teaOne from '../../../public/images/one.webp'
import teaTwo from '../../../public/images/two.webp'
import leaf from '../../../public/images/leaf.png'

const LandingBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "GOOD BUYS TAKE YOU TO GOOD PLACES.",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolor magna aliqua.",
      buttonText: "Know more about us",
      productImage: teaOne,
      centerElements: "[Tea Leaves & Ginger Images]"
    },
    {
      title: "PREMIUM TEA COLLECTION FOR EVERY TASTE.",
      subtitle: "Discover our handpicked selection of finest teas from around the world, crafted for the perfect brewing experience.",
      buttonText: "Explore collection",
      productImage: teaTwo,
      centerElements: "[Spices & Herbs Images]"
    },
    {
      title: "AUTHENTIC FLAVORS FROM INDIA.",
      subtitle: "Experience the rich heritage of Indian tea culture with our traditional blends and modern innovations.",
      buttonText: "Shop now",
      productImage: teaOne,
      centerElements: "[Traditional Spices Images]"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full min-h-[500px] overflow-hidden">
      {/* Fixed Left Leaf Image */}
      <div className="absolute -left-30 md:-left-50 top-1/2 transform -translate-y-1/2 z-50">
            <Image className='w-[40vh] md:w-[60vh] rotate-[210deg] max-h-[600px]' src={leaf} alt="Leaf" width='auto' height='auto' />
      </div>

      {/* Fixed Right Leaf Image */}
      <div className="absolute -right-50 top-1/2 transform -translate-y-1/2 z-50">
        <Image className='w-[60vh] -rotate-[40deg] max-h-[600px]' src={leaf} alt="Leaf" width='auto' height='auto' />
      </div>

      {/* Navigation Arrows */}
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

      {/* Sliding Content */}
      <div className="relative h-full max-w-7xl mx-auto flex items-center justify-center px-4">
        <div className="flex items-center justify-between w-full flex-col md:flex-row py-12">
          {/* Left Content */}
          <div className=" relative md:w-1/2 max-w-xl z-50">
            <h1 className="!font-bebas relative z-50 text-4xl md:text-5xl font-black text-gray-800 leading-tight mb-6">
              {slides[currentSlide].title}
            </h1>
            <p className="text-black relative z-50  text-lg leading-relaxed mb-8">
              {slides[currentSlide].subtitle}
            </p>
            <button className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center gap-2">
              {slides[currentSlide].buttonText}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Content - Product and Elements */}
          <div className="md:w-1/2 relative flex items-center justify-center">

            {/* Center Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-32 bg-yellow-100 rounded-lg flex items-center justify-center z-0">
                <span className="text-yellow-800 font-medium text-center">
                  {slides[currentSlide].centerElements}
                </span>
              </div>
            </div>

            {/* Main Product Image */}
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
              <div className="w-fit h-full lg:h-[80vh] max-h-[600px] rounded-2xl overflow-hidden">
                <Image
                  src={slides[currentSlide].productImage}
                  alt={`Tea product ${currentSlide + 1}`}
                  className="w-full h-full object-cover"
                  priority={currentSlide === 0}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

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