"use client";

import Image from "next/image";
import React from "react";

const DynamicWhyUs = ({ content }) => {
  const { title, description, points } = content;
  console.log("DynamicWhyUs content:", content);

  return (
    <div className="min-h-screen bg-white py-10 lg:py-20 px-4">
      {/* Top Section - Why Us */}
      <div className="flex items-start flex-col md:flex-row gap-8 mb-16">
        {/* Left gray rectangle */}
        <div className="aspect-5/4 max-w-[400px] w-full lg:w-1/3 bg-gray-400 rounded-lg flex-shrink-0">
          <Image
            src={content.image || "/images/why-us-placeholder.jpg"} // Placeholder image path
            alt="Why Us"
            width={400}
            height={400}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Right content */}
        <div className="">
          <h1 className="text-[50px] md:text-[100px] lg:text-[130px] text-black !font-bebas -mt-[2vh] md:-mt-[4vh] lg:-mt-10">
            {title || "WHY US?"}
          </h1>

          <p className="text-black text-sm leading-relaxed mb-8 max-w-full">
            {description || "Loading description..."}
          </p>

          {/* Two column list */}
          {points && points.length > 0 && (
            <div className="flex gap-16">
              {points.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-600 text-sm">{point}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
    </div>
  );
};

export default DynamicWhyUs;
