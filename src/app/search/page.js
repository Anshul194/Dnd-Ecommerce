"use client";

import React, { useState, useEffect } from "react";
import Filter from "./Filter";
import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Category from "../lib/models/Category";
import { fetchProducts } from "../store/slices/productSlice";

const SearchPage = () => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "",
    priceRange: { min: "", max: "" },
    other: "",
  });

  const [sortBy, setSortBy] = useState("High Price");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { products } = useSelector((state) => state.product);
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const paramCategories = searchParams.get("category");
  const minPrice = searchParams.get("min");
  const maxPrice = searchParams.get("max");
  const paramSearchTerm = searchParams.get("search");

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    if (products.length === 0) {
      const payload = {};
      if (paramCategories) {
        payload.category = paramCategories;
      }
      if (minPrice) {
        payload.minPrice = minPrice;
      }
      if (maxPrice) {
        payload.maxPrice = maxPrice;
      }
      if (paramSearchTerm) {
        payload.searchTerm = paramSearchTerm;
      }
      dispatch(fetchProducts(payload));
    }
  }, []);

  console.log("Products:", products);
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
                  Showing{" "}
                  {/* <span className="font-semibold">
                    {startItem} - {endItem}
                  </span>{" "} */}
                  items out of{" "}
                  {/* <span className="font-semibold">{totalItems}</span> possible */}
                  search results for
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
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria.
                </p>
              </div>
            )}

            {/* Load More Button */}
            {/* {totalPages > 1 && currentPage < totalPages && (
              <div className="text-center">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  See more
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )} */}

            {/* Show All Button */}
            {/* {currentPage < totalPages && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Show all {totalItems} results
                </button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
