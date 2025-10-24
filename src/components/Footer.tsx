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
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { fetchPages } from "@/app/store/slices/pagesSlice";
import { useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const { list } = useSelector((state: any) => state.pages);
  const dispatch = useDispatch();

  console.log("footer page links =======>", list);

  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);
  // Order the top-level page groups so important sections appear first.
  // We normalize using either `mainTitle` (if present) or `_id` and replace hyphens.
  const orderedTitles = [
    "quick links",
    "about us",
    "client care",
    "contact us",
  ];

  const normalizeTitle = (item: any) =>
    (item?.mainTitle ?? item?._id ?? "")
      .replace(/-/g, " ")
      .toString()
      .toLowerCase()
      .trim();

  const sortedList = Array.isArray(list)
    ? [...list].sort((a: any, b: any) => {
        const aT = normalizeTitle(a);
        const bT = normalizeTitle(b);
        const ai = orderedTitles.indexOf(aT);
        const bi = orderedTitles.indexOf(bT);

        // If either is in the preferred order, use that ordering
        if (ai !== -1 || bi !== -1) {
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        }

        // Fallback: alphabetical by normalized title
        return aT.localeCompare(bT);
      })
    : [];
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
              <div className="w-12 h-12 rounded-full flex items-center justify-center ">
                <Image
                  src="/logo.webp"
                  alt="TeaHaven Logo"
                  width={30}
                  height={30}
                  className="object-contain h-full w-full"
                />
              </div>
              <span className="text-[#3C950D] capitalize text-xl tracking-tight">
                bharat gram udyogsangh
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
          {sortedList.map((item: any, index: number) => {
            if (
              item.mainTitle?.includes("contact") ||
              item._id?.includes("contact")
            )
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="mb-6 capitalize bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
                    {(item?.mainTitle ?? item?._id ?? "")
                      .toString()
                      .replace(/-/g, " ")}
                  </h3>

                  <div>
                    <div className="space-y-3 text-sm">
                      {item.pages.map((page: any) => (
                        <div key={page._id} className="space-y-3 text-sm flex flex-col  ">
                          <p
                            dangerouslySetInnerHTML={{
                              __html: page.contactData?.appointmentNote ?? "",
                            }}
                            className="text-gray-400 text-sm"
                          ></p>
                          <a
                            href={`mailto:${page.contactData?.email}`}
                            className="text-gray-400 text-sm"
                          >
                            {page.contactData?.email}
                          </a>
                          <a
                            href={`tel:${page.contactData?.phone}`}
                            className="text-gray-400 text-sm"
                          >
                            {page.contactData?.phone}
                          </a>
                          <Link
                            className="text-gray-400 hover:text-[#3C950D] transition-colors flex items-center gap-2 group"
                            href={`contact`}
                          >
                            contact us
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="mb-6 capitalize bg-gradient-to-r from-[#3C950D] to-[#2d7009] bg-clip-text text-transparent">
                  {(item?.mainTitle ?? item?._id ?? "")
                    .toString()
                    .replace(/-/g, " ")}
                </h3>
                <ul className="space-y-3 text-sm">
                  {Array.isArray(item.pages) &&
                    item.pages.map((page: any, pageIndex: number) => (
                      <li key={pageIndex}>
                        <a
                          href={
                            page?.redirectBySlug
                              ? `/${page.slug}`
                              : `/pages/${page._id}`
                          }
                          className="text-gray-400 hover:text-[#3C950D] transition-colors flex items-center gap-2 group"
                        >
                          <span className="w-0 h-0.5 bg-[#3C950D] capitalize group-hover:w-2 transition-all" />
                          {page.title}
                        </a>
                      </li>
                    ))}
                </ul>
              </motion.div>
            );
          })}

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
            {/* <div className="space-y-3 text-sm">
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
            </div> */}
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
