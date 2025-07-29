"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  ShoppingCart,
  Plus,
} from "lucide-react";
import CouponSlider from "./components/CouponSlider";
import HowToUse from "./components/HowToUse";
import DescriptionLayout from "./components/DescriptionLayout";
import ProductReview from "./components/ProductReview";
import FrequentlyPurchased from "./components/FrequentlyPurchased";
import { useDispatch } from "react-redux";
import { fetchProductById } from "@/app/store/slices/productSlice";
import Image from "next/image";
import { addToCart, toggleCart } from "@/app/store/slices/cartSlice";

function ProductPage({ params }) {
  const { id } = params;

  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedPack, setSelectedPack] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [data, setData] = useState({});
  const dispatch = useDispatch();
  const productImages = [
    "/api/placeholder/400/400", // Main saffron product image
    "/api/placeholder/400/400", // Additional product images
    "/api/placeholder/400/400",
    "/api/placeholder/400/400",
    "/api/placeholder/400/400",
    "/api/placeholder/400/400",
  ];

  const packs = {
    pack2: {
      name: "Pack of 2",
      price: 664.16,
      originalPrice: 830.2,
      discount: "20% OFF",
      color: "green",
    },
    pack4: {
      name: "Pack of 4",
      price: 1245.3,
      originalPrice: 1660.4,
      discount: "25% OFF",
      color: "orange",
    },
    pack6: {
      name: "Pack of 6",
      price: 1743.42,
      originalPrice: 2490.6,
      discount: "30% OFF",
      color: "red",
    },
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const getProductData = async () => {
    try {
      const response = await dispatch(fetchProductById(id));
      console.log("Fetched Product Data:", response.payload);
      setSelectedPack(response?.payload?.variants[0]?._id);
      setData(response.payload);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const handleAddToCart = () => {
    const price = data.variants.find((variant) => variant._id === selectedPack);

    dispatch(
      addToCart({
        product: data._id,
        quantity,
        price: price.salePrice || price.price,
        variant: selectedPack,
      })
    );
    dispatch(toggleCart());
  };
  useEffect(() => {
    getProductData();
  }, [id]);
  return (
    <div className="max-w-[90%] mx-auto p-4 bg-white">
      <div>
        {/* Back Button */}
        <button className="mb-4 px-4 py-2 border border-gray-300 rounded text-sm text flex items-center gap-2 hover:bg-gray-50">
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="flex gap-8">
          {/* Left Side - Product Images */}
          <div className="flex-1 ">
            <div className="flex gap-4 h-fit sticky top-16">
              {/* Thumbnail Images */}
              <div className="flex flex-col justify-between gap-2">
                {data?.images?.length > 0 &&
                  [...data.images].map((img, index) => (
                    <div
                      key={index}
                      className={`w-20 h-20 border-2 rounded cursor-pointer overflow-hidden ${
                        selectedImage === index ? "border" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={img}
                        alt={`Product Image ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>

              {/* Main Product Image */}
              <div className="flex-1 relative">
                <div className=" h-full w-fit bg-gray-200 border border-gray-200 rounded-lg overflow-hidden relative group">
                  {/* Navigation arrows */}
                  <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} />
                  </button>

                  <Image
                    src={data?.images?.[selectedImage]}
                    alt="Product Image"
                    width={400}
                    height={400}
                    className=" h-full  bg-gray-200 border border-gray-200 rounded-lg overflow-hidden relative group"
                  ></Image>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="flex-1 max-w-xl ">
            {/* Product Title and Rating */}
            <div className={!data?.name ? "animate-pulse" : ""}>
              {data.name ? (
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {data?.name}
                </h1>
              ) : (
                <div className=" h-8 mb-2 w-full rounded-md bg-black/5"> </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                (4.7) - 390 Product Sold
              </span>
            </div>

            {/* Delivery Options */}
            <div className="mb-6">
              <h3 className="font-semibold text-black mb-2">
                Delivery Options
              </h3>
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
                {data?.variants?.length > 0 &&
                  data?.variants?.map((variant, index) => (
                    <div
                      key={index}
                      className={`relative flex-1 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPack === variant._id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPack(variant._id)}
                    >
                      <div
                        className={`absolute -top-2 -right-2 text-black text-xs px-2 py-1 rounded ${
                          variant.color === "green"
                            ? "bg-green-600"
                            : variant.color === "orange"
                            ? ""
                            : ""
                        }`}
                      >
                        {variant.discount}
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm text-black">
                          {variant.title}
                        </div>
                        <div
                          className={`font-semibold ${
                            selectedPack === variant._id
                              ? "text-green-600"
                              : "text-gray-900"
                          }`}
                        >
                          ₹{variant.price}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ₹{variant.salePrice}
                        </div>
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
                <span className="text-lg font-medium text-black px-4">
                  {quantity}
                </span>
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
              <button
                onClick={handleAddToCart}
                className="px-4 w-full py-3 border  border-gray-300 text rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
              {/* <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded font-medium hover:bg-green-700 transition-colors">
                Buy Now
              </button> */}
            </div>

            {/* Expandable Sections */}
            <div className="space-y-2">
              {/* Product Details */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => toggleSection("details")}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-green-700">
                    Product Details
                  </span>
                  <ChevronRight
                    className={`text transition-transform duration-300 ${
                      expandedSection === "details" ? "rotate-90" : ""
                    }`}
                    size={16}
                  />
                </button>
                <div
                  className={`px-4  text-sm text-gray-600 border-t transition-all duration-300 ease-in-out ${
                    expandedSection === "details"
                      ? "max-h-96 opacity-100 py-3"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                  dangerouslySetInnerHTML={{
                    __html: data.description || "",
                  }}
                ></div>
              </div>

              {/* Ingredients */}
              {data.ingredients && (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <button
                    onClick={() => toggleSection("ingredients")}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="font-medium text-green-700">
                      Ingredients
                    </span>
                    <ChevronDown
                      className={`text transition-transform duration-300 ${
                        expandedSection === "ingredients" ? "rotate-180" : ""
                      }`}
                      size={16}
                    />
                  </button>
                  <div
                    className={`px-4  text-sm text-gray-600 border-t transition-all duration-300 ease-in-out ${
                      expandedSection === "ingredients"
                        ? "max-h-96 opacity-100 py-3"
                        : "max-h-0 opacity-0"
                    } overflow-hidden`}
                    dangerouslySetInnerHTML={{
                      __html: data.ingredients || "",
                    }}
                  ></div>
                </div>
              )}

              {/* Benefits */}
              {data.benefits && (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <button
                    onClick={() => toggleSection("benefits")}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="font-medium text-green-700">Benefits</span>
                    <ChevronDown
                      className={`text transition-transform duration-300 ${
                        expandedSection === "benefits" ? "rotate-180" : ""
                      }`}
                      size={16}
                    />
                  </button>
                  <div
                    className={`px-4  text-sm text-gray-600 border-t transition-all duration-300 ease-in-out ${
                      expandedSection === "benefits"
                        ? "max-h-96 opacity-100 py-3"
                        : "max-h-0 opacity-0"
                    } overflow-hidden`}
                    dangerouslySetInnerHTML={{
                      __html: data.benefits || "",
                    }}
                  ></div>
                </div>
              )}

              {/* How to use */}
              {/* <div className="border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => toggleSection("usage")}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-green-700">How to use</span>
                  <ChevronDown
                    className={`text transition-transform duration-300 ${
                      expandedSection === "usage" ? "rotate-180" : ""
                    }`}
                    size={16}
                  />
                </button>
                <div
                  className={`px-4 py-3 text-sm text-gray-600 border-t transition-all duration-300 ease-in-out ${
                    expandedSection === "usage"
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                    Add a pinch to warm milk or tea. Can be used in cooking and
                    baking. Store in a cool, dry place.
                </div>
              </div> */}

              <div className="mt-6">
                <h3 className="font-semibold text-black mb-3">
                  Available Coupons
                </h3>
                <CouponSlider />
              </div>
            </div>
          </div>
        </div>

        <HowToUse data={data} />
        <DescriptionLayout data={data} />
        <ProductReview />
        <FrequentlyPurchased />
      </div>
    </div>
  );
}

export default ProductPage;
