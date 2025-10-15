"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { motion } from "motion/react";

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    rating: 5,
    review:
      "Absolutely love the Assam tea! The flavor is rich and authentic. Best quality tea I've ever purchased online.",
    initials: "PS",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    rating: 5,
    review:
      "Fast delivery and excellent packaging. The green tea from Mizoram is so fresh and aromatic. Highly recommended!",
    initials: "RK",
  },
  {
    id: 3,
    name: "Anjali Patel",
    rating: 4,
    review:
      "Great collection of teas. The customer service is responsive and helpful. Will definitely order again!",
    initials: "AP",
  },
  {
    id: 4,
    name: "Vikram Singh",
    rating: 5,
    review:
      "The premium quality is evident in every sip. Love that they source from organic farms. Worth every rupee!",
    initials: "VS",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Reviews() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#3C950D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#3C950D]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <p className="text-gray-600">
            Join thousands of satisfied tea lovers
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {reviews.map((review) => (
            <motion.div key={review.id} variants={itemVariants}>
              <Card className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg h-full group bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="bg-gradient-to-br from-[#3C950D] to-[#2d7009] text-white w-12 h-12 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-[#3C950D] to-[#2d7009] text-white">
                        {review.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="group-hover:text-[#3C950D] transition-colors">
                        {review.name}
                      </h4>
                      <div className="flex gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic">
                    {"\u201C" + review.review + "\u201D"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
