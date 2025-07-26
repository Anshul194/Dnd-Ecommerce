"use client"

import React, { useState } from 'react';

const Filter = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedOther, setSelectedOther] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onFilterChange({
      searchTerm: e.target.value,
      category: selectedCategory,
      priceRange,
      other: selectedOther
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange({
      searchTerm,
      category,
      priceRange,
      other: selectedOther
    });
  };

  const handlePriceSubmit = () => {
    onFilterChange({
      searchTerm,
      category: selectedCategory,
      priceRange,
      other: selectedOther
    });
  };

  const handleOtherChange = (option) => {
    setSelectedOther(option);
    onFilterChange({
      searchTerm,
      category: selectedCategory,
      priceRange,
      other: option
    });
  };

  return (
    <div className="w-full sticky top-10 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter</h2>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="What are you looking for..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button className="absolute right-0 top-0 h-full px-3 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Category</h3>
        <div className="space-y-2">
          {['Best Seller', 'Latest Uploads', 'Recommendation'].map((category) => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Price</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handlePriceSubmit}
            className="w-full bg-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Other Options */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Other</h3>
        <div className="space-y-2">
          {['Ready Stock', 'Pre Order', 'Normal', 'Combos'].map((option) => (
            <button
              key={option}
              onClick={() => handleOtherChange(selectedOther === option ? '' : option)}
              className={`flex items-center space-x-2 cursor-pointer w-full text-left px-2 py-1 rounded text-sm ${
                selectedOther === option
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filter;