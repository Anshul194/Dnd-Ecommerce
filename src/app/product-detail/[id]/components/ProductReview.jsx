import { Star, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function ProductReview() {
  const StarRating = ({ filled, count }) => (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < filled ? "fill-green-500 text-green-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">{count}</span>
    </div>
  );

  const reviews = [
    {
      name: "Pablo Kahastoria",
      rating: 5,
      text: "The goods landed safely, arrived quickly, use instant delivery, the quality of the goods is okay and works well, the packing is safe and the delivery is fast, great, thank you.",
      likes: 10,
      dislikes: 16,
      comments: 14,
    },
    {
      name: "Thomas Chan",
      rating: 5,
      text: "The goods landed safely, arrived quickly, use instant delivery, the quality of the goods is okay and works well, the packing is safe and the delivery is fast, great, thank you.",
      likes: 21,
      dislikes: 23,
      comments: 7,
    },
    {
      name: "Samuel Drya",
      rating: 5,
      text: "The laptop package has arrived complete with charger, 2 mics, 1 headset. The laptop is really cool, good performance and sturdy, hope it lasts long. Thank you. Good luck with the sale",
      likes: 8,
      dislikes: 12,
      comments: 0,
    },
  ];

  return (
    <div className="py-10 lg:py-20 px-4">
      <div className="flex justify-between flex-col md:flex-row gap-12">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-12"> */}
        {/* Left Column */}
        <div className="max-w-2xl">
          <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0 ">
            PRODUCT REVIEW
          </h1>
          <p className="text-black relative max-w-sm poppins-medium leading-tight text-lg mb-8">
            Lorem ipsum dolor{" "}
            <span className="text font-semibold">consectetur</span> eiusmod
            tempor incididunt ut consectetur.
          </p>
        </div>

        {/* Right Column - Rating Overview */}
        <div className="flex items-start justify-between max-w-sm w-full gap-8">
          {/* Rating Circle */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center bg-white">
              <span className="text-2xl font-bold text-black">4.8</span>
            </div>
          </div>

          {/* Rating Bars */}
          <div className="flex-1 space-y-1">
            {[
              { stars: 5, percentage: 91 },
              { stars: 4, percentage: 7 },
              { stars: 3, percentage: 1.2 },
              { stars: 2, percentage: 0.5 },
              { stars: 1, percentage: 0.3 },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < item.stars
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

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white relative">
            {/* User Info */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm text-black">
                    {review.name}
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
              <Image
                src="/images/verified.png"
                alt="Verified"
                width={18}
                height={18}
                className="rounded-full opacity-90"
              />
            </div>

            {/* Review Text */}
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {review.text}
            </p>

            <div className="flex gap-2 justify-between">
              {/* Review Image */}
              <div className="bg-gray-400 rounded h-24 w-full mb-4"></div>
              <div className="bg-gray-400 rounded h-24 w-full mb-4"></div>
              <div className="bg-gray-400 rounded h-24 w-full mb-4"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{review.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="w-3 h-3" />
                <span>{review.dislikes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{review.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
