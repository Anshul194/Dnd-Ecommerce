"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DynamicUniqueSellingPoints = ({ content }) => {
  const { title, description, cta, cards, image } = content;
  console.log("DynamicUniqueSellingPoints content:", content);

  return (
    <div className="min-h-screen bg-white py-10 lg:py-20 px-4">
      {/* Bottom Section */}
      <div className="flex items-start flex-col-reverse md:flex-row gap-8">
        {/* Left content */}
        <div className="flex-1 w-full lg:w-1/2 sm:sticky top-24">
          <h2 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black !font-bebas mb-4 md:mb-0">
            {title || "UNIQUE SELLING POINTS"}
          </h2>
          <p className="text-black relative poppins-medium leading-tight text-lg ml-auto mb-8 max-w-xl">
            {description || "gchj"}
          </p>
          {cta ? (
            <Link href={cta.link || "/about"}>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                {cta.title}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </Link>
          ) : (
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-sm font-medium flex items-center gap-2 transition-colors">
              Learn More
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Right cards - dynamic rendering */}
        <div className="flex-1 h-full w-full md:w-1/2 flex flex-col gap-6">
          {cards && cards.length > 0 ? (
            cards.map((card, idx) => (
              <div
                key={idx}
                className={`aspect-5/4 w-full rounded-lg mb-4 overflow-hidden ${
                  idx % 2 === 0
                    ? "bg-gray-400 p-8 flex flex-col text-gray-800"
                    : "bg-gray-800 p-8 flex flex-col text-gray-400"
                }`}
              >
                <>
                  <div className=" text-xs font-medium mb-2 tracking-wider">
                    {card.tag || "LOREM IPSUM"}
                  </div>
                  <div className="text-green-400 text-2xl font-bold mb-4 leading-tight">
                    {card.title ? card.title.toUpperCase() : "LOREM IPSUM"}
                    {card.subtitle && (
                      <>
                        <br />
                        {card.subtitle.toUpperCase()}
                      </>
                    )}
                  </div>
                  <p className=" text-md leading-relaxed">
                    {card.description ||
                      "Lorem Ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolor magna aliqua. Ut enim"}
                  </p>
                </>
              </div>
            ))
          ) : (
            <div className="aspect-5/4 w-full h-full bg-gray-400 rounded-lg mb-4 overflow-hidden">
              {/* fallback card */}
              <div className="text-gray-400 text-xs font-medium mb-2 tracking-wider">
                LOREM IPSUM
              </div>
              <div className="text-green-400 text-2xl font-bold mb-4 leading-tight">
                LOREM IPSUM
                <br />
                DOLOR
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Lorem Ipsum dolor sit amet consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolor magna aliqua. Ut
                enim
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicUniqueSellingPoints;
