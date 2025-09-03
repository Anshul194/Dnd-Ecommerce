import { fetchCategories } from "../store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/common/Loading";

const Filter = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedOther, setSelectedOther] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const newParams = new URLSearchParams(searchParams.toString());

  const paramCategories = searchParams.get("category");
  const minPrice = searchParams.get("min");
  const maxPrice = searchParams.get("max");
  const paramSearchTerm = searchParams.get("search");

  const { categories } = useSelector((state) => state.category); // Assuming you might use categories later
  const dispatch = useDispatch();
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      newParams.delete("search");
      setSearchTerm("");
      router.push(`/search?${newParams.toString()}`);
      onFilterChange({
        searchTerm: "",
        category: selectedCategory,
        priceRange,
        other: selectedOther,
      });
      return;
    }
    newParams.set("search", e.target.value);
    router.push(`/search?${newParams.toString()}`);
    onFilterChange({
      searchTerm: e.target.value,
      category: selectedCategory,
      priceRange,
      other: selectedOther,
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    newParams.set("category", category);
    router.push(`/search?${newParams.toString()}`);
    onFilterChange({
      searchTerm,
      category,
      priceRange,
      other: selectedOther,
    });
  };

  const handlePriceSubmit = () => {
    onFilterChange({
      searchTerm,
      category: selectedCategory,
      priceRange,
      other: selectedOther,
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (value === "") {
      newParams.delete(name);
      router.push(`/search?${newParams.toString()}`);
      return;
    }
    newParams.set(name, value);
    router.push(`/search?${newParams.toString()}`);
    onFilterChange({
      searchTerm,
      category: selectedCategory,
      priceRange: { ...priceRange, [name]: value },
      other: selectedOther,
    });
  };

  const handleOtherChange = (option) => {
    setSelectedOther(option);
    onFilterChange({
      searchTerm,
      category: selectedCategory,
      priceRange,
      other: option,
    });
  };

  const clearPriceRange = () => {
    setPriceRange({ min: "", max: "" });
    newParams.delete("min");
    newParams.delete("max");
    router.push(`/search?${newParams.toString()}`);
    onFilterChange({
      searchTerm,
      category: selectedCategory,
      priceRange: { min: "", max: "" },
      other: selectedOther,
    });
  };

  const clearCategory = () => {
    setSelectedCategory("");
    newParams.delete("category");
    router.push(`/search?${newParams.toString()}`);
    onFilterChange({
      searchTerm,
      category: "",
      priceRange,
      other: selectedOther,
    });
  };

  useEffect(() => {
    // Fetch categories or perform any necessary actions
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, []);

  useEffect(() => {
    if (paramCategories) {
      setSelectedCategory(paramCategories);
    }
    if (minPrice) {
      setPriceRange((prev) => ({ ...prev, min: minPrice }));
    }
    if (maxPrice) {
      setPriceRange((prev) => ({ ...prev, max: maxPrice }));
    }
    if (paramSearchTerm) {
      setSearchTerm(paramSearchTerm);
    }
  }, [searchParams]);

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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Category</h3>
          <div
            className="text-sm text-gray-500 cursor-pointer"
            onClick={clearCategory}
          >
            <h2>Clear</h2>
          </div>
        </div>

        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category._id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category._id}
                onChange={() => handleCategoryChange(category._id)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-800 ">Price</h3>
          <div
            className="text-sm text-gray-500 cursor-pointer"
            onClick={clearPriceRange}
          >
            <h2>Clear</h2>
          </div>
        </div>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min"
            name="min"
            value={priceRange.min}
            onChange={(e) => handlePriceChange(e)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Max"
            name="max"
            value={priceRange.max}
            onChange={(e) => handlePriceChange(e)}
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
          {["Ready Stock", "Pre Order", "Normal", "Combos"].map((option) => (
            <button
              key={option}
              onClick={() =>
                handleOtherChange(selectedOther === option ? "" : option)
              }
              className={`flex items-center space-x-2 cursor-pointer w-full text-left px-2 py-1 rounded text-sm ${
                selectedOther === option
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
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

const mainFilter = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Filter />
    </Suspense>
  );
};

export default mainFilter;
