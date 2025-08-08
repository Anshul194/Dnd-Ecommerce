"use client";

import React, { useEffect } from "react";
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

const Categories = ({ dynamicContent = null }) => {
  const { categories } = useSelector((state) => state.category);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch categories or perform any necessary actions
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, []);

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
      <div className="flex relative flex-col lg:flex-row justify-between w-full h-fit py-20 px-4 lg:px-0">
        <div className="absolute -left-30 md:-left-1/4 top-3/4 transform -translate-y-1/2 z-50">
          <Image
            className="w-[40vh] md:w-[50vh] rotate-[140deg] max-h-[600px]"
            src={leaf}
            alt="Leaf"
            width="auto"
            height="auto"
          />
        </div>
        <div className="flex-1 relative lg:max-w-xl mb-8 lg:mb-0 lg:mr-8">
          <h1 className="!font-bebas text-4xl md:text-5xl font-black text-gray-800 leading-tight mb-6">
            {dynamicContent?.title || "WHAT'S YOUR PICK?"}
          </h1>
          <p className="text-black font-medium text-lg mt-2">
            {dynamicContent?.description ? (
              <span dangerouslySetInnerHTML={{ __html: dynamicContent.description }} />
            ) : (
              <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do{" "}
                <span className="text-fontGreen">eiusmod tempor incididunt</span> ut
                labore et dolor magna{" "}
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
          <Link href={dynamicContent?.cta?.link || '/shop'}>
            <button className="mt-4 relative z-50 bg text-white px-6 py-2 rounded hover:bg-green-700 transition-colors">
              {dynamicContent?.cta?.title || 'Explore'}
            </button>
          </Link>
        </div>

        <div>
          <div className="w-full lg:max-w-lg">
            {categories.length > 6 ? (
              // Render as slider when more than 6 categories
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={2}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 16,
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 16,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 16,
                  },
                }}
                className="categories-swiper"
              >
                {categories.map((item, index) => (
                  <SwiperSlide key={index}>
                    <Link
                      href={`/search?category=${item.slug}`}
                      className="block"
                    >
                      <div className="border-2 mb-10 border-gray-200 shadow-sm rounded-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow min-h-48">
                        <div className="bg text-white text-sm py-2 flex items-center justify-center w-full font-medium">
                          {item?.name}
                        </div>
                        <div className="flex-1 flex items-center justify-center p-2">
                          <Image
                            width={100}
                            height={100}
                            src={item?.thumbnail || "/placeholder.png"}
                            alt="Tea product"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              // Render as grid when 6 or fewer categories
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {categories.length > 0 &&
                  categories.map((item, index) => (
                    <Link href={`/search?category=${item.slug}`} key={index}>
                      <div className="border-2 border-gray-200 shadow-sm w-[45%] md:w-36 min-h-48 rounded-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg text-white text-sm py-2 flex items-center justify-center w-full font-medium">
                          {item?.name}
                        </div>
                        <div className="flex-1 flex items-center justify-center p-2">
                          <Image
                            width={100}
                            height={100}
                            src={item?.thumbnail}
                            alt="Tea product"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
