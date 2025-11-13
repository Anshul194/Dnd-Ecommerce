"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const DynamicWhyUs = ({ content }) => {
  const { title, description, points } = content;
  console.log("DynamicWhyUs content:", content);

  return (
    <div className="min-h-screen bg-white py-10 lg:py-20 px-4">
      {/* Top Section - Why Us */}
      <div className="flex items-start flex-col gap-8 mb-16">
        {/* Left gray rectangle */}

        {/* Right content */}
        <div className="">
          <h1 className="text-[50px] md:text-[100px] lg:text-[130px] text-black !font-bebas -mt-[2vh] md:-mt-[4vh] lg:-mt-10">
            {title || "WHY US?"}
          </h1>

          <div className="mt-10 flex flex-col lg:flex-row gap-10 lg:gap-20">
            <div className=" w-1/2 max-sm:w-full  bg-gray-400 rounded-lg flex-shrink-0">
              <Image
                src={content.image || "/images/why-us-placeholder.jpg"} // Placeholder image path
                alt="Why Us"
                width={400}
                height={400}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <p className="text-black text-sm leading-relaxed mb-8 max-w-full">
                {description || "Loading description..."}
              </p>

              {/* Two column list */}
              {points && points.length > 0 && (
                <div className="flex gap-16 mb-6">
                  {points.map((point, index) => (
                    <div key={index} className="flex items-center gap-2 ">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-600 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              <Link
                className="w-fit text-sm underline font-medium hover:text-green-600 text-green-500"
                href={content?.cta?.link || "/pages/68fb0ce58b4cf00083b826d2"}
              >
                {content?.cta?.title || "View More"}{" "}
                <ArrowRight size={16} className="inline-block ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
    </div>
  );
};

export default DynamicWhyUs;
