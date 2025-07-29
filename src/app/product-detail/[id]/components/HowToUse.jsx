import React, { useRef, useEffect, useState } from "react";

const HowToUse = ({ data }) => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    const currentSectionRef = sectionRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);

        if (entry.isIntersecting && currentVideoRef) {
          currentVideoRef.play().catch(console.error);
        } else if (currentVideoRef) {
          currentVideoRef.pause();
        }
      },
      {
        threshold: 0.5, // Video will play when 50% visible
        rootMargin: "0px",
      }
    );

    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  const steps = [
    {
      number: "01",
      title: "Get Started",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
    },
    {
      number: "02",
      title: "Configure Settings",
      description:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    },
    {
      number: "03",
      title: "Launch & Monitor",
      description:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
      number: "04",
      title: "Optimize Results",
      description:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-white py-10 lg:py-20 px-4"
    >
      <div className="max-w-full mx-auto">
        {/* Heading with style matching the image */}
        <div className="text-start mb-16">
          <h2 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0 ">
            HOW TO USE
          </h2>
          <p className="text-black max-w-xl relative poppins-medium leading-tight text-lg mb-8">
            Lorem ipsum dolor sit amet,{" "}
            <span className="text font-semibold">consectetur</span> eiusmod
            tempor incididunt ut labore et dolor magna aliquaLorem ipsum dolor
            sit amet, consectetur.
          </p>
        </div>

        {/* Video and Steps Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Video Container */}
          <div className="relative h-full">
            <div className="aspect-video sticky top-10 bg-gray-900/5 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={data?.howToUseVideo}
                allowFullScreen
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Steps Container */}
          <div className="space-y-8">
            {data?.howToUseSteps?.map((step, index) => (
              <div key={index} className="flex gap-6 group">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bebas bg text-white rounded-full flex items-center justify-center font-black text-lg group-hover:bg-gray-800 transition-colors duration-300">
                    {index + 1 < step.number ? step.number : `0${index + 1}`}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold poppins text-black mb-2 group-hover:text-gray-700 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <div
                    className="text-gray-600 poppins text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: step.description }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToUse;
