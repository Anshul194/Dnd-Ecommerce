"use client";

import React, { useState, useEffect, use } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import Ingredient from "./components/Incredients";
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
import {
  addToCart,
  getCartItems,
  setBuyNowProduct,
  toggleCart,
} from "@/app/store/slices/cartSlice";
import { setCheckoutOpen } from "@/app/store/slices/checkOutSlice";

function ProductPage({ params }) {
  const { id: slug } = React.use(params); // unwrap params with React.use()

  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedPack, setSelectedPack] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [data, setData] = useState({});
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = require("next/navigation").useRouter();

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const nextImage = () => {
    if (data?.images?.length > 0) {
      setSelectedImage((prev) => (prev + 1) % data.images.length);
    }
  };

  const prevImage = () => {
    if (data?.images?.length > 0) {
      setSelectedImage(
        (prev) => (prev - 1 + data.images.length) % data.images.length
      );
    }
  };

  const getProductData = React.useCallback(async () => {
    try {
      // Fetch by slug instead of id
      const response = await dispatch(fetchProductById(slug));
      setSelectedPack(response?.payload?.variants[0]?._id);
      setData(response.payload);
    } catch (error) {
      // Optionally show a toast or error UI
    }
  }, [dispatch, slug]);

  const handleAddToCart = async () => {
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const price = data.variants.find((variant) => variant._id === selectedPack);
    try {
      const resultAction = await dispatch(
        addToCart({
          product: {
            id: data._id,
            name: data.name,
            image: data.thumbnail || data.images[0],
            variant: selectedPack,
            slug: data.slug,
          },
          quantity,
          price: price.salePrice || price.price,
          variant: selectedPack,
        })
      );
      if (resultAction.error) {
        // Show backend error (payload) if present, else generic
        toast.error(
          resultAction.payload ||
            resultAction.error.message ||
            "Failed to add to cart"
        );
        return;
      }
      await dispatch(require("@/app/store/slices/cartSlice").getCartItems());
      dispatch(toggleCart());
    } catch (error) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const price = data.variants.find((variant) => variant._id === selectedPack);
    try {
      const resultAction = await dispatch(
        setBuyNowProduct({
          product: {
            id: data._id,
            name: data.name,
            image: data.thumbnail || data.images[0],
            variant: selectedPack,
            slug: data.slug,
          },
          quantity,
          price: price.salePrice || price.price,
          variant: selectedPack,
        })
      );
      if (resultAction.error) {
        // Show backend error (payload) if present, else generic
        toast.error(
          resultAction.payload ||
            resultAction.error.message ||
            "Failed to add to cart"
        );
        return;
      }
      await dispatch(getCartItems());
      dispatch(setCheckoutOpen(true));
      // dispatch(toggleCart());
    } catch (error) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  useEffect(() => {
    getProductData();
    // Only run on mount or slug change
  }, [getProductData]);

  return (
    <>
      <AuthRequiredModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={() => {
          // Redirect to login with callback to this page
          router.push(`/login?redirect=/product-detail/${id}`);
        }}
        onSignup={() => {
          // Redirect to signup with callback to this page
          router.push(`/signup?redirect=/product-detail/${id}`);
        }}
      />
      <div className="w-full md:max-w-[90%] mx-auto p-4 bg-white">
        <div>
          {/* Back Button */}
          <button className="mb-4 px-4 py-2 border border-gray-300 rounded text-sm flex items-center gap-2 hover:bg-gray-50">
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side - Product Images */}
            <div className="flex-1 w-full md:w-1/2">
              <div className="flex gap-4 h-fit sticky top-16">
                {/* Thumbnail Images */}
                <div className="flex flex-col gap-3">
                  {data?.images?.length > 0 &&
                    [...data.images].map((img, index) => (
                      <div
                        key={index}
                        className={`w-20 h-20 border-2 rounded-lg cursor-pointer overflow-hidden transition-all ${
                          selectedImage === index
                            ? "border-green-500 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <Image
                          src={img?.url}
                          alt={img?.alt || data.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                </div>

                {/* Main Product Image */}
                <div className="flex-1 relative">
                  <div className="aspect-square bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative group">
                    {/* Navigation arrows */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105 z-10"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105 z-10"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {data?.images?.[selectedImage] ? (
                      <Image
                        src={data.images[selectedImage].url}
                        alt={data.images[selectedImage].alt || "Product Image"}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    ) : null}

                    {/* Image indicator dots */}
                    {data?.images?.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {data.images.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              selectedImage === index
                                ? "bg-green-500"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="lg:max-w-xl w-full md:w-1/2">
              {/* Product Title and Rating */}
              <div className={!data?.name ? "animate-pulse" : ""}>
                {data?.name ? (
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {data?.name}
                  </h1>
                ) : (
                  <div className="h-8 mb-2 w-full rounded-md bg-black/5"> </div>
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
              <div className="mb-6 relative">
                <h3 className="font-semibold text-black mb-3">Select Pack</h3>
                <div className="flex gap-3">
                  {data?.variants?.length > 0 ? (
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
                          className={`absolute -top-2 -right-2 text-white text-xs px-2 py-1 rounded ${
                            variant.color === "green"
                              ? "bg-green-600"
                              : variant.color === "orange"
                              ? "bg-orange-500"
                              : "bg-blue-500"
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
                            ₹{variant.salePrice}
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            ₹{variant.price}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`relative w-fit border-2 rounded-lg p-4 cursor-pointer transition-all border-gray-300 hover:border-gray-400`}
                    >
                      <h2 className="text-black/50">No Packs Available</h2>
                    </div>
                  )}
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
                  className="px-4 w-1/2 py-3 border border-gray-300 text rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 w-1/2 bg-green-600 text-white py-3 px-4 rounded font-medium hover:bg-green-700 transition-colors"
                >
                  Buy Now
                </button>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-3">
                {/* Product Details */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button
                    onClick={() => toggleSection("details")}
                    className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
                      expandedSection === "details"
                        ? "bg-green-50 hover:bg-green-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`font-semibold text-base ${
                        expandedSection === "details"
                          ? "text-green-700"
                          : "text-green-600"
                      }`}
                    >
                      Product Details
                    </span>
                    <div
                      className={`p-1 rounded-full transition-all duration-300 ${
                        expandedSection === "details"
                          ? "bg-green-200 rotate-180"
                          : "bg-gray-100"
                      }`}
                    >
                      <ChevronDown
                        className={`transition-colors duration-200 ${
                          expandedSection === "details"
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                        size={18}
                      />
                    </div>
                  </button>
                  <div
                    className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
                      expandedSection === "details"
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div
                      className="px-5 py-4 text-sm text-gray-700 leading-relaxed bg-gray-50"
                      dangerouslySetInnerHTML={{
                        __html: data?.description || "",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Ingredients Accordion */}
                {Array.isArray(data?.ingredients) &&
                  data?.ingredients?.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        onClick={() => toggleSection("ingredients")}
                        className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
                          expandedSection === "ingredients"
                            ? "bg-green-50 hover:bg-green-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`font-semibold text-base ${
                            expandedSection === "ingredients"
                              ? "text-green-700"
                              : "text-green-600"
                          }`}
                        >
                          Ingredients
                        </span>
                        <div
                          className={`p-1 rounded-full transition-all duration-300 ${
                            expandedSection === "ingredients"
                              ? "bg-green-200 rotate-180"
                              : "bg-gray-100"
                          }`}
                        >
                          <ChevronDown
                            className={`transition-colors duration-200 ${
                              expandedSection === "ingredients"
                                ? "text-green-700"
                                : "text-gray-600"
                            }`}
                            size={18}
                          />
                        </div>
                      </button>
                      <div
                        className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
                          expandedSection === "ingredients"
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        } overflow-hidden`}
                      >
                        <div className="px-5 py-4 text-sm text-gray-700 bg-gray-50">
                          <ul className="space-y-2">
                            {data?.ingredients?.length > 0 &&
                              data?.ingredients?.map((item, idx) => (
                                <li
                                  key={item._id || idx}
                                  className="flex items-start gap-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: item.description,
                                    }}
                                    className="leading-relaxed"
                                  ></div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Benefits Accordion */}
                {data?.benefits &&
                  Array.isArray(data?.benefits) &&
                  data?.benefits?.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        onClick={() => toggleSection("benefits")}
                        className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
                          expandedSection === "benefits"
                            ? "bg-green-50 hover:bg-green-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`font-semibold text-base ${
                            expandedSection === "benefits"
                              ? "text-green-700"
                              : "text-green-600"
                          }`}
                        >
                          Benefits
                        </span>
                        <div
                          className={`p-1 rounded-full transition-all duration-300 ${
                            expandedSection === "benefits"
                              ? "bg-green-200 rotate-180"
                              : "bg-gray-100"
                          }`}
                        >
                          <ChevronDown
                            className={`transition-colors duration-200 ${
                              expandedSection === "benefits"
                                ? "text-green-700"
                                : "text-gray-600"
                            }`}
                            size={18}
                          />
                        </div>
                      </button>
                      <div
                        className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
                          expandedSection === "benefits"
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        } overflow-hidden`}
                      >
                        <div className="px-5 py-4 text-sm text-gray-700 bg-gray-50">
                          <ul className="space-y-2">
                            {data?.benefits?.length > 0 &&
                              data?.benefits?.map((item, idx) => (
                                <li
                                  key={item._id || idx}
                                  className="flex items-start gap-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div
                                    className="leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: item.description,
                                    }}
                                  ></div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Precautions Accordion */}
                {data?.precautions &&
                  Array.isArray(data?.precautions) &&
                  data?.precautions?.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        onClick={() => toggleSection("precautions")}
                        className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
                          expandedSection === "precautions"
                            ? "bg-green-50 hover:bg-green-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`font-semibold text-base ${
                            expandedSection === "precautions"
                              ? "text-green-700"
                              : "text-green-600"
                          }`}
                        >
                          Precautions
                        </span>
                        <div
                          className={`p-1 rounded-full transition-all duration-300 ${
                            expandedSection === "precautions"
                              ? "bg-green-200 rotate-180"
                              : "bg-gray-100"
                          }`}
                        >
                          <ChevronDown
                            className={`transition-colors duration-200 ${
                              expandedSection === "precautions"
                                ? "text-green-700"
                                : "text-gray-600"
                            }`}
                            size={18}
                          />
                        </div>
                      </button>
                      <div
                        className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
                          expandedSection === "precautions"
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        } overflow-hidden`}
                      >
                        <div className="px-5 py-4 text-sm text-gray-700 bg-gray-50">
                          <ul className="space-y-2">
                            {data?.precautions?.length > 0 &&
                              data?.precautions?.map((item, idx) => (
                                <li
                                  key={item._id || idx}
                                  className="flex items-start gap-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: item.description,
                                    }}
                                    className="leading-relaxed"
                                  ></div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                {/* How to use */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button
                    onClick={() => toggleSection("usage")}
                    className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
                      expandedSection === "usage"
                        ? "bg-green-50 hover:bg-green-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`font-semibold text-base ${
                        expandedSection === "usage"
                          ? "text-green-700"
                          : "text-green-600"
                      }`}
                    >
                      How to use
                    </span>
                    <div
                      className={`p-1 rounded-full transition-all duration-300 ${
                        expandedSection === "usage"
                          ? "bg-green-200 rotate-180"
                          : "bg-gray-100"
                      }`}
                    >
                      <ChevronDown
                        className={`transition-colors duration-200 ${
                          expandedSection === "usage"
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                        size={18}
                      />
                    </div>
                  </button>
                  <div
                    className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
                      expandedSection === "usage"
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div className="px-5 py-4 text-sm text-gray-700 leading-relaxed bg-gray-50">
                      Add a pinch to warm milk or tea. Can be used in cooking
                      and baking. Store in a cool, dry place.
                    </div>
                  </div>
                </div>

                {/* <div className="mt-6">
                  <h3 className="font-semibold text-black mb-3">
                    Available Coupons
                  </h3>
                  <CouponSlider />
                </div> */}
              </div>
            </div>
          </div>

          <HowToUse data={data} />
          {/* <Ingredient /> */}
          <Ingredient data={data} />


          <DescriptionLayout data={data} />
          <ProductReview id={data?._id} />
          <FrequentlyPurchased />
        </div>
      </div>
    </>
  );
}

export default ProductPage;
