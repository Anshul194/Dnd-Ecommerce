"use client";

import React, { useEffect, useRef } from "react";
import leaf from "../../../public/images/leaf.png";
import Image from "next/image";
import heart from "../../../public/images/heart.png";
import { useSelector } from "react-redux";
import { fetchCategories } from "@/app/store/slices/categorySlice";
import { useDispatch } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnimatedGradientBorder from "@/components/ui/AnimatedGradientBorder";
import { getImageUrl } from "@/app/utils/imageHelper";

const Categories = ({ dynamicContent = null }) => {
  const { categories, lastFetched } = useSelector((state) => state.category);
  const dispatch = useDispatch();
  const router = useRouter();

  const hasFetched = useRef(false);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const isCacheValid = lastFetched && (Date.now() - lastFetched < CACHE_DURATION);

    // Fetch categories only once if not already available or cache expired
    if (!hasFetched.current && (!categories || categories.length === 0 || !isCacheValid)) {
      hasFetched.current = true;
      dispatch(fetchCategories());
    }
  }, [dispatch, categories, lastFetched]);

  return (
    <>
      <style jsx global>{`
        .categories-swiper .swiper-button-next,
        .categories-swiper .swiper-button-prev {
          color: #22c55e;
          width: 30px;
          height: 30px;
          margin-top: -15px;
        }

        .categories-swiper .swiper-button-next:after,
        .categories-swiper .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }

        .categories-swiper .swiper-pagination-bullet {
          background: #22c55e;
        }

        .categories-swiper .swiper-pagination {
          bottom: -5px;
        }

        @media (max-width: 768px) {
          .categories-swiper .swiper-button-next,
          .categories-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
      <div className="flex relative flex-col gap-8 justify-between w-full h-fit py-20 md:px-4 lg:px-0">
        <div className="absolute -left-30 md:-left-1/4 top-3/4 transform -translate-y-1/2 -z-0">
          <Image
            className="w-[40vh] md:w-[50vh] rotate-[140deg] max-h-[600px]"
            src={leaf}
            alt="Leaf"
            width="auto"
            height="auto"
          />
        </div>
        <div className="flex-1 flex  flex-col relative mb-8 lg:mb-0 ">
          <h1 className="text-4xl  md:text-5xl font-black text-gray-800 leading-tight mb-2 text-center">
            {dynamicContent?.title || "WHAT'S YOUR PICK?"}
          </h1>
          <AnimatedGradientBorder />
          <p className="text-black font-medium lg:max-w-[80%] text-lg mt-2 m-auto text-center">
            {dynamicContent?.description ? (
              <span
                dangerouslySetInnerHTML={{ __html: dynamicContent.description }}
              />
            ) : (
              <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do{" "}
                <span className="text-fontGreen">
                  eiusmod tempor incididunt
                </span>{" "}
                ut labore et dolor magna{" "}
                <span className="relative w-8">
                  aliqua{" "}
                  <Image
                    src={heart}
                    className="absolute -right-7 -bottom-10 w-8"
                    alt="heart-img"
                  />
                </span>
                .
              </>
            )}
          </p>

        </div>

        <div>
          <div className="w-full">
            {categories.length >= 6 ? (
              // Render as slider when more than 6 categories
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={3}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                    spaceBetween: 2,
                  },
                  550: {
                    slidesPerView: 2,
                    spaceBetween: 16,
                  },
                  750: {
                    slidesPerView: 3,
                    spaceBetween: 16,
                  },
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 16,
                  },
                }}
                className="categories-swiper"
              >
                {categories.map((item, index) => (
                  <SwiperSlide key={index}>
                    <Link
                      href={`/search?category=${item._id}`}
                      className="block cursor-pointer"
                    >
                      <div className="border-2 mb-10 border-gray-200 shadow-sm rounded-lg flex flex-col overflow-hidden hover:shadow-md transition-shadow h-72">
                        <div className="flex-1 relative w-full">
                          <Image
                            fill
                            src={getImageUrl(item?.thumbnail || item?.image) || "/placeholder.png"}
                            alt={item?.name || "Category Image"}
                            className="object-cover"
                          />
                        </div>
                        <div className="bg text-white text-xs py-3 px-2 text-center flex items-center justify-center w-full font-bold uppercase tracking-widest">
                          {item?.name}
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              // Render as grid when 6 or fewer categories
              <div className="grid grid-cols-2 md:flex md:flex-row md:justify-center flex-wrap gap-4 justify-items-center">
                {categories.length > 0 &&
                  categories.map((item, index) => (
                    <Link href={`/search?category=${item._id}`} key={index}>
                      <div className="border-2 border-gray-200 shadow-sm w-[45%] max-sm:w-[160px] md:w-56 min-h-48 rounded-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex-1 relative w-full h-44">
                          <Image
                            fill
                            src={getImageUrl(item?.thumbnail || item?.image) || "/placeholder.png"}
                            alt={item?.name || "Category Image"}
                            className="object-cover"
                          />
                        </div>
                        <div className="bg text-white text-xs py-3 px-2 text-center flex items-center justify-center w-full font-bold uppercase tracking-widest">
                          {item?.name}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
        <Link className="w-fit m-auto " href={dynamicContent?.cta?.link || "/shop"}>
          <button className="mt-4   z-50 bg text-white px-6 py-2 rounded hover:bg-green-700 transition-colors">
            {dynamicContent?.cta?.title || "Explore"}
          </button>
        </Link>
      </div>
    </>
  );
};

export default Categories;
