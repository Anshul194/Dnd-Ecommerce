import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Gift, Tag } from 'lucide-react';

const CouponSlider = () => {
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const coupons = [
    {
      id: 1,
      code: 'FIRST20',
      discount: '20% OFF',
      description: 'First time buyers',
      minOrder: '₹500',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-white'
    },
    {
      id: 2,
      code: 'SAVE15',
      discount: '15% OFF',
      description: 'On orders above ₹800',
      minOrder: '₹800',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      textColor: 'text-white'
    },
    {
      id: 3,
      code: 'MEGA25',
      discount: '25% OFF',
      description: 'Mega discount deal',
      minOrder: '₹1200',
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      textColor: 'text-white'
    },
    {
      id: 4,
      code: 'FLAT10',
      discount: '₹100 OFF',
      description: 'Flat discount',
      minOrder: '₹600',
      color: 'bg-gradient-to-r from-green-500 to-teal-500',
      textColor: 'text-white'
    },
    {
      id: 5,
      code: 'SPECIAL30',
      discount: '30% OFF',
      description: 'Special offer',
      minOrder: '₹1500',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      textColor: 'text-white'
    }
  ];

  const itemsPerView = 2;
  const maxSlides = Math.max(0, coupons.length - itemsPerView);

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const selectCoupon = (coupon) => {
    setSelectedCoupon(selectedCoupon?.id === coupon.id ? null : coupon);
  };

  return (
    <div className="relative">
      <div className="flex relative items-center gap-3">
        {/* Left Arrow */}
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`w-8 h-8 left-0 top-1/2 translate-y-[-50%] absolute z-30 rounded-full border-2 flex items-center justify-center transition-all ${
            currentSlide === 0 
              ? 'border-gray-200 bg-white text-gray-300 cursor-not-allowed' 
              : 'border text-green-600 hover:bg-green-50'
          }`}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Coupon Container */}
        <div className="flex-1 overflow-hidden">
          <div 
            className="flex gap-3 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)` }}
          >
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`flex-shrink-0 w-1/2 relative cursor-pointer transition-all duration-300 ${
                  selectedCoupon?.id === coupon.id ? 'scale-105' : 'hover:scale-102'
                }`}
                onClick={() => selectCoupon(coupon)}
              >
                <div className={`${coupon.color} rounded-lg p-4 relative overflow-hidden`}>
                  {/* Decorative pattern */}
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
                    <Gift size={64} className="transform rotate-12" />
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedCoupon?.id === coupon.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  )}

                  <div className={`${coupon.textColor} relative z-10`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} />
                      <span className="font-bold text-sm">{coupon.code}</span>
                    </div>
                    <div className="font-bold text-lg mb-1">{coupon.discount}</div>
                    <div className="text-xs opacity-90 mb-1">{coupon.description}</div>
                    <div className="text-xs opacity-75">Min order: {coupon.minOrder}</div>
                  </div>

                  {/* Border for selected coupon */}
                  {selectedCoupon?.id === coupon.id && (
                    <div className="absolute inset-0 border-3 border-white rounded-lg"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button 
          onClick={nextSlide}
          disabled={currentSlide >= maxSlides}
          className={`w-8 h-8 absolute right-0 top-1/2 translate-y-[-50%] z-30 rounded-full border-2 flex items-center justify-center transition-all ${
            currentSlide >= maxSlides
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border text-green-600 hover:bg-green-50'
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Selected Coupon Display */}
      {selectedCoupon && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">
                Coupon {selectedCoupon.code} selected - {selectedCoupon.discount}
              </span>
            </div>
            <button 
              onClick={() => setSelectedCoupon(null)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Slide indicators */}
      <div className="flex justify-center gap-1 mt-3">
        {Array.from({ length: maxSlides + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === index ? 'bg-green-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CouponSlider;