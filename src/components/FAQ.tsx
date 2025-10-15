"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { motion } from "motion/react";

const faqs = [
  {
    question: "What makes your tea organic?",
    answer:
      "All our teas are sourced from certified organic farms that follow strict guidelines. No pesticides, herbicides, or synthetic fertilizers are used in cultivation. We regularly test our products to ensure they meet organic certification standards.",
  },
  {
    question: "How should I store the tea?",
    answer:
      "Store your tea in an airtight container away from direct sunlight, moisture, and strong odors. Keep it in a cool, dry place. Properly stored tea can maintain its quality for 12-24 months.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Currently, we ship across India with free shipping on orders above ₹500. We are working on expanding our international shipping options and will update soon.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy from the date of delivery. If you're not satisfied with your purchase, you can return unopened packages for a full refund. Opened packages can be returned if there's a quality issue.",
  },
  {
    question: "How long does the tea stay fresh?",
    answer:
      "Our teas are packaged to ensure maximum freshness. When stored properly, they maintain their peak flavor for 12-18 months. We recommend consuming within 6 months of opening for the best taste experience.",
  },
  {
    question: "Do you offer bulk orders?",
    answer:
      "Yes, we offer special pricing for bulk orders. Please contact our customer service team with your requirements, and we'll be happy to provide a customized quote.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Find answers to common questions about our teas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl px-6 hover:shadow-xl transition-shadow"
                >
                  <AccordionTrigger className="hover:text-[#3C950D] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
