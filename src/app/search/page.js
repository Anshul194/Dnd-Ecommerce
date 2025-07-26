"use client"

import React, { useState, useEffect } from 'react';
import Filter from './Filter';
import ProductCard from './ProductCard'

const SearchPage = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    priceRange: { min: '', max: '' },
    other: ''
  });
  
  const [sortBy, setSortBy] = useState('High Price');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Sample products data - replace with your actual data
  const allProducts = [
    {
      id: 1,
      name: 'TEABOX',
      subtitle: 'Lorem Ipsum',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      numericPrice: 112.70,
      rating: 4.7,
      image: '/api/placeholder/160/120',
      category: 'Best Seller',
      inStock: true
    },
    {
      id: 2,
      name: 'TEABOX',
      subtitle: 'Lorem Ipsum',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      numericPrice: 112.70,
      rating: 4.7,
      image: '/api/placeholder/160/120',
      category: 'Latest Uploads',
      inStock: true
    },
    {
      id: 3,
      name: 'TEABOX',
      subtitle: 'Lorem Ipsum',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      numericPrice: 112.70,
      rating: 4.7,
      image: '/api/placeholder/160/120',
      category: 'Recommendation',
      inStock: false
    },
    {
      id: 4,
      name: 'TEABOX',
      subtitle: 'Lorem Ipsum',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      numericPrice: 112.70,
      rating: 4.7,
      image: '/api/placeholder/160/120',
      category: 'Best Seller',
      inStock: true
    },
    // Add more products to demonstrate pagination
    ...Array.from({ length: 16 }, (_, i) => ({
      id: i + 5,
      name: 'TEABOX',
      subtitle: 'Lorem Ipsum',
      description: 'Lorem ipsum dolor sit amet, consectetur',
      price: '₹ 112.70',
      numericPrice: 112.70,
      rating: 4.7,
      image: '/api/placeholder/160/120',
      category: ['Best Seller', 'Latest Uploads', 'Recommendation'][i % 3],
      inStock: Math.random() > 0.3
    }))
  ];

  const itemsPerPage = 10;

  // Filter and sort products
  useEffect(() => {
    let filtered = [...allProducts];

    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(product =>
        product.subtitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      filtered = filtered.filter(product => {
        const price = product.numericPrice;
        const min = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
        const max = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply other filters
    if (filters.other === 'Ready Stock') {
      filtered = filtered.filter(product => product.inStock);
    } else if (filters.other === 'Pre Order') {
      filtered = filtered.filter(product => !product.inStock);
    }

    // Apply sorting
    if (sortBy === 'High Price') {
      filtered.sort((a, b) => b.numericPrice - a.numericPrice);
    } else if (sortBy === 'Low Price') {
      filtered.sort((a, b) => a.numericPrice - b.numericPrice);
    } else if (sortBy === 'Rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, sortBy]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const totalItems = filteredProducts.length;
  const startItem = totalItems > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(endIndex, totalItems);

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-16">
      <div className="max-w-[90%] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className="lg:w-1/4">
            <Filter onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-sm">
                  Showing <span className="font-semibold">{startItem} - {endItem}</span> items 
                  out of <span className="font-semibold">{totalItems}</span> possible search results for 
                  <span className="font-semibold text-black"> "Lorem"</span>
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 text-black rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="High Price">High Price</option>
                  <option value="Low Price">Low Price</option>
                  <option value="Rating">Rating</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-8">
              {currentProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            )}

            {/* Load More Button */}
            {totalPages > 1 && currentPage < totalPages && (
              <div className="text-center">
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  See more
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Show All Button */}
            {currentPage < totalPages && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Show all {totalItems} results
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;