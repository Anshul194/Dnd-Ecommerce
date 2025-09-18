"use client";

import { fetchBlogs } from "@/app/store/slices/blogSclie";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function BlogSection({ content }) {
  const { items, loading } = useSelector((state) => state.blogs);
  const dispatch = useDispatch();
  const scrollLeft = () => {
    const container = document.getElementById("products-slider");
    container.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = document.getElementById("products-slider");
    container.scrollBy({ left: 300, behavior: "smooth" });
  };

  const products = [
    {
      id: 1,
      name: "Glamorous Garnets",
      rating: 5,
      reviews: 238,
      price: 563,
      outOfStock: false,
    },
    {
      id: 2,
      name: "Luxury Limelight",
      rating: 4,
      reviews: 839,
      price: 238,
      outOfStock: true,
    },
    {
      id: 3,
      name: "Sumptuous Splendor",
      rating: 4,
      reviews: 435,
      price: 183,
      outOfStock: false,
    },
    {
      id: 4,
      name: "Enchanting Ensembles",
      rating: 5,
      reviews: 954,
      price: 39,
      outOfStock: false,
    },
    {
      id: 5,
      name: "Radiant Rarities",
      rating: 3,
      reviews: 123,
      price: 99,
      outOfStock: true,
    },
    {
      id: 6,
      name: "Elegant Essentials",
      rating: 4,
      reviews: 512,
      price: 299,
      outOfStock: false,
    },
  ];

  const StarRating = ({ rating, reviews }) => (
    <div className="flex items-center gap-1 mb-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? "fill-green-500 text-green-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-1">{reviews} Reviews</span>
    </div>
  );

  useEffect(() => {
    if (!items.length > 0) {
      dispatch(fetchBlogs());
    }
  }, []);

  return (
    <div className="p-8 bg-white">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0">
          {content?.title || "Blogs"}
        </h1>
        <p className="text-black max-w-xl relative poppins-medium leading-tight text-lg mb-8">
          {content?.description ||
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </p>
      </div>

      {/* Products Slider */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute -left-14 top-[26%] z-10 w-10 h-10 bg-[#00c950] rounded-full shadow-lg flex items-center justify-center hover:bg-[#00c950] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute -right-14 top-[26%]   z-10 w-10 h-10 bg-[#00c950] rounded-full shadow-lg flex items-center justify-center hover:bg-[#00c950] transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div id="products-slider" className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 justify-between pb-4 w-full">
            {items.map((product) => (
              <Link
                href={`/blogs/${product._id}`}
                key={product._id}
                className="w-full"
              >
                <div
                  key={product._id}
                  className="bg-gray-50/80 group hover:bg-gray-100 cursor-pointer rounded-b-md flex-shrink-0 min-w-64 max-w-[300px] w-full"
                >
                  {/* Product Image */}
                  <div className="relative bg-gray-400 overflow-hidden rounded-t-md w-full h-48 mb-1 ">
                    <Image
                      src={
                        product?.thumbnail?.url ||
                        product?.images[0]?.url ||
                        "/notfound.jpg"
                      }
                      alt={
                        product?.thumbnail?.alt ||
                        product?.images[0]?.alt ||
                        "/notfound.jpg"
                      }
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md group-hover:scale-[1.05] transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="px-3 py-1 pb-4">
                    <h3 className="font-medium poppins text-black mb-1 ">
                      {product.title}
                    </h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.content.slice(0, 90),
                      }}
                      className="text-sm poppins text-black"
                    ></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Green Circle Button */}
      <div className="fixed bottom-8 right-8">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
          <span className="text-white text-lg">→</span>
        </div>
      </div>
    </div>
  );
}
