"use client"

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import teaOne from '../../../public/images/one.webp';
import leaf from '../../../public/images/leaf.png';

const TryItYourselfSlider = () => {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const products = [
    {
      id: 1,
      name: 'TEABOX',
      subtitle: 'GUJARATI MINT SPICE',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      rating: 4.7,
      image: teaOne
    },
    {
      id: 2,
      name: 'TEABOX',
      subtitle: 'GUJARATI MINT SPICE',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      rating: 4.7,
      image: teaOne
    },
    {
      id: 3,
      name: 'TEABOX',
      subtitle: 'GUJARATI MINT SPICE',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      rating: 4.7,
      image: teaOne
    },
    {
      id: 4,
      name: 'TEABOX',
      subtitle: 'GUJARATI MINT SPICE',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      rating: 4.7,
      image: teaOne
    },
  ];

  // Initialize scroll buttons on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollButtons();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const scroll = (direction) => {
    const container = sliderRef.current;
    if (!container) return;
    
    const scrollAmount = 210; // Adjusted for your card width (200px + 16px gap)
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    
    // Update button states after scroll animation
    setTimeout(() => {
      updateScrollButtons();
    }, 300);
  };

  const updateScrollButtons = () => {
    const container = sliderRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const handleScroll = () => {
    // Throttle the scroll updates
    clearTimeout(handleScroll.timeout);
    handleScroll.timeout = setTimeout(updateScrollButtons, 50);
  };

  return (
    <div className="flex relative flex-col lg:flex-row justify-between w-full h-fit py-20 px-4 lg:px-0">

      {/* Left Content */}
      <div className="flex-1 relative mb-8 lg:mb-0 lg:mr-8 z-20">
        <h1 className="text-5xl md:text-6xl font-black text-gray-800 leading-tight mb-6 text-center">
          TRY IT YOURSELF.
        </h1>
        <p className="text-gray-800 font-medium text-lg mt-2 lg:max-w-xl">
          Lorem ipsum dolor sit amet, {' '}
          <span className='text-green-600 font-semibold'>consectetur</span> adipiscing elit
        </p>
      </div>

      {/* Right Content - Slider */}
      <div className="flex-1 relative z-20 overflow-x-scroll">
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute -left-2 md:left-0 top-1/2 transform -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${
              canScrollLeft 
                ? 'text-gray-700 hover:bg-gray-50 cursor-pointer opacity-100' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute -right-2 md:right-0 top-1/2 transform -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${
              canScrollRight 
                ? 'text-gray-700 hover:bg-gray-50 cursor-pointer opacity-100' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Slider Container */}
          <div 
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scrollbar-hide space-x-4 md:px-12 py-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="min-w-[280px] h-[340px] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200"
              >
                {/* Product Header */}
                <div className="rounded-xl relative">
                  <div className="flex h-40 pt-2 justify-center">
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                    {/* Product Info */}
                    <div >
                    <div className="text-xs font-medium text-gray-600 mb-1">{product.name}</div>
                    <p className="text-sm text-black font-semibold mb-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-gray-800">{product.price}</span>
                        <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                        </div>
                    </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button className="w-full bg-green-600 text-white py-2.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors duration-200">
                    ADD TO CART
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TryItYourselfSlider;