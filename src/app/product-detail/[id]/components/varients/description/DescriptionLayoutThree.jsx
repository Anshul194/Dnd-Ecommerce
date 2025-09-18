export default function NewDescriptionLayout({ data }) {
  console.log("DescriptionLayout data:", data.name);
  const extractVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  // Static data with real images and video
  const staticData = {
    descriptionVideo:
      data?.descriptionVideo || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",

    descriptionImages: data?.descriptionImages,
  };

  const displayData = data || staticData;

  return (
    <div className="py-10 lg:py-10 ">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-10 md:mb-16 text-center">
          DESCRIPTION
        </h1>
        {/* Hero Video Section */}
        <div className="mb-16">
          <div className="relative sm:h-auto">
            <div className="bg-white rounded-lg lg:rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <div className="!h-[182px] sm:!h-auto md:aspect-[21/9]">
                {displayData?.descriptionVideo && (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractVideoId(
                      displayData.descriptionVideo
                    )}`}
                    allowFullScreen
                    className="w-full h-full"
                    style={{ border: 0 }}
                    title="Main Video"
                    onError={(e) => console.error("Iframe error:", e)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Masonry Style Image Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Large Image - Spans 2 columns */}
          <div className="col-span-2 row-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div
                className="aspect-square bg-gray-200"
                style={{
                  backgroundImage: `url(${displayData?.descriptionImages?.[0]?.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          </div>

          {/* Small Images */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div
              className="aspect-square bg-gray-200"
              style={{
                backgroundImage: `url(${displayData?.descriptionImages?.[1]?.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div
              className="aspect-square bg-gray-200"
              style={{
                backgroundImage: `url(${displayData?.descriptionImages?.[2]?.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div
              className="aspect-square bg-gray-200"
              style={{
                backgroundImage: `url(${displayData?.descriptionImages?.[3]?.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div
              className="aspect-square bg-gray-200"
              style={{
                backgroundImage: `url(${displayData?.descriptionImages?.[4]?.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
