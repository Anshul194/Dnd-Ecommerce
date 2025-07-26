"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heart from '../../../public/images/heart.png';
import Image from 'next/image';

export default function TestimonialSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      name: "CAMILLA SCIANNA",
      quote: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT, SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLOR MAGNA."
    },
    {
      name: "GILLIAN FREEMAN",
      quote: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT, SED DO EIUSMOD TEMPOR INCIDIDUNT UT."
    },
    {
      name: "ARJUN SINGH",
      quote: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT, SED DO EIUSMOD."
    },
    {
      name: "PRERNA MAARUKHINE",
      quote: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT, SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLOR MAGNA."
    },
    {
      name: "JOHN WILLIAMS",
      quote: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT, SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE."
    },
    {
      name: "SARAH JOHNSON",
      quote: "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT, SED DO EIUSMOD TEMPOR INCIDIDUNT."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, testimonials.length - 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, testimonials.length - 3)) % Math.max(1, testimonials.length - 3));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 bg-white">
      {/* Header Section */}
      <div className="flex justify-between flex-wrap items-start mb-16">
        <div className="flex-1">
          <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0 ">
            GENUINE HEARTS.TRUE
            STORIES.
          </h1>
        </div>
        <div className="text-start w-fit">
          <p className="text-black relative poppins-medium leading-tight max-w-[230px] text-lg ml-auto">
            Lorem ipsum dolor sit amet, <span className="text font-medium">consectetur </span>
            adipiscing <span>elit <Image src={heart}  className='absolute -right-7 -bottom-10 w-8' alt="heart-img"/></span>
          </p>
        </div>
      </div>

      {/* Testimonials Slider */}
      <div className="relative">
        {/* Left Arrow */}
        <button 
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button 
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 translate-x-12 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        {/* Slider Container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * (100 / 4)}%)`
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="w-1/4 min-w-[270px] flex-shrink-0 px-3"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-4 h-96 flex flex-col">
                  {/* Name with green icon */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-md bebas font-bold text-black uppercase tracking-wide">
                      {testimonial.name}
                    </h3>
                      <Image className='h-4 w-4' src={heart} alt="heart-icon" />
                  </div>

                  {/* Quote */}
                  <div className="flex-1 mb-6">
                    <blockquote className="text-gray-700 bebas text-2xl font-medium leading-tight uppercase">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>

                  {/* Gray placeholder box */}
                  <div className="w-full h-32 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slider Dots Indicator */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: Math.max(1, testimonials.length - 3) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              currentSlide === index ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}