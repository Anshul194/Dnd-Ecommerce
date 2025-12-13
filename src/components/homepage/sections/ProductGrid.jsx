"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/app/store/slices/productSlice";
import ProductCard from "@/app/search/ProductCard";
import AnimatedGradientBorder from "@/components/ui/AnimatedGradientBorder";

const ProductGrid = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);

  useEffect(() => {
    // Fetch all products on component mount
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Get products array from the response
  const productList = products?.products || products || [];

  return (
    <div className="w-full py-20">
      {/* Section Header */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl w-full font-black text-gray-800 leading-tight mb-2 text-center">
          All Products
        </h1>
        <AnimatedGradientBorder />
        <p className="text-gray-600 text-center mt-4 text-lg">
          Explore our complete collection of premium products
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && productList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
          {productList.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              showDes={false}
              buyNow={true}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && productList.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No products available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
