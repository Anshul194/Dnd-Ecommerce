"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { fetchCertificates } from "@/app/store/slices/certificateSlice";

export default function ValidatedSection({ content }) {
  const scrollContainerRef = useRef(null);
  const dispatch = useDispatch();
  const { certificates = [], loading: certLoading } = useSelector(
    (state) => state.certificate || {}
  );

  useEffect(() => {
    // fetch all certificates for this section (use a large limit)
    dispatch(fetchCertificates({ page: 1, limit: 10000 }));
  }, [dispatch]);
  // show all certificates if available; otherwise fallback to content.images or a few placeholders
  let certificatesForUI = [];
  if (Array.isArray(certificates) && certificates.length > 0) {
    certificatesForUI = certificates;
  } else if (Array.isArray(content?.images) && content.images.length > 0) {
    certificatesForUI = content.images.map((url) => ({ file: url }));
  } else {
    certificatesForUI = Array.from({ length: 5 }).map(() => null);
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // console.log("====================> ", certificates);
  return (
    <div className="w-full py-10 lg:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between flex-col md:flex-row items-start mb-16">
          <div className="flex-1">
            <h1 className="text-[50px] leading-[7vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0 ">
              {content?.title}
            </h1>
          </div>

          <div className="flex-1 flex justify-end items-start">
            <div className="max-w-md text-start">
              <p className="text-black relative poppins-medium leading-tight max-w-lg text-lg ml-auto">
                {content?.description}
                <span className="relative">
                  <img
                    src="/images/smile.png"
                    alt="smiley face"
                    className="w-12 h-12 absolute -right-10 -bottom-10"
                  />
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Green Circles Section with Arrows */}
        <div className="relative">
          {/* Left Arrow */}
          {/* <button
            onClick={scrollLeft}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button> */}

          {/* Right Arrow */}
          {/* <button
            onClick={scrollRight}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 translate-x-12 z-10 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button> */}

          {/* Marquee wrapper */}
          <div className="overflow-hidden">
            {/* marquee content: duplicated items for seamless loop */}
            <div
              ref={scrollContainerRef}
              className="marquee__track flex gap-5 items-center"
              style={{ "--marquee-duration": "20s" }}
            >
              {/* First set: certificates from redux (fallback to placeholder) */}
              <div className="marquee__group flex gap-5">
                {certificatesForUI.map((item, index) => (
                  <div
                    key={`a-${index}`}
                    className="w-32 h-32 md:w-40 md:h-40 lg:w-[30vh] lg:h-[30vh] flex-shrink-0 rounded-full border-4 border-green-500 bg-white"
                  >
                    <Image
                      src={
                        item && item.file
                          ? item.file
                          : content?.images && content.images[index]
                          ? content.images[index]
                          : "/logo-place-holder.png"
                      }
                      alt={`Certificate ${index + 1}`}
                      width={160}
                      height={160}
                      className="w-full h-full scale-75 object-cover rounded-full"
                    />
                  </div>
                ))}
              </div>

              {/* Duplicate set */}
              <div className="marquee__group flex gap-5">
                {certificatesForUI.map((item, index) => (
                  <div
                    key={`b-${index}`}
                    className="w-32 h-32 md:w-40 md:h-40 lg:w-[30vh] lg:h-[30vh] flex-shrink-0 rounded-full border-4 border-green-500 bg-white"
                  >
                    <Image
                      src={
                        item && item.file
                          ? item.file
                          : content?.images && content.images[index]
                          ? content.images[index]
                          : "/logo-place-holder.png"
                      }
                      alt={`Certificate duplicate ${index + 1}`}
                      width={160}
                      height={160}
                      className="w-full h-full scale-75 object-cover rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .marquee__track {
          display: flex;
          align-items: center;
          /* ensure wide content so translation is meaningful */
          width: max-content;
          animation: marquee var(--marquee-duration) linear infinite;
        }

        /* pause on hover */
        .marquee__track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
