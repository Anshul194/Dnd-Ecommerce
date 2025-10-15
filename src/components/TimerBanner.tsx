"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { motion } from "motion/react";

export function TimerBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 30,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1589009649715-641c60b982ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwdGVhJTIwc2V0fGVufDF8fHx8MTc2MDQyMTExN3ww&ixlib=rb-4.1.0&q=80&w=1080)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-[#3C950D] to-[#2d7009] rounded-full text-sm tracking-wider uppercase shadow-lg"
          >
            Limited Time Only
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl mb-4 drop-shadow-lg">
            Limited Time Offer!
          </h2>
          <p className="text-lg md:text-2xl mb-10 text-white/90">
            Get 50% off on our premium tea collection
          </p>

          <div className="flex justify-center gap-4 mb-10">
            {Object.entries(timeLeft).map(([unit, value], index) => (
              <motion.div
                key={unit}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 min-w-[100px] border border-white/20 shadow-2xl"
              >
                <div className="text-4xl md:text-5xl mb-2 bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">
                  {String(value).padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm uppercase tracking-wider text-white/70">
                  {unit}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button className="bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] text-white px-8 py-6 text-lg shadow-2xl hover:shadow-[#3C950D]/50 transition-all hover:scale-105">
              Shop the Sale
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
