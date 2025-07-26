"use client";
import React from 'react';

export default function WhyUs() {
  return (
    <div className="min-h-screen bg-white py-10 lg:py-20 px-4">
      {/* Top Section - Why Us */}
      <div className="flex items-start flex-col md:flex-row gap-8 mb-16">
        {/* Left gray rectangle */}
        <div className="aspect-5/4 max-w-[400px] w-full lg:w-1/3 bg-gray-400 rounded-lg flex-shrink-0"></div>
        
        {/* Right content */}
        <div className="">
          <h1 className="text-[50px] md:text-[100px] lg:text-[130px] text-black bebas -mt-[2vh] md:-mt-[4vh] lg:-mt-10  ">
            WHY US?
          </h1>
          
          <p className="text-black poppins text-sm leading-relaxed mb-8 max-w-full">
            Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
            tempor incididunt ut labore et dolor magna aliqua. Lorem Ipsum dolor sit 
            amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
            labore et dolor magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation
          </p>
          
          {/* Two column list */}
          <div className="flex gap-16">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600 text-sm">Lorem Ipsum dolor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600 text-sm">Lorem Ipsum dolor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-start flex-col-reverse md:flex-row gap-8">
        {/* Left content */}
        <div className="flex-1 w-full lg:w-1/2 sm:sticky top-24">
          <h2 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0 ">
            WHAT MAKES<br />US UNIQUE.
          </h2>
          
          <p className="text-black relative poppins-medium leading-tight text-lg ml-auto mb-8 max-w-xl">
            Lorem Ipsum dolor sit amet, consectetur 
            adipiscing elit, sed do eiusmod tempor incididunt 
            ut labore et dolor magna aliqua. Lorem Ipsum dolor 
            sit amet, consectetur.
          </p>
          
          <button className="bg hover:bg-green-700 text-white px-6 py-3 rounded text-sm font-medium flex items-center gap-2 transition-colors">
            Learn More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Right cards */}
        <div className=" flex-1 h-full w-full md:w-1/2 flex-col lg:!flex-row gap-6">
          {/* Gray card */}
          <div className="aspect-5/4 w-full h-full  bg-gray-400 rounded-lg mb-4"></div>
          
          {/* Dark card */}
          <div className="aspect-5/4 w-full  bg-gray-800 rounded-lg p-8 flex flex-col ">
            <div className="text-gray-400 text-xs font-medium mb-2 tracking-wider">
              LOREM IPSUM
            </div>
            <div className="text-green-400 text-2xl font-bold mb-4 leading-tight">
              LOREM IPSUM<br />DOLOR
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Lorem Ipsum dolor sit amet consectetur adipiscing 
              elit, sed do eiusmod tempor incididunt ut labore et 
              dolor magna aliqua. Ut enim
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}