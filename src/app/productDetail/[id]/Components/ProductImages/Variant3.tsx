import { selectSelectedProduct } from "@/app/store/slices/productSlice";
import { Eye, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { getImageUrl } from "@/app/utils/imageHelper";

const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

const RenderVariant3 = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productData = useSelector(selectSelectedProduct);
  
  // Ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 120; // Adjust scroll amount as needed
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-6 h-fit sticky top-20">
      {/* Main Image with Floating Elements */}
      <div className="relative group">
        <div className="aspect-square lg:max-w-[45vw] rounded-3xl overflow-hidden cream relative">
          <Image
            src={getImageUrl(productData.images[selectedImage].url)}
            alt="Product"
            className="w-full h-full object-cover"
            layout="fill"
          />

          {/* Floating Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {productData?.badges?.map((badge, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-lg"
              >
                {badge}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {/* <div className="absolute top-6 right-6 flex flex-col gap-3">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-500"
              }`}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
            <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 hover:text-gray-900 transition-all transform hover:scale-110">
              <Share2 size={20} />
            </button>
            <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 hover:text-gray-900 transition-all transform hover:scale-110">
              <Eye size={20} />
            </button>
          </div> */}

          {/* Quick View Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {selectedImage + 1} / {productData.images.length}
          </div>
        </div>
      </div>

      {/* Enhanced Thumbnails */}
      <div className="relative flex items-center justify-center gap-2 lg:max-w-[45vw]">
        
        {/* Left Arrow */}
        <button 
          onClick={() => scroll("left")}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 text-gray-700 z-10 transition-colors border border-gray-100 hidden sm:flex"
          aria-label="Scroll Left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth"
        >
          {productData.images.map((img, index) => (
            <button
              key={index}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all transform hover:scale-105 ${
                selectedImage === index
                  ? "ring-4 ring-[#EA8932] shadow-lg"
                  : "ring-2 ring-gray-200 hover:ring-gray-300"
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={img.url}
                alt={`View ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedImage === index && (
                <div className="absolute inset-0 bg-[#EA8932]/20"></div>
              )}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll("right")}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 text-gray-700 z-10 transition-colors border border-gray-100 hidden sm:flex"
          aria-label="Scroll Right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default RenderVariant3;
