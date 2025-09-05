import React from "react";

function Variant1({ descriptionData }) {
  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };
  return (
    <div className="py-10 lg:py-20 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex flex-col space-y-6 flex-1">
          {/* Description Text */}
          <div className="sticky top-10">
            <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4">
              DESCRIPTION
            </h1>
            <div
              className="text-black relative poppins-medium leading-tight text-lg ml-auto mb-8"
              dangerouslySetInnerHTML={{ __html: descriptionData?.description }}
            />

            {/* Large Square Image */}
            <div className=" rounded-lg w-full h-[350px] max-h-[400px] overflow-hidden">
              {console.log(
                "Description Image:",
                descriptionData?.descriptionVideo
              )}
              {descriptionData?.descriptionVideo && (
                <div className="rounded-lg w-full h-[350px] max-h-[400px] overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractVideoId(
                      descriptionData.descriptionVideo
                    )}`}
                    allowFullScreen
                    className="w-full h-full object-cover rounded-lg"
                    style={{ border: 0 }}
                    title="Description Video"
                    onError={(e) => console.error("Iframe error:", e)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col flex-1 gap-4">
          {/* Top Row - Two Small Squares */}
          <div
            className=" rounded-lg flex-1 aspect-square"
            style={{
              backgroundImage: `url(${descriptionData?.descriptionImages?.[0]?.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-4 flex-1">
              {descriptionData?.descriptionImages
                ?.slice(1)
                ?.map((image, index) => (
                  <div
                    key={index}
                    className="bg-gray-400 rounded-lg flex-1 aspect-square"
                    style={{
                      backgroundImage: `url(${image.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Variant1;
