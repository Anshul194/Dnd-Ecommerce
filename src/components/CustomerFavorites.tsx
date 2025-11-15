"use client";

import { ShoppingCart, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/app/store/slices/productSlice";
import Link from "next/link";
import { addToCart, toggleCart } from "@/app/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/app/store/slices/wishlistSlice";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function CustomerFavorites({ content }) {
  const { products } = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?._id); // get logged-in user id

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  // Store wishlisted product ids locally so liked state persists on reload
  const [wishlistedIds, setWishlistedIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("wishlistedIds") || "[]");
    } catch (e) {
      return [];
    }
  });

  const handleAddToCart = (product) => {
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

  // persist wishlisted ids whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("wishlistedIds", JSON.stringify(wishlistedIds));
    } catch (e) {
      // ignore localStorage errors
    }
  }, [wishlistedIds]);

  useEffect(() => {
    console.log("CustomerFavorites content is ===> ", content);
    dispatch(
      fetchProducts({
        page: 1,
        limit: 8,
        sortBy: "rating",
        order: "desc",
        category: content?.category || "",
        search: "",
      })
    );
  }, [content, dispatch]);
  console.log("product slider content is ===> ", products);
  return (
    <section className="max-w-7xl mx-auto py-20 ">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
            {content?.title || "Customer Favorites"}
          </h2>
          <p className="text-gray-600">
            {content?.description ||
              "Discover our top-rated teas, loved by customers for their exceptional quality and flavor."}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products &&
            products?.products?.map((product, index) => (
              <Link href={`/productDetail/${product.slug}`} key={product._id}>
                <motion.div key={product._id} variants={itemVariants}>
                  <Card className="relative group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                    <div className="absolute top-2 right-2 z-50">
                      <button
                        className="w-6 h-6 hover:scale-[1.1] bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                        onClick={async (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (!isAuthenticated) {
                            setShowAuthModal(true);
                            return;
                          }

                          const currentlyLiked = wishlistedIds.includes(
                            product._id
                          );

                          // toggle locally
                          if (currentlyLiked) {
                            // Optimistically remove locally
                            setWishlistedIds((prev) =>
                              prev.filter((id) => id !== product._id)
                            );
                            // Remove on server
                            try {
                              await dispatch(
                                removeFromWishlist({
                                  productId: product._id,
                                  variantId: product?.variants[0]?._id,
                                })
                              );
                            } catch (err) {
                              // if server remove fails, re-add locally
                              setWishlistedIds((prev) => [
                                ...prev,
                                product._id,
                              ]);
                            }
                          } else {
                            setHeartAnimating(true);
                            setWishlistedIds((prev) => [...prev, product._id]);
                            // Optimistically show heart as red and add to server-side wishlist
                            try {
                              await dispatch(
                                addToWishlist({
                                  product: product._id,
                                  variant: product?.variants[0]?._id,
                                })
                              );
                            } catch (err) {
                              // if the server add fails, remove the id again
                              setWishlistedIds((prev) =>
                                prev.filter((id) => id !== product._id)
                              );
                            }
                            setTimeout(() => setHeartAnimating(false), 400);
                          }
                        }}
                        aria-label={
                          wishlistedIds.includes(product._id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
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
                            stroke={
                              wishlistedIds.includes(product._id)
                                ? "#e63946"
                                : "black"
                            }
                            fill={
                              wishlistedIds.includes(product._id)
                                ? "#e63946"
                                : "none"
                            }
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <ImageWithFallback
                          src={
                            product?.thumbnail?.url || product?.images[0]?.url
                          }
                          alt={
                            product?.thumbnail?.alt ||
                            product?.images[0]?.alt ||
                            product.name
                          }
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {product.rating > 3 && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#3C950D] to-[#2d7009] text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="h-12 group-hover:text-[#3C950D] line-clamp-1 mb-2  transition-colors">
                          {product.name}
                        </h3>
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[#3C950D]">
                            <div className="text-lg font-bold text-gray-800">
                              {product.variants[0]?.salePrice ? (
                                <div>
                                  ₹
                                  {product.variants[0]?.salePrice ||
                                    product.variants[0]?.price ||
                                    "N/A"}
                                  <span className="ml-2 line-through opacity-50">
                                    {" "}
                                    ₹{product.variants[0]?.price}
                                  </span>
                                </div>
                              ) : (
                                <div></div>
                              )}
                            </div>
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] shadow-lg hover:shadow-xl transition-all"
                          >
                            <ShoppingCart className="w-4 h-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
