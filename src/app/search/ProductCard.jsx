"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  addToCart,
  getCartItems,
  setBuyNowProduct,
  toggleCart,
  closeCart,
} from "../store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { setCheckoutOpen } from "../store/slices/checkOutSlice";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import {
  addToWishlist,
  removeFromWishlist,
} from "../store/slices/wishlistSlice";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "react-toastify";

import { trackEvent } from "../lib/tracking/trackEvent";
import { useTrack } from "../lib/tracking/useTrack";

const ProductCard = ({ product, showDes, buyNow }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { redirectToLogin, redirectToSignup } = useAuthRedirect();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?._id); // get logged-in user id
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [localWishlisted, setLocalWishlisted] = useState(false);
  const [overlayProduct, setOverlayProduct] = useState(null);
  const { trackView, trackAddToCart, trackWishlist, trackRemoveWishlist } =
    useTrack();

  // Get wishlist items from Redux for immediate updates
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Check if product is in Redux wishlist (for immediate UI updates)
  const isInReduxWishlist = wishlistItems.some((item) => {
    const itemProductId = String(item.product?._id || item.product?.id || '');
    const productId = String(product._id || '');
    
    if (itemProductId !== productId) return false;
    
    // If variant exists, also check variant match
    const variantId = product?.variants[0]?._id;
    if (variantId) {
      const itemVariantId = String(item.variant?._id || item.variant?.id || '');
      return itemVariantId === String(variantId);
    }
    
    return true;
  });

  // Fast check: is userId in product.wishlist array? (from server data - fallback only when Redux is empty)
  const isWishlistedFromProduct =
    isAuthenticated &&
    userId &&
    Array.isArray(product.wishlist) &&
    product.wishlist.includes(userId);

  // Always prioritize Redux state when available (even if empty)
  // Only fallback to product data if Redux hasn't been initialized yet
  // Check if Redux has been loaded by checking if wishlistItems is an array
  const isReduxInitialized = Array.isArray(wishlistItems);
  const isWishlisted = isReduxInitialized
    ? isInReduxWishlist  // Always trust Redux state if it's been initialized
    : isWishlistedFromProduct; // Only use product data if Redux hasn't loaded yet

  const handleProductClick = () => {
    // Track product view only when clicked
    if (product?._id) {
      trackView(product._id);
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    // Ensure cart sidebar is closed immediately - before any operations
    dispatch(closeCart());
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const price = product.variants[0];
    try {
      // Ensure image has proper structure
      const productImage = product.thumbnail || product.images?.[0];
      const imageObj = productImage 
        ? (typeof productImage === 'string' 
            ? { url: productImage, alt: product.name } 
            : { url: productImage.url || productImage, alt: productImage.alt || product.name })
        : { url: "/Image-not-found.png", alt: product.name };

      const resultAction = await dispatch(
        setBuyNowProduct({
          product: {
            _id: product._id,
            id: product._id,
            name: product.name,
            image: imageObj,
            category: product.category,
          },
          quantity: 1,
          price: price.salePrice || price.price,
          variant: product.variants[0]._id,
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
      // Skip getCartItems for Buy Now - we use buyNowProduct which is separate
      // await dispatch(getCartItems());
      setOverlayProduct(null);
      // Open checkout popup immediately
      dispatch(setCheckoutOpen());
      // Navigate to checkout-popup page
      router.push("/checkout-popup");
    } catch (error) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  // Sync local state with Redux state and product data
  // This ensures local state stays in sync, but we use isWishlisted directly for display
  useEffect(() => {
    setLocalWishlisted(isWishlisted);
  }, [isWishlisted, wishlistItems.length, product._id, userId]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent Link navigation
    // if (!isAuthenticated) {
    //   setShowAuthModal(true);
    //   return;
    // }

    const price = product?.variants[0]
      ? product?.variants[0]?.salePrice || product?.variants[0]?.price
      : product?.salePrice || product?.price;
    
    try {
      const resultAction = await dispatch(
      addToCart({
        product: product._id,
        quantity: 1,
        price: price,
        variant: product?.variants[0]?._id,
      })
    );
      
      // Don't immediately call getCartItems() - it can overwrite the cart if server hasn't synced
      // The addToCart action already updates the Redux state and localStorage
      // Only refresh cart from server after a delay to allow server to sync
      if (!resultAction.error) {
        setTimeout(async () => {
          try {
            await dispatch(getCartItems());
          } catch (err) {
            // Silently fail - cart is already updated locally
          }
        }, 500); // 500ms delay to allow server to process
      }
      
    trackAddToCart(product._id);
    dispatch(toggleCart());
    } catch (error) {
      // Handle error silently or show toast if needed
      console.warn("Add to cart error:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  if (!product.variants || product.variants.length === 0) {
    return null; // Don't render if no variants
  }

  return (
    <>
      <Link
        href={`/productDetail/${product.slug}`}
        className="group cursor-pointer hover:shadow-xl action:scale-90 transition-all w-full h-full"
        prefetch
        onClick={handleProductClick}
      >
        <div
          className={`${
            showDes ? "h-96 max-sm:h-full" : "h-full sm:h-[420px]"
          } bg-white flex max-sm:w-full  max-sm:mx-auto flex-col justify-between border  border-gray-200 rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200 md:w-full max-w-[320px]`}
          // } bg-white flex max-sm:w-full max-sm:min-w-[280px] max-sm:mx-auto flex-col justify-between border  border-gray-200 rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200 w-[200px] md:w-full max-w-[320px]`}
        >
          {/* Product Header */}
          <div className="relative bg-white rounded-t-2xl">
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

                  // Use Redux state to determine current wishlist status
                  const currentlyWishlisted = isWishlisted;

                  if (!currentlyWishlisted) {
                    // Optimistically update for immediate UI feedback
                    setLocalWishlisted(true);
                    const result = await dispatch(
                      addToWishlist({
                        product: product._id,
                        variant: product?.variants[0]?._id,
                      })
                    );
                    // If add failed, revert optimistic update
                    if (result.error) {
                      setLocalWishlisted(false);
                      toast.error("Failed to add to wishlist");
                    } else {
                      trackWishlist(product._id);
                    }
                  } else {
                    // Optimistically update for immediate UI feedback
                    setLocalWishlisted(false);
                    const result = await dispatch(
                      removeFromWishlist({
                        productId: product._id,
                        variantId: product?.variants[0]?._id,
                      })
                    );
                    // If remove failed, revert optimistic update
                    if (result.error) {
                      setLocalWishlisted(true);
                      toast.error("Failed to remove from wishlist");
                    } else {
                      trackRemoveWishlist(product._id);
                    }
                  }

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
                    stroke={isWishlisted ? "#e63946" : "black"}
                    fill={isWishlisted ? "#e63946" : "none"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            {/* Product Image */}
            <div className="flex h-56 max-sm:h-44 max-sm:w-full justify-center items-center overflow-hidden">
            {/* <div className="flex h-40  max-sm:h-32 max-sm:w-fit max-sm:mx-auto justify-center items-center"> */}
              <Image
                src={product?.thumbnail?.url || product.images?.[0]?.url || "/Image-not-found.png"}
                alt={product?.thumbnail?.alt || product.images?.[0]?.alt || product?.name || "Product Image"}
                width={160}
                height={120}
                className="object-cover h-full w-full"
              />
            </div>
          </div>

          <div className="p-2">
            {/* Title */}
            <h3 className="text-xs  bg-[#F1FAEE] w-fit p-1 px-3 text poppins-medium  mb-1">
              {product?.name?.slice(0, 15)}
              {""}
              {product?.name?.length > 18 ? "..." : ""}
            </h3>

            {/* Rating - Only show if rating > 0 */}
            {product?.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-gray-700 ml-1">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                {product?.reviewCount > 0 && (
                  <span className="text-xs text-gray-500">
                    ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {showDes && (
              <div
                className="text-sm h-10 text-black poppins-medium mb-3 max-sm:hidden"
                dangerouslySetInnerHTML={{
                  __html: product?.description?.slice(0, 50),
                }}
              ></div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-2">
            <div>
              {/* Price and Rating */}
              <div className="flex max-sm:flex-row justify-between items-start max-sm:items-center mb-4">
                <div className="flex flex-col max-sm:flex-row max-sm:items-center max-sm:gap-2">
                  {product?.variants?.[0]?.price ? (
                    <>
                      {product?.variants[0]?.salePrice && (
                        <span className="text-lg  max-sm:text-base font-bold text-gray-800">
                          Rs {product?.variants[0]?.salePrice}
                        </span>
                      )}
                      <span className="text-xs  max-sm:text-xs text-gray-400 h-5  line-through">
                        Rs {product?.variants[0]?.price}
                      </span>
                    </>
                  ) : (
                    <>
                      {product?.salePrice && (
                        <span className="text-lg max-sm:text-base font-bold text-gray-800">
                          Rs {product?.salePrice}
                        </span>
                      )}
                      <span className="text-xs  max-sm:text-md text-gray-400 h-5  line-through">
                        Rs {product?.price}
                      </span>
                    </>
                  )}
                </div>
                {/* <div className="flex items-center space-x-1 pt-1">
                  <span className="text-orange-400 text-sm">⭐</span>
                  <span className="text-sm font-medium text-gray-700">
                    {product?.rating?.Average || 4.5} (
                    {product?.reviewCount || 1} reviews)
                  </span>
                </div> */}
              </div>
              {buyNow ? (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleBuyNow(e)}
                    className="w-4/3 h-10 max-sm:h-9 mb-2 bg-green-600 text-white py-2.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors duration-200"
                  >
                    Buy Now
                  </button>

                  <button
                    onClick={(e) => handleAddToCart(e)}
                    className="h-10 max-sm:h-9 w-3/5 flex justify-center group/group2 items-center border hover:bg-[#3C950D]  rounded-lg"
                    type="button"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#3C950D] group-hover/group2:text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => handleAddToCart(e)}
                  className="w-full bg-green-600 text-white py-2.5 max-sm:py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors duration-200"
                  type="button"
                >
                  Add to cart
                </button>
              )}
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