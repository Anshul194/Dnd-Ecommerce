"use client";

import { selectSelectedProduct } from "@/app/store/slices/productSlice";
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const Base_url = process.env.NEXT_PUBLIC_BASE_URL;

export default function RenderCardsVariant() {
  const productData = useSelector(selectSelectedProduct);
  // measure wrapper width
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () =>
      setWidth(Math.round(el.getBoundingClientRect().width));
    measure();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      window.addEventListener("resize", measure);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", measure);
    };
  }, []);

  // optional: compute a title size based on measured width (adjust clamping as needed)
  const computedTitleSize = Math.min(
    130,
    Math.max(40, Math.round(width * 0.01))
  );
  const titleStyle: React.CSSProperties = {
    fontSize: `${computedTitleSize}px`,
    lineHeight: 1,
  };

  // apply mobile layout when component width is less than 540px
  const isMobileWidth = width < 540;

  return (
    // attach ref to the main wrapper so we measure the actual component width
    <div ref={wrapperRef} className="py-10 lg:py-20 px-4">
      {/* badge showing measured width */}
      <div className="absolute top-4 right-4 z-50">
        <span className="bg-black/70 text-white text-xs rounded px-2 py-1">
          {width}px
        </span>
      </div>

      {/* top layout: force column on narrow component */}
      <div
        className={
          isMobileWidth
            ? "flex flex-col gap-8"
            : "flex justify-between flex-col md:flex-row gap-12"
        }
      >
        {/* Left Column */}
        <div className={isMobileWidth ? "w-full" : "max-w-2xl"}>
          <h1
            className="text-4xl md:text-5xl text-black bebas mb-4 md:mb-0"
            style={titleStyle}
          >
            PRODUCT REVIEW
          </h1>
          <p className="text-black relative max-w-sm poppins-medium leading-tight text-lg mb-8">
            Lorem ipsum dolor{" "}
            <span className="text font-semibold">consectetur</span> eiusmod
            tempor incididunt ut consectetur.
          </p>
        </div>

        {/* Right Column - Rating Overview */}
        <div
          className={
            isMobileWidth
              ? "flex flex-col items-start gap-6 w-full"
              : "flex items-start justify-between max-w-sm w-full gap-8"
          }
        >
          {/* Rating Circle */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center bg-white">
              <span className="text-2xl font-bold text-black">
                {productData?.reviews?.Average?.toFixed(1) || 0}
              </span>
            </div>
          </div>

          {/* Rating Bars */}
          <div className="flex-1 space-y-1">
            {productData?.reviews?.ratingBreakdown?.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < item.rating
                          ? "fill-green-500 text-green-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Cards: force 1 column if component is narrow */}
      <div
        className="grid gap-6 mt-12"
        style={{
          gridTemplateColumns: isMobileWidth ? "1fr" : "repeat(3, 1fr)",
        }}
      >
        {productData &&
          productData.reviews?.Reviews.map((review, index) => (
            <div key={index} className="bg-white relative">
              {/* User Info */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm text-black">
                      {review?.userId?.name}
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-orange-400 text-orange-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <img
                  src="/images/verified.webp"
                  alt="Verified"
                  width={18}
                  height={18}
                  className="rounded-full opacity-90"
                />
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {review?.comment}
              </p>

              <div className="flex gap-2 justify-between">
                {/* Review Image */}
                {review?.images?.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((image, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-400 rounded h-24 w-24 mb-4"
                      >
                        <img
                          src={
                            Base_url +
                            (image.startsWith("/") ? image : `/${image}`)
                          }
                          alt={`Review Image ${idx + 1}`}
                          width={100}
                          height={100}
                          className="rounded h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{review?.likeCount}</span>
                </div>
                {/* <div className="flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" />
                  <span>{review.dislikes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{review.comments}</span>
                </div> */}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
