
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Gift, Tag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoupons, setSelectedCoupon, clearSelectedCoupon } from '@/app/store/slices/couponSlice';

const CouponSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dispatch = useDispatch();
  const { items: coupons, loading, error, selectedCoupon } = useSelector((state) => state.coupon);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const itemsPerView = 2;
  const maxSlides = Math.max(0, (coupons?.length || 0) - itemsPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectCoupon = (coupon) => {
    if (selectedCoupon?._id === coupon._id) {
      dispatch(clearSelectedCoupon());
    } else {
      dispatch(setSelectedCoupon(coupon));
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading coupons...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Failed to load coupons: {error}</div>;
  }
  if (!coupons || coupons.length === 0) {
    return <div className="p-4 text-center text-gray-500">No coupons available.</div>;
  }

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
            {coupons.map((coupon) => {
              // Assign color and textColor based on type or code for demo, or use defaults
              let color = 'bg-gradient-to-r from-green-500 to-teal-500';
              let textColor = 'text-white';
              if (coupon.type === 'percent') color = 'bg-gradient-to-r from-blue-500 to-cyan-500';
              if (coupon.type === 'flat') color = 'bg-gradient-to-r from-orange-500 to-red-500';
              // Discount string
              const discount = coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`;
              return (
                <div
                  key={coupon._id}
                  className={`flex-shrink-0 w-1/2 relative cursor-pointer transition-all duration-300 ${
                    selectedCoupon?._id === coupon._id ? 'scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => handleSelectCoupon(coupon)}
                >
                  <div className={`${color} rounded-lg p-4 relative overflow-hidden`}>
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
                      <Gift size={64} className="transform rotate-12" />
                    </div>
                    {/* Selection indicator */}
                    {selectedCoupon?._id === coupon._id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                    <div className={`${textColor} relative z-10`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag size={16} />
                        <span className="font-bold text-sm">{coupon.code}</span>
                      </div>
                      <div className="font-bold text-lg mb-1">{discount}</div>
                      <div className="text-xs opacity-90 mb-1">{coupon.description || ''}</div>
                      <div className="text-xs opacity-75">Min order: ₹{coupon.minCartValue || 0}</div>
                    </div>
                    {/* Border for selected coupon */}
                    {selectedCoupon?._id === coupon._id && (
                      <div className="absolute inset-0 border-3 border-white rounded-lg"></div>
                    )}
                  </div>
                </div>
              );
            })}
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
                Coupon {selectedCoupon.code} selected - {selectedCoupon.type === 'percent' ? `${selectedCoupon.value}% OFF` : `₹${selectedCoupon.value} OFF`}
              </span>
            </div>
            <button 
              onClick={() => dispatch(clearSelectedCoupon())}
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