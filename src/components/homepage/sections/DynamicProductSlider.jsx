"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import teaOne from "../../../../public/images/one.webp";
import { fetchProducts } from "@/app/store/slices/productSlice";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart, X } from "lucide-react";
import {
  addToCart,
  getCartItems,
  setBuyNowProduct,
  toggleCart,
} from "@/app/store/slices/cartSlice";
import { setCheckoutOpen } from "@/app/store/slices/checkOutSlice";
import { toast } from "react-toastify";

const DynamicProductSlider = ({ content }) => {
  const { title, description, image } = content;
  const { products } = useSelector((state) => state.product);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayProduct, setOverlayProduct] = useState(null);

  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dispatch = useDispatch();

  const nextSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev + 1) %
        Math.max(1, products.products.filter((P) => P.storyVideoUrl).length - 3)
    );
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev -
          1 +
          Math.max(
            1,
            products.products.filter((P) => P.storyVideoUrl).length - 3
          )) %
        Math.max(1, products.products.filter((P) => P.storyVideoUrl).length - 3)
    );
  };

  // Static products for now - you'll replace this with API data later

  // Initialize scroll buttons on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollButtons();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const scroll = (direction) => {
    const container = sliderRef.current;
    if (!container) return;

    const scrollAmount = 210; // Adjusted for card width (200px + 16px gap)

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }

    // Update button states after scroll animation
    setTimeout(() => {
      updateScrollButtons();
    }, 300);
  };

  const updateScrollButtons = () => {
    const container = sliderRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const handleScroll = () => {
    // Throttle the scroll updates
    clearTimeout(handleScroll.timeout);
    handleScroll.timeout = setTimeout(updateScrollButtons, 50);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    // if (!isAuthenticated) {
    //   setShowAuthModal(true);
    //   return;
    // }

    const price = product?.variants[0]
      ? product?.variants[0]?.salePrice || product?.variants[0]?.price
      : product?.salePrice || product?.price;
    dispatch(
      addToCart({
        product: {
          id: product._id,
          name: product.name,
          image: product.thumbnail || product.images[0],
          variant: product?.variants[0]?._id,
          slug: product.slug,
        },
        quantity: 1,
        price: price,
        variant: product?.variants[0]?._id,
      })
    );
    dispatch(toggleCart());
  };

  const handleBuyNow = async (e, productData) => {
    e.stopPropagation();
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const price = productData.variants[0];
    try {
      const resultAction = await dispatch(
        setBuyNowProduct({
          product: {
            id: productData._id,
            name: productData.name,
            image: productData.thumbnail || productData.images[0],
            variant: productData.variants[0]._id,
            slug: productData.slug,
          },
          quantity: 1,
          price: price.salePrice || price.price,
          variant: productData.variants[0]._id,
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
      setOverlayProduct(null);
      dispatch(setCheckoutOpen(true));
      // dispatch(toggleCart());
    } catch (error) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  const openOverlay = (product) => {
    setOverlayProduct(product);
    setOverlayOpen(true);
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    // keep product for a short time to allow potential animations
    setTimeout(() => setOverlayProduct(null), 200);
  };

  // handle Escape key to close overlay and disable body scroll when open
  useEffect(() => {
    if (!overlayOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") closeOverlay();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        frequentlyPurchased: true,
      })
    );
  }, []);

  return (
    <div className="flex relative flex-col gap-4 justify-between w-full h-fit py-20 px-4 lg:px-0">
      {/* Left Content - Dynamic from API */}
      <div className="flex-1 relative lg:max-w-md mb-8 lg:mb-0 lg:mr-8 z-20">
        <h1 className="!font-bebas text-5xl w-full font-black text-gray-800 leading-tight mb-6">
          {title}
        </h1>
        <div
          className="text-gray-800 font-medium text-lg mt-2"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>

      {/* Right Content - Product Slider */}
      <div className="flex-1 relative z-20 ">
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`absolute -left-4 md:-left-5 top-1/2 border border-black/20 transform -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${
              canScrollLeft
                ? "text-gray-700 hover:bg-gray-50 cursor-pointer opacity-100"
                : "text-gray-300 cursor-not-allowed opacity-0"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="#3c950d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`absolute -right-2 md:-right-5 top-1/2 border transform -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 ${
              canScrollRight
                ? "text-gray-700 hover:bg-gray-50 cursor-pointer opacity-100"
                : "text-gray-300 cursor-not-allowed opacity-0"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="#3c950d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Slider Container */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scrollbar-hide space-x-4  py-4 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products?.products?.length > 0 &&
              products?.products?.map((product, index) => (
                <div
                  key={index}
                  className="min-w-[200px] bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200"
                >
                  {/* Product Header */}
                  <div className="rounded-xl relative">
                    <div className="flex h-40  justify-center">
                      {/* <img
                        src={product?.thumbnail?.url || product?.images[0]?.url}
                        alt={product?.thumbnail?.alt || product?.images[0]?.alt}
                        className="w-full h-full object-cover"
                      /> */}
                      <img
                        src={
                          product?.thumbnail?.url ||
                          product?.images?.[0]?.url ||
                          "/images/placeholder.png" // fallback image in public/images
                        }
                        alt={
                          product?.thumbnail?.alt ||
                          product?.images?.[0]?.alt ||
                          product?.name ||
                          "Product image"
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="p-3 h-1/2 flex flex-col justify-between">
                    {/* Product Info */}
                    <div>
                      <div className="text-xs h-8 font-medium text-gray-600 mb-1">
                        {product.name}
                      </div>
                      {/* <p className="text-sm text-black font-semibold mb-2">
                        {product.description}
                      </p> */}

                      <div className="flex justify-between items-center mb-1">
                        <span className="text-lg font-bold text-gray-800">
                          ₹
                          {product.variants[0]?.salePrice ||
                            product.variants[0]?.price ||
                            200}
                        </span>
                        {product.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-medium text-gray-700">
                              {product.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleBuyNow(e, product)}
                        className="w-4/3 h-10 mb-2 bg text-white py-2.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors duration-200"
                      >
                        Buy Now
                      </button>

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="h-10 w-3/5 flex justify-center group items-center border hover:bg-[#3C950D]  rounded-lg"
                      >
                        <ShoppingCart className="w-4 h-4 text-[#3C950D] group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="mt-20">
        <div>
          <h1 className="!font-bebas text-5xl w-full font-black text-gray-800 leading-tight mb-6">
            Story
          </h1>
        </div>
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 translate-x-12 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Slider Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / 4)}%)`,
              }}
            >
              {products.products.map((product, index) => {
                if (!product.storyVideoUrl || product.storyVideoUrl === "") {
                  return null;
                }
                return (
                  <div
                    key={index}
                    className="w-1/4 relative min-w-[270px] flex-shrink-0  cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => openOverlay(product)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        openOverlay(product);
                    }}
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl h-96 flex flex-col">
                      {/* Name with green icon */}
                      <div className="absolute top-4 right-6 flex items-center justify-between mb-6">
                        <h3 className="text-md bebas font-bold text-black uppercase tracking-wide">
                          {product?.userId?.name}
                        </h3>
                        <Image
                          className="h-6 w-6"
                          src={"/images/heart.png"}
                          width={40}
                          height={40}
                          alt="heart-icon"
                        />
                      </div>

                      {/* Gray placeholder box */}
                      <div className="w-full h-full bg-gray-300 rounded-lg">
                        {/* Placeholder for image or additional content */}
                        {product?.storyVideoUrl.includes(".mp4") ? (
                          <video
                            src={product?.storyVideoUrl}
                            className="w-full h-full object-cover rounded-lg"
                            // controls
                            autoPlay
                            muted
                          />
                        ) : (
                          <img
                            src={product?.storyVideoUrl}
                            alt="Story Visual"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slider Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({
            length: Math.max(
              1,
              products.products.filter((P) => P.storyVideoUrl).length - 3
            ),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentSlide === index ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        {/* Overlay for full-page media preview */}
        {overlayOpen && overlayProduct && (
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4"
            onClick={closeOverlay}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="relative h-[80%] bg-white rounded-lg overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeOverlay}
                aria-label="Close preview"
                className="absolute right-3 top-3 z-50 bg-white rounded-full w-9 h-9 flex items-center justify-center border shadow hover:bg-gray-50"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="w-full bg-black flex items-center justify-center">
                {overlayProduct.storyVideoUrl?.includes(".mp4") ? (
                  <video
                    src={overlayProduct.storyVideoUrl}
                    controls
                    autoPlay
                    className="w-fit h-full object-cover bg-black"
                  />
                ) : (
                  <img
                    src={overlayProduct.storyVideoUrl}
                    alt={overlayProduct.name || "story media"}
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>

              <div className=" absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full md:w-auto rounded-lg ">
                {/* Add to Cart Button */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleBuyNow(e, overlayProduct)}
                    className="w-32 h-10 mb-2 bg text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                  >
                    Buy Now
                  </button>

                  <button
                    onClick={(e) => handleAddToCart(e, overlayProduct)}
                    className="h-10 w-32 text-sm flex justify-center group items-center border hover:bg-[#3C950D]  rounded-lg"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicProductSlider;
