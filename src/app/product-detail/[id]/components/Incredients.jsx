import React, { useState, useEffect, useRef } from 'react';

export default function Ingredient({ data }) {
  const [activeIngredient, setActiveIngredient] = useState(0);
  const ingredientsRef = useRef([]);
  const containerRef = useRef(null);

  // Sample ingredients data - replace with your actual data structure
  const ingredients = data?.ingredients || [
    {
      id: 1,
      name: "Fresh Tomatoes",
      description: "Vine-ripened tomatoes, carefully selected for their rich flavor and vibrant color. These premium tomatoes form the base of our signature sauce.",
      image: "https://images.unsplash.com/photo-1546470427-e26264be0b91?w=400&h=400&fit=crop",
      details: "Organic, locally sourced"
    },
    {
      id: 2,
      name: "Extra Virgin Olive Oil",
      description: "Cold-pressed olive oil from Mediterranean groves, providing a smooth, fruity flavor that enhances every dish with its golden richness.",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
      details: "First cold press, Mediterranean origin"
    },
    {
      id: 3,
      name: "Fresh Basil",
      description: "Hand-picked basil leaves with their distinctive aroma and peppery flavor. This herb adds the perfect aromatic finish to our creations.",
      image: "https://images.unsplash.com/photo-1618375569909-3c8616cf598e?w=400&h=400&fit=crop",
      details: "Locally grown, pesticide-free"
    },
    {
      id: 4,
      name: "Sea Salt",
      description: "Pure sea salt harvested from pristine coastal waters, providing the perfect mineral balance to enhance natural flavors.",
      image: "https://images.unsplash.com/photo-1502819126416-e54b65efb8be?w=400&h=400&fit=crop",
      details: "Unrefined, mineral-rich"
    },
    {
      id: 5,
      name: "Garlic",
      description: "Fresh garlic cloves with their pungent, savory flavor that forms the aromatic foundation of countless culinary masterpieces.",
      image: "https://images.unsplash.com/photo-1553978297-833d24758027?w=400&h=400&fit=crop",
      details: "Farm fresh, hand-selected"
    },
    {
      id: 6,
      name: "Black Pepper",
      description: "Freshly ground black peppercorns that deliver a sharp, piney fragrance and a characteristic heat that awakens the palate.",
      image: "https://images.unsplash.com/photo-1506629905056-7199b18204d8?w=400&h=400&fit=crop",
      details: "Whole peppercorns, freshly ground"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const containerTop = containerRef.current.offsetTop;
      const containerHeight = containerRef.current.offsetHeight;
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Check if we're in the ingredients section
      if (scrollPosition + windowHeight > containerTop && 
          scrollPosition < containerTop + containerHeight) {
        
        ingredientsRef.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            const isInViewport = rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.4;
            
            if (isInViewport && activeIngredient !== index) {
              setActiveIngredient(index);
            }
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeIngredient]);

  return (
    <div ref={containerRef} className="py-10 lg:py-20 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Scrolling Ingredients */}
        <div className="flex flex-col space-y-8 flex-1">
          {/* Title */}
          <div className=" bg-white pb-4">
            <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0">
              INGREDIENTS
            </h1>
          </div>

          {/* Ingredients List */}
          <div className="space-y-12">
            {ingredients.map((ingredient, index) => (
              <div
                key={ingredient.id}
                ref={el => ingredientsRef.current[index] = el}
                className={`transition-all duration-500 ${
                  activeIngredient === index 
                    ? 'opacity-100 transform translate-x-0' 
                    : 'opacity-70 transform translate-x-2'
                }`}
              >
                {/* Ingredient Number */}
                <div className="flex items-start gap-6 mb-4">
                  <span className="text-6xl font-bold text-gray-300 bebas leading-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-black bebas mb-2">
                      {ingredient.name}
                    </h3>
                    <p className="text-sm text-gray-600 poppins-medium mb-2">
                      {ingredient.details}
                    </p>
                  </div>
                </div>

                {/* Ingredient Description */}
                <div className="ml-20">
                  <p className="text-black poppins-medium leading-tight text-lg">
                    {ingredient.description}
                  </p>
                </div>

                {/* Mobile Image (visible only on mobile) */}
                <div className="lg:hidden mt-6 rounded-lg w-full h-[250px] overflow-hidden">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Divider */}
                {index < ingredients.length - 1 && (
                  <div className="mt-12 h-px bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Sticky Image */}
        <div className="hidden lg:flex flex-col flex-1">
          <div className="sticky top-32">
            {/* Active Ingredient Image */}
            <div className="relative">
              <div className="rounded-lg w-full h-[500px] overflow-hidden shadow-lg">
                <img
                  src={ingredients[activeIngredient]?.image}
                  alt={ingredients[activeIngredient]?.name}
                  className="w-full h-full object-cover rounded-lg transition-all duration-700 ease-in-out transform"
                  style={{
                    filter: 'brightness(0.95) contrast(1.05)'
                  }}
                />
              </div>
              
              {/* Image Overlay Info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="text-xl font-bold text-black bebas mb-1">
                    {ingredients[activeIngredient]?.name}
                  </h4>
                  <p className="text-sm text-gray-700 poppins-medium">
                    {ingredients[activeIngredient]?.details}
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="absolute top-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-bold text-black poppins-medium">
                    {activeIngredient + 1} / {ingredients.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Ingredient Dots Navigation */}
            <div className="flex justify-center mt-6 space-x-2">
              {ingredients.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIngredient(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeIngredient === index
                      ? 'bg-black scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .bebas {
          font-family: 'Bebas Neue', sans-serif;
          font-weight: 400;
        }
        
        .poppins-medium {
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}