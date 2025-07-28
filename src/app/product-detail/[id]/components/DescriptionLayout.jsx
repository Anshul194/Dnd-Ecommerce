export default function DescriptionLayout() {
  return (
    <div className="py-10 lg:py-20 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex flex-col space-y-6 flex-1">
          {/* Description Text */}
          <div className="sticky top-10">
            <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0">
              DESCRIPTION
            </h1>
            <p className="text-black relative poppins-medium leading-tight text-lg ml-auto mb-8">
              Lorem ipsum dolor sit amet, <span className="text font-semibold">consectetur</span> eiusmod
              tempor incididunt ut labore et dolor magna aliquaLorem
              ipsum dolor sit amet, consectetur.
            </p>
            {/* Large Square Image */}
            <div className="bg-gray-400 rounded-lg w-full h-[350px] max-h-[400px] overflow-hidden"></div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col flex-1 gap-4">
          {/* Top Row - Two Small Squares */}
          <div className="bg-gray-400 rounded-lg flex-1 aspect-square"></div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-4 flex-1">
              <div className="bg-gray-400 rounded-lg aspect-square"></div>
              <div className="bg-gray-400 rounded-lg aspect-square"></div>
              {/* Bottom Row - One Large Rectangle */}
              <div className="bg-gray-400 rounded-lg aspect-square w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}