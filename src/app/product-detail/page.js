"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Star, ShoppingCart, Plus } from 'lucide-react';
import CouponSlider from './components/CouponSlider';
import HowToUse from './components/HowToUse';
import DescriptionLayout from './components/DescriptionLayout';
import ProductReview from './components/ProductReview';
import FrequentlyPurchased from './components/FrequentlyPurchased';

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedPack, setSelectedPack] = useState('pack2');
  const [quantity, setQuantity] = useState(1);

  const productImages = [
    '/api/placeholder/400/400', // Main saffron product image
    '/api/placeholder/400/400', // Additional product images
    '/api/placeholder/400/400',
    '/api/placeholder/400/400',
    '/api/placeholder/400/400',
    '/api/placeholder/400/400'
  ];

  const packs = {
    pack2: { name: 'Pack of 2', price: 664.16, originalPrice: 830.20, discount: '20% OFF', color: 'green' },
    pack4: { name: 'Pack of 4', price: 1245.30, originalPrice: 1660.40, discount: '25% OFF', color: 'orange' },
    pack6: { name: 'Pack of 6', price: 1743.42, originalPrice: 2490.60, discount: '30% OFF', color: 'red' }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  return (
    <div className="max-w-[90%] mx-auto p-4 bg-white">
      <div>
        {/* Back Button */}
        <button className="mb-4 px-4 py-2 border border-gray-300 rounded text-sm text flex items-center gap-2 hover:bg-gray-50">
          <ChevronLeft size={16} />
          Back
        </button>

        <div className='flex gap-8'>
          {/* Left Side - Product Images */}
          <div className="flex-1 ">
            <div className="flex gap-4 max-h-[600px] sticky top-16">
              {/* Thumbnail Images */}
              <div className="flex flex-col justify-between gap-2">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 border-2 rounded cursor-pointer overflow-hidden ${
                      selectedImage === index ? 'border' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Product Image */}
              <div className="flex-1 relative">
                <div className=" h-full  bg-gray-200 border border-gray-200 rounded-lg overflow-hidden relative group">
                  {/* Navigation arrows */}
                  <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="flex-1 max-w-xl">
            {/* Product Title and Rating */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Lorem ipsum dolor sit amet
            </h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.7) - 390 Product Sold</span>
            </div>

            {/* Delivery Options */}
            <div className="mb-6">
              <h3 className="font-semibold text-black mb-2">Delivery Options</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter pincode" 
                  className="flex-1 px-3 py-2 border text-black border-gray-300 rounded text-sm"
                />
                <button className="bg-green-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-green-700 transition-colors">
                  Check
                </button>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Product Delivers on your doorstep within 7-8 days
              </div>
            </div>

            {/* Pack Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-black mb-3">Select Pack</h3>
              <div className="flex gap-3">
                {Object.entries(packs).map(([key, pack]) => (
                  <div
                    key={key}
                    className={`relative flex-1 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPack === key
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedPack(key)}
                  >
                    <div className={`absolute -top-2 -right-2 text-white text-xs px-2 py-1 rounded ${
                      pack.color === 'green' ? 'bg-green-600' :
                      pack.color === 'orange' ? '' : ''
                    }`}>
                      {pack.discount}
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{pack.name}</div>
                      <div className={`font-semibold ${selectedPack === key ? 'text-green-600' : 'text-gray-900'}`}>
                        ₹{pack.price}
                      </div>
                      <div className="text-sm text-gray-500 line-through">₹{pack.originalPrice}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="font-semibold text-black mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 border border-gray-300 text-black rounded flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-medium text-black px-4">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 border border-gray-300 text-black rounded flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-2 mb-6">
              <button className="px-4 py-3 border border-gray-300 text rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart size={16} />
                Add to Cart
              </button>
              <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded font-medium hover:bg-green-700 transition-colors">
                Buy Now
              </button>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-2">
              {/* Product Details */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => toggleSection('details')}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-green-700">Product Details</span>
                  <ChevronRight className={`text transition-transform duration-300 ${expandedSection === 'details' ? 'rotate-90' : ''}`} size={16} />
                </button>
                <div 
                  className={`px-4 pb-3 text-sm text-gray-600 border-t transition-all duration-300 ease-in-out ${
                    expandedSection === 'details' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </div>
              </div>

              {/* Ingredients */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => toggleSection('ingredients')}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-green-700">Ingredients</span>
                  <ChevronDown className={`text transition-transform duration-300 ${expandedSection === 'ingredients' ? 'rotate-180' : ''}`} size={16} />
                </button>
                <div 
                  className={`px-4 pb-3 text-sm text-gray-600 border-t transition-all duration-300 ease-in-out ${
                    expandedSection === 'ingredients' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  Premium Kashmir Saffron, Natural extracts, Rose petals
                </div>
              </div>

              {/* Benefits */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => toggleSection('benefits')}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-green-700">Benefits</span>
                  <ChevronDown className={`text transition-transform duration-300 ${expandedSection === 'benefits' ? 'rotate-180' : ''}`} size={16} />
                </button>
                <div 
                  className={`px-4 pb-3 text-sm text-gray-600 border-t transition-all duration-300 ease-in-out ${
                    expandedSection === 'benefits' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  Rich in antioxidants, improves mood, enhances skin health, supports digestive system
                </div>
              </div>

              {/* How to use */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => toggleSection('usage')}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-green-700">How to use</span>
                  <ChevronDown className={`text transition-transform duration-300 ${expandedSection === 'usage' ? 'rotate-180' : ''}`} size={16} />
                </button>
                <div 
                  className={`px-4 pb-3 text-sm text-gray-600 border-t transition-all duration-300 ease-in-out ${
                    expandedSection === 'usage' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  Add a pinch to warm milk or tea. Can be used in cooking and baking. Store in a cool, dry place.
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-black mb-3">Available Coupons</h3>
                <CouponSlider />
              </div>
            </div>
          </div>
        </div>

        <HowToUse/>
        <DescriptionLayout/>
        <ProductReview/>
        <FrequentlyPurchased/>
      </div>
    </div>
  );
}