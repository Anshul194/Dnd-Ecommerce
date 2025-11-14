"use client";
import { useState, useEffect, use } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/router";
import Link from "next/link";

export function HeroSlider({ content }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % content.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % content.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + content.length) % content.length);
  };

  return (
    <div className="relative  h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${content[currentSlide].content.image})`,
            }}
          >
            <div className=" h-full bg-gradient-to-b from-black/50 via-black/40 to-black/60 flex items-center justify-center">
              <div className="container  max-w-7xl mx-auto px-4 text-center text-white">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl md:text-6xl lg:text-7xl mb-6 drop-shadow-2xl"
                >
                  {content[currentSlide].content.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-lg md:text-xl lg:text-2xl mb-10 text-white/90 drop-shadow-lg"
                >
                  {content[currentSlide].content.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Link
                    href={
                      content?.[currentSlide]?.content?.cta?.link?.includes(
                        "about"
                      )
                        ? "/pages/68fb0ce58b4cf00083b826d2"
                        : "/search"
                    }
                  >
                    <Button className="bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] px-8 py-6 text-lg shadow-2xl hover:shadow-[#3C950D]/50 hover:scale-105 transition-all">
                      {content?.[currentSlide]?.content?.cta?.title ||
                        "Shop Now"}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full transition-all hover:scale-110 shadow-xl"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full transition-all hover:scale-110 shadow-xl"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {content.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-10 shadow-lg"
                : "bg-white/50 w-2 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
