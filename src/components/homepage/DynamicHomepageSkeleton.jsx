"use client";

import React from "react";

const DynamicHomepageSkeleton = () => {
  return (
    <main>
      {/* Hero skeleton */}
      <div className="w-full bg-gray-100 animate-pulse h-[420px] md:h-[520px]" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Categories skeleton */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-36 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mt-2" />
            </div>
          ))}
        </div>

        {/* Repeated section skeletons */}
        {Array.from({ length: 3 }).map((_, idx) => (
          <section key={idx} className="mt-12">
            <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((__, j) => (
                <div
                  key={j}
                  className="h-44 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default DynamicHomepageSkeleton;
