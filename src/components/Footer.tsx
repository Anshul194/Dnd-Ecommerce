"use client";

import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { motion } from "motion/react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#3C950D]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#3C950D]/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3C950D] to-[#2d7009] rounded-full flex items-center justify-center shadow-lg shadow-[#3C950D]/30">
                <span className="text-xl">🍃</span>
              </div>
              <span className="text-[#3C950D] text-xl tracking-tight">
                TeaHaven
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Your trusted source for premium organic teas from the finest
              gardens of India.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-[#3C950D] hover:to-[#2d7009] rounded-full flex items-center justify-center transition-all shadow-lg"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="mb-6 bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {["About Us", "Shop", "Blog", "Wholesale", "Track Order"].map(
                (link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#3C950D] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-[#3C950D] group-hover:w-2 transition-all" />
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="mb-6 bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
              Customer Service
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                "Contact Us",
                "Shipping Policy",
                "Returns & Exchanges",
                "Privacy Policy",
                "Terms & Conditions",
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#3C950D] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-[#3C950D] group-hover:w-2 transition-all" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="mb-6 bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get special offers and updates
            </p>
            <div className="flex gap-2 mb-6">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 backdrop-blur-sm"
              />
              <Button className="bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] shadow-lg">
                Subscribe
              </Button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { Icon: Phone, text: "+91 1234567890" },
                { Icon: Mail, text: "info@teahaven.com" },
                { Icon: MapPin, text: "Guwahati, Assam, India" },
              ].map(({ Icon, text }, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-400 hover:text-[#3C950D] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400"
        >
          <p>
            &copy; 2025 TeaHaven. All rights reserved. Made with 💚 for tea
            lovers.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
