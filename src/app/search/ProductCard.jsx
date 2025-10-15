"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { addToCart, toggleCart } from "../store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { addToWishlist } from "../store/slices/wishlistSlice";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { redirectToLogin, redirectToSignup } = useAuthRedirect();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?._id); // get logged-in user id
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [localWishlisted, setLocalWishlisted] = useState(false);

  // Fast check: is userId in product.wishlist array?
  const isWishlisted =
    isAuthenticated &&
    userId &&
    Array.isArray(product.wishlist) &&
    product.wishlist.includes(userId);

  // Sync localWishlisted with actual wishlist
  useEffect(() => {
    setLocalWishlisted(isWishlisted);
  }, [isWishlisted, product._id, userId]);

  const handleAddToCart = (e) => {
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

  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  return (
    <>
      <Link
        href={`/productDetail/${product.slug}`}
        className="group cursor-pointer hover:shadow-xl action:scale-90 transition-all"
        prefetch
      >
        <div className="bg-white flex flex-col justify-between border h-96 border-gray-200 rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200 w-full max-w-[320px]">
          {/* Product Header */}
          <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-2xl">
            {/* Heart Icon */}
            <div className="absolute top-2 right-2 z-10">
              <button
                className="w-6 h-6 hover:scale-[1.1] bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!isAuthenticated) {
                    setShowAuthModal(true);
                    return;
                  }
                  setHeartAnimating(true);
                  setLocalWishlisted(true); // Optimistically show heart as red
                  await dispatch(
                    addToWishlist({
                      product: product._id,
                      variant: product?.variants[0]?._id,
                    })
                  );
                  setTimeout(() => setHeartAnimating(false), 400);
                }}
                aria-label="Add to wishlist"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transition: "stroke 0.4s, fill 0.4s" }}
                >
                  <path
                    d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.3947C21.7563 5.72729 21.351 5.1208 20.84 4.61V4.61Z"
                    stroke={localWishlisted ? "#e63946" : "black"}
                    fill={localWishlisted ? "#e63946" : "none"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            {/* Product Image */}
            <div className="flex h-40  justify-center items-center">
              <Image
                src={product?.thumbnail?.url || product.images[0]?.url}
                alt={product?.thumbnail?.alt || product.images[0]?.alt}
                width={160}
                height={120}
                className="object-cover h-full w-full"
              />
            </div>
          </div>

          <div className="p-2">
            {/* Title */}
            <h3 className="text-xs  bg-[#F1FAEE] w-fit p-1 px-3 text poppins-medium  mb-1">
              {product.name.slice(0, 27)}
              {""}
              {product.name.length > 29 ? "..." : ""}
            </h3>

            {/* Description */}
            <div
              className="text-sm h-10 text-black poppins-medium mb-3"
              dangerouslySetInnerHTML={{
                __html: product.description.slice(0, 50),
              }}
            ></div>
          </div>

          {/* Product Info */}
          <div className="p-2">
            <div>
              {/* Price and Rating */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  {product?.variants?.[0]?.price ? (
                    <>
                      {product?.variants[0]?.salePrice && (
                        <span className="text-lg font-bold text-gray-800">
                          Rs {product?.variants[0]?.salePrice}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 h-5  line-through">
                        Rs {product?.variants[0]?.price}
                      </span>
                    </>
                  ) : (
                    <>
                      {product?.salePrice && (
                        <span className="text-lg font-bold text-gray-800">
                          Rs {product?.salePrice}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 h-5  line-through">
                        Rs {product?.price}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-1 pt-1">
                  <span className="text-orange-400 text-sm">⭐</span>
                  <span className="text-sm font-medium text-gray-700">
                    {product.rating.Average || 4.5} ({product.reviewCount || 1}{" "}
                    reviews)
                  </span>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full bg text-white py-2.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </Link>
      <AuthRequiredModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={redirectToLogin}
        onSignup={redirectToSignup}
      />
    </>
  );
};

export default ProductCard;
