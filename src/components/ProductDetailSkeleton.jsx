"use client";

import React from "react";

export default function ProductDetailSkeleton({ template }) {
  // template: { name, thumbnail, imagesCount, variantsCount }
  const titleWidth = template?.name
    ? Math.min(80, template.name.length * 6)
    : 200;
  const imagesCount = template?.imagesCount || 3;
  const variantsCount = template?.variantsCount || 2;

  return (
    <div className="w-full md:max-w-[90%] mx-auto p-4 bg-white">
      <div className="mb-4">
        <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 w-full md:w-1/2">
          <div className="flex gap-4 h-fit">
            <div className="flex flex-col gap-3">
              {Array.from({ length: Math.max(2, imagesCount - 1) }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 bg-gray-100 rounded animate-pulse"
                  />
                )
              )}
            </div>
            <div className="flex-1">
              <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        <div className="lg:max-w-xl w-full md:w-1/2 space-y-4">
          <div
            className="h-8 bg-gray-200 rounded"
            style={{ width: `${titleWidth}px` }}
          />
          <div className="h-4 bg-gray-100 rounded w-1/3" />

          <div className="mt-4">
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-2" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: variantsCount }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="mt-6 h-10 bg-gray-100 rounded w-full" />
          <div className="mt-2 h-10 bg-gray-100 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
