"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Instagram,
  Facebook,
  Youtube,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/store/slices/categorySlice";
import axiosInstance from "@/axiosConfig/axiosInstance";
import { set } from "mongoose";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showJewelleryDropdown, setShowJewelleryDropdown] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [showWeddingDropdown, setShowWeddingDropdown] = useState(false);
  const [showEngagementDropdown, setShowEngagementDropdown] = useState(false);
  const [openMenuData, setOpenMenuData] = useState(null);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: categories } = useSelector((state) => state.category);
  const [attributesData, setAttributesData] = useState({});
  const [fineJewellerSubCategories, setFineJewellerSubCategories] = useState(
    []
  );
  const dispatch = useDispatch();

  const navItems = [
    { name: "READY-TO-SHIP", href: "/ready-to-ship" },
    ...(categories && categories.length > 0
      ? [...categories].reverse().map((category) => ({
          name: category.name.toUpperCase(),
          href: `/${category.slug}`,
          hasDropdown: true,
        }))
      : []),
  ];

  const getAttribute = async () => {
    try {
      const data = await axiosInstance.get(
        "/api/navbar-categories-with-attributes"
      );
      let datas = {};
      data.data.body.data.map((item) => {
        const att = {};
        item.attributes.map((attr) => {
          att[attr.title] = attr.terms;
        });
        datas[item.name] = att;
      });
      setAttributesData(datas);

      const res = await axiosInstance.get(
        `api/category/subcategory?categoryId=6854fd3b5e53f236d75c07c1`
      );
      setFineJewellerSubCategories(res.data.data);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, []);
  useEffect(() => {
    if (categories && categories.length > 0) {
      getAttribute();
    }
  }, [categories]);

  const rightNavItems = [
    // { name: "EDUCATION", href: "/education" },
    { name: "CONTACT", href: "/contact", hasDropdown: true },
    { name: "VISIT", href: "/visit" },
    {
      name: "MEET WITH US",
      href: "/meet",
    },
  ];

  const jewelleryCategories = [
    {
      title: "JEWELLERY",
      items: [
        { name: "Rings", href: "/rings" },
        { name: "Earrings", href: "/products/earrings" },
        { name: "Bracelets", href: "/products/bracelets" },
        { name: "Chains", href: "/products/chains" },
        { name: "Pendants", href: "/products/pendants" },
      ],
    },
    {
      title: "STATEMENT RINGS",
      items: [],
      image: "/api/placeholder/400/200",
    },
    {
      title: "STACKER RINGS",
      items: [],
      image: "/api/placeholder/400/200",
    },
    {
      title: "MINIMAL RINGS",
      items: [],
      image: "/api/placeholder/400/200",
    },
    {
      title: "INITIAL SIGNET RING",
      items: [],
      image: "/api/placeholder/400/200",
    },
  ];

  // Mobile accordion categories
  const mobileAccordionItems = [
    {
      title: "ENGAGEMENT RINGS",
      subcategories: [
        {
          name: "BUILD A RING",
          items: [
            { name: "Browse Settings", href: "/engagement-rings/build-rings" },
            {
              name: "Ready-to-Ship Rings",
              href: "/engagement-rings/build-rings",
            },
            {
              name: "Custom-Made Rings",
              href: "/engagement-rings/build-rings",
            },
          ],
        },
        {
          name: "SHOP BY METAL",
          items: [
            { name: "Platinum", href: "/engagement-rings/build-rings" },
            { name: "Yellow Gold", href: "/engagement-rings/build-rings" },
            { name: "Rose Gold", href: "/engagement-rings/build-rings" },
            { name: "White Gold", href: "/engagement-rings/build-rings" },
          ],
        },
        {
          name: "SHOP BY STYLE",
          items: [
            { name: "Solitaire", href: "/engagement-rings/build-rings" },
            { name: "Trilogy", href: "/engagement-rings/build-rings" },
            { name: "Halo", href: "/engagement-rings/build-rings" },
            { name: "Toi et Moi", href: "/engagement-rings/build-rings" },
            { name: "Bezel", href: "/engagement-rings/build-rings" },
            { name: "East West", href: "/engagement-rings/build-rings" },
          ],
        },
        {
          name: "ENGAGEMENT RING GUIDANCE",
          items: [
            { name: "Design Basics", href: "/engagement-rings/build-rings" },
            {
              name: "Engagement Ring Guide",
              href: "/engagement-rings/build-rings",
            },
            {
              name: "Find Your Ring Size",
              href: "/engagement-rings/build-rings",
            },
            {
              name: "Precious Metals Guide",
              href: "/engagement-rings/build-rings",
            },
            {
              name: "Our Crafting Process",
              href: "/engagement-rings/build-rings",
            },
            { name: "Ring Care Guide", href: "/engagement-rings/build-rings" },
          ],
        },
      ],
    },
    {
      title: "WEDDING RINGS",
      subcategories: [
        {
          name: "WOMEN",
          items: [
            { name: "All Women's Wedding Rings", href: "/wedding-rings/women" },
            { name: "Pavé Wedding Rings", href: "/wedding-rings/women" },
            { name: "Curved Wedding Rings", href: "/wedding-rings/women" },
            { name: "Accent Wedding Rings", href: "/wedding-rings/women" },
          ],
        },
        {
          name: "WOMEN'S BY METAL",
          items: [
            { name: "Platinum", href: "/wedding-rings/women" },
            { name: "18k Yellow Gold", href: "/wedding-rings/women" },
            { name: "18k Rose Gold", href: "/wedding-rings/women" },
            { name: "18k White Gold", href: "/wedding-rings/women" },
          ],
        },
        {
          name: "MEN",
          items: [
            { name: "All Men's Wedding Rings", href: "/wedding-rings/women" },
            { name: "Classic Wedding Rings", href: "/wedding-rings/women" },
            {
              name: "Multi-Colour Wedding Rings",
              href: "/wedding-rings/women",
            },
            { name: "Unique Wedding Rings", href: "/wedding-rings/women" },
          ],
        },
        {
          name: "MEN'S BY METAL",
          items: [
            { name: "Platinum", href: "/wedding-rings/women" },
            { name: "Yellow Gold", href: "/wedding-rings/women" },
            { name: "Rose Gold", href: "/wedding-rings/women" },
            { name: "White Gold", href: "/wedding-rings/women" },
            { name: "Titanium", href: "/wedding-rings/women" },
            { name: "Tantalum", href: "/wedding-rings/women" },
            { name: "Carbon Fibre", href: "/wedding-rings/women" },
          ],
        },
        {
          name: "WEDDING RING GUIDANCE",
          items: [
            { name: "Wedding Ring Guide", href: "/wedding-rings/women" },
            { name: "Design Basics", href: "/wedding-rings/women" },
            { name: "Find Your Ring Size", href: "/wedding-rings/women" },
            { name: "Precious Metals Guide", href: "/wedding-rings/women" },
            { name: "Our Crafting Process", href: "/wedding-rings/women" },
          ],
        },
      ],
    },
    {
      title: "FINE JEWELLERY",
      subcategories: [
        {
          name: "JEWELLERY",
          items: [
            { name: "Rings", href: "/wedding-rings/women" },
            { name: "Earrings", href: "/wedding-rings/women" },
            { name: "Bracelets", href: "/wedding-rings/women" },
            { name: "Chains", href: "/wedding-rings/women" },
            { name: "Pendants", href: "/wedding-rings/women" },
          ],
        },
        { name: "STATEMENT RINGS", href: "/wedding-rings/women" },
        { name: "STACKER RINGS", href: "/wedding-rings/women" },
        { name: "MINIMAL RINGS", href: "/wedding-rings/women" },
        { name: "INITIAL SIGNET RING", href: "/wedding-rings/women" },
      ],
    },
  ];

  const toggleAccordion = (index) => {
    setExpandedAccordion(expandedAccordion === index ? null : index);
  };

  const handelProfileClick = async () => {
    if (isAuthenticated) {
      window.location.href = "/my-orders";
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 w-full xl:h-32 bg-[#FEFAF5] z-40">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 xl:h-32">
            {/* Mobile Menu Button - Left side on mobile */}
            <div className="xl:hidden w-12 flex justify-start">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Left Navigation Items - Desktop only */}
            <div className="hidden xl:flex xl:w-[40%] items-center justify-between">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative font-cullen"
                  onMouseEnter={() => {
                    if (item.hasDropdown) {
                      if (item.name === "FINE JEWELLERY") {
                        setShowJewelleryDropdown(true);
                        setOpenMenuData(attributesData[item.name] || {});
                      } else if (item.name === "WEDDING RINGS") {
                        setShowWeddingDropdown(true);
                        setOpenMenuData(attributesData[item.name] || {});
                      } else if (item.name === "ENGAGEMENT RINGS") {
                        setShowEngagementDropdown(true);
                        setOpenMenuData(attributesData[item.name] || {});
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.hasDropdown) {
                      if (item.name === "FINE JEWELLERY") {
                        setShowJewelleryDropdown(false);
                        // setOpenMenuData(null);
                      } else if (item.name === "WEDDING RINGS") {
                        setShowWeddingDropdown(false);
                        // setOpenMenuData(null);
                      } else if (item.name === "ENGAGEMENT RINGS") {
                        setShowEngagementDropdown(false);
                        // setOpenMenuData(null);
                      }
                    }
                  }}
                >
                  <a
                    href={
                      item.name === "FINE JEWELLERY"
                        ? "/fine-jewellery-807?finejewellery=6874b552f2ed2bebef46ccec"
                        : item.href
                    }
                    className="text-gray-800 hover:text-[#236339] text-[10px] font-semibold font-gintoNord tracking-wide transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </div>
              ))}
            </div>

            {/* Logo - Centered on mobile, normal position on desktop */}
            <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2 xl:transform-none">
              <a
                href="/"
                className="text-xl md:text-3xl lg:text-4xl font-semibold tracking-[0.2em] text-gray-900"
              >
                CULLEN
              </a>
            </div>

            {/* Right side - Desktop: Navigation + Icons, Mobile: Shopping bag only */}
            <div className="flex xl:w-[40%] w-fit items-center gap-6">
              {/* Desktop Navigation */}
              <div className="hidden xl:flex items-center space-x-8 w-full justify-between">
                {rightNavItems.map((item) => (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => {
                      if (item.hasDropdown && item.name === "CONTACT") {
                        setShowContactDropdown(true);
                      }
                    }}
                    onMouseLeave={() => {
                      if (item.hasDropdown && item.name === "CONTACT") {
                        setShowContactDropdown(false);
                      }
                    }}
                  >
                    <Link
                      href={item.href}
                      className="text-gray-800 hover:text-[#236339] text-[10px] font-semibold font-gintoNord tracking-wide transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}

                {/* Currency Selector */}
                <div className="relative">
                  <select className="text-gray-800 text-sm font-medium tracking-wide bg-transparent border-none outline-none cursor-pointer">
                    <option>IN (USD $)</option>
                    <option>IN (EUR €)</option>
                    <option>IN (GBP £)</option>
                  </select>
                </div>

                {/* Icons */}
                <div className="flex items-center space-x-4">
                  <button className="text-gray-800 hover:text-gray-600 transition-colors duration-200">
                    <Search size={20} />
                  </button>
                  <Link href={"/cart"}>
                    <button className="text-gray-800 hover:text-gray-600 transition-colors duration-200">
                      <ShoppingBag size={20} />
                    </button>
                  </Link>

                  <button
                    onClick={handelProfileClick}
                    className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
                  >
                    <User size={20} />
                  </button>
                </div>
              </div>

              {/* Mobile Shopping Bag Icon */}
              <div className="xl:hidden w-12 flex justify-end">
                <Link href={"/cart"}>
                  <button className="text-gray-800 hover:text-gray-600 transition-colors duration-200">
                    <ShoppingBag size={20} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div>
        {/* Fine Jewellery Dropdown Menu */}
        {showJewelleryDropdown && (
          <div
            className="fixed top-16 left-0 w-full pt-4 border-gray-200 shadow-lg z-50"
            onMouseEnter={() => setShowJewelleryDropdown(true)}
            onMouseLeave={() => setShowJewelleryDropdown(false)}
          >
            <div className="w-full cream border-gray-200 shadow-lg z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex gap-12">
                  {/* Left Side - Text Categories */}
                  <div className="w-48">
                    <div>
                      <h3 className="text-gray-700 text-sm font-medium font-gintoNord tracking-wide mb-6">
                        JEWELLERY
                      </h3>
                      <div className="space-y-4">
                        {fineJewellerSubCategories.map((item, index) => {
                          if (
                            item.name.includes("Stacker") ||
                            item.name.includes("Statement") ||
                            item.name.includes("Minimal") ||
                            item.name.includes("Initial Signet")
                          ) {
                            return null; // Skip these items
                          }
                          return (
                            <a
                              key={index}
                              href={`/fine-jewellery-807?finejewellery=${item._id}`}
                              className="block capitalize text-gray-600 hover:text-[#236339] text-sm font-gintoNormal transition-colors duration-200"
                            >
                              {item.name}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - 2x2 Grid of Ring Categories */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 max-w-full">
                      {/* Statement Rings */}
                      <a
                        href={`/fine-jewellery-807?finejewellery=${
                          fineJewellerSubCategories.filter((e) =>
                            e.name.includes("Statement")
                          )[0]?._id
                        }`}
                      >
                        <div className="group cursor-pointer">
                          <div className="relative overflow-hidden lg:mb-2 h-44">
                            <h3 className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-[#236339] font-gintoNord transition-colors duration-200">
                              STATEMENT RINGS
                            </h3>
                            <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                              <Image
                                src={
                                  fineJewellerSubCategories.filter((e) =>
                                    e.name.includes("Statement")
                                  )[0]?.image || "/images/statement-ring.webp"
                                }
                                width={400}
                                height={400}
                                alt="Statement Ring"
                                className=" h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </a>

                      {/* Stacker Rings */}
                      <a
                        href={`/fine-jewellery-807?finejewellery=${
                          fineJewellerSubCategories.filter((e) =>
                            e.name.includes("Stacker")
                          )[0]?._id
                        }`}
                      >
                        <div className="group cursor-pointer">
                          <div className="relative overflow-hidden lg:mb-2 h-44">
                            <h3 className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-[#236339] font-gintoNord transition-colors duration-200">
                              STACKER RINGS
                            </h3>
                            <div className="w-full h-full bg-yellow-200 flex items-center justify-center">
                              <Image
                                src={
                                  fineJewellerSubCategories.filter((e) =>
                                    e.name.includes("Stacker")
                                  )[0]?.image || "/images/stacker-ring.webp"
                                }
                                width={400}
                                height={400}
                                alt="Statement Ring"
                                className=" h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </a>

                      {/* Minimal Rings */}
                      <a
                        href={
                          `/fine-jewellery-807?finejewellery=${
                            fineJewellerSubCategories.filter((e) =>
                              e.name.includes("Minimal")
                            )[0]?._id
                          }` ||
                          "/fine-jewellery-807?finejewellery=6874b552f2ed2bebef46ccec"
                        }
                      >
                        <div className="group cursor-pointer">
                          <div className="relative overflow-hidden  lg:mb-2 h-44">
                            <h3 className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-[#236339] font-gintoNord transition-colors duration-200">
                              MINIMAL RINGS
                            </h3>
                            <div className="w-full h-full bg-pink-200 flex items-center justify-center">
                              <Image
                                src={
                                  fineJewellerSubCategories.filter((e) =>
                                    e.name.includes("Minimal")
                                  )[0]?.image || "/images/minimal-ring.webp"
                                }
                                width={400}
                                height={400}
                                alt="Statement Ring"
                                className=" h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </a>

                      {/* Initial Signet Ring */}
                      <a href={`/fine-jewellery-807/initial-signet-ring-317`}>
                        <div className="group cursor-pointer">
                          <div className="relative overflow-hidden  lg:mb-2 h-44">
                            <h3 className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-[#236339] font-gintoNord transition-colors duration-200">
                              INITIAL SIGNET RING
                            </h3>
                            <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                              <Image
                                src={
                                  fineJewellerSubCategories.filter((e) =>
                                    e.name.includes("Initial Signet")
                                  )[0]?.image || "/images/signet-ring.webp"
                                }
                                width={400}
                                height={400}
                                alt="Statement Ring"
                                className=" h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Engagement Rings Dropdown Menu */}
      {showEngagementDropdown && (
        <div
          className="fixed top-16 left-0 w-full pt-4 border-gray-200 shadow-lg z-50"
          onMouseEnter={() => setShowEngagementDropdown(true)}
          onMouseLeave={() => setShowEngagementDropdown(false)}
        >
          <div className="w-full bg-[#FEFAF5] border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex gap-12">
                {/* BUILD A RING */}
                <div className="w-60">
                  <h3 className="text-gray-700 text-sm font-gintoNord font-me-700 font-ge tracking-wide mb-6">
                    BUILD A RING
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="/browse-settings"
                      className="flex items-center font-gintoNord text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400 mr-3 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      Browse Settings
                    </a>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-gray-700 font-gintoNord  text-[10px] font-medium tracking-wide">
                      READY-TO-SHIP RINGS
                    </h4>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-gray-700 text-[10px] font-gintoNord font-medium tracking-wide mb-4">
                      CUSTOM-MADE RINGS
                    </h4>
                  </div>
                </div>

                {/* SHOP BY METAL */}
                <div className="w-60">
                  <h3 className="text-gray-700 font-gintoNord text-sm font-medium tracking-wide mb-6">
                    SHOP BY METAL
                  </h3>
                  <div className="space-y-4">
                    {openMenuData &&
                      openMenuData["METAL TYPE"]?.map((metal, index) => (
                        <a
                          key={index}
                          href={`/engagement-230?metal=${metal.value.toLowerCase()}`}
                          className="flex gap-2 items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                        >
                          <Image
                            height={24}
                            width={24}
                            src={metal.image}
                            alt={metal.value}
                          />
                          {metal.value}
                        </a>
                      ))}
                  </div>
                </div>

                {/* SHOP BY STYLE */}
                <div className="w-60">
                  <h3 className="text-gray-700 font-gintoNord text-sm font-medium tracking-wide mb-6">
                    SHOP BY STYLE
                  </h3>
                  <div className="space-y-4">
                    {openMenuData &&
                      openMenuData["Style"]?.map((style, index) => (
                        <a
                          href={`/engagement-230?style=${style.value.toLowerCase()}`}
                          className="flex gap-4 items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                        >
                          <Image
                            height={32}
                            width={40}
                            src={style.image}
                            alt={style.value}
                            className="object-contain brightness-0"
                          />
                          {style.value}
                        </a>
                      ))}
                  </div>
                </div>

                {/* ENGAGEMENT RING GUIDANCE */}
                <div className="w-60">
                  <h3 className="text-gray-700 tex-700 font-gintoNord font-medium tracking-wide mb-6">
                    ENGAGEMENT RING GUIDANCE
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="/engagement-rings/build-rings"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Design Basics
                    </a>
                    <a
                      href="/engagement-rings/build-rings"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Engagement Ring Guide
                    </a>
                    <a
                      href="/engagement-rings/build-rings"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Find Your Ring Size
                    </a>
                    <a
                      href="/engagement-rings/build-rings"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Precious Metals Guide
                    </a>
                    <a
                      href="/engagement-rings/build-rings"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Our Crafting Process
                    </a>
                    <a
                      href="/engagement-rings/build-rings"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Ring Care Guide
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showWeddingDropdown && (
        <div
          className="fixed top-16 left-0 w-full pt-4 border-gray-200 shadow-lg z-50"
          onMouseEnter={() => setShowWeddingDropdown(true)}
          onMouseLeave={() => setShowWeddingDropdown(false)}
        >
          <div className=" bg-[#FEFAF5] border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex gap-12">
                {/* Left Side - Women's Section */}
                <div className="w-60">
                  <h3 className="text-gray-700 text-sm font-medium tracking-wide mb-6 font-gintoNord ">
                    WOMEN
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="/wedding-rings-873?gender=woman"
                      className="block text-gray-900  hover:text-[#236339] font-gintoNormal text-sm transition-colors duration-200"
                    >
                      All Women's Wedding Rings
                    </a>
                    {openMenuData &&
                      openMenuData["Style"]?.map((band, index) => (
                        <a
                          key={index}
                          href={`/wedding-rings-873?gender=woman&style=${band.value.toLowerCase()}`}
                          className="block text-gray-600 hover:text-[#236339] text-sm font-gintoNormal transition-colors duration-200"
                        >
                          {band.value} Woman Wedding Rings
                        </a>
                      ))}
                  </div>
                </div>

                {/* Middle - Women's by Metal */}
                <div className="w-60">
                  <h3 className="text-gray-700 text-sm font-medium tracking-wide mb-6 font-gintoNord ">
                    RINGS BY METAL
                  </h3>
                  <div className="space-y-4">
                    {openMenuData &&
                      openMenuData["METAL TYPE"]?.map((metal, index) => (
                        <a
                          key={index}
                          href={`/engagement-230?metal=${metal.value.toLowerCase()}`}
                          className="flex gap-2 items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                        >
                          <Image
                            height={24}
                            width={24}
                            src={metal.image}
                            alt={metal.value}
                          />
                          {metal.value}
                        </a>
                      ))}
                  </div>
                </div>

                {/* Right Side - Men's Section */}
                <div className="w-60">
                  <h3 className="text-gray-700 text-sm font-medium tracking-wide mb-6 font-gintoNord ">
                    MEN
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="/wedding-rings-873?gender=man"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      All Men's Wedding Rings
                    </a>
                    {openMenuData &&
                      openMenuData["Style"]?.map((band, index) => (
                        <a
                          key={index}
                          href={`/wedding-rings-873?gender=man&style=${band.value.toLowerCase()}`}
                          className="block text-gray-600 hover:text-[#236339] text-sm font-gintoNormal transition-colors duration-200"
                        >
                          {band.value} Man's Wedding Rings
                        </a>
                      ))}
                  </div>
                </div>

                {/* Far Right - Men's by Metal */}
                {/* <div className="w-60">
                  <h3 className="text-gray-700 text-sm font-medium tracking-wide mb-6 font-gintoNord ">
                    MEN'S BY METAL
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="/wedding-rings/women"
                      className="flex items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 mr-3"></div>
                      Platinum
                    </a>
                    <a
                      href="/wedding-rings/women"
                      className="flex items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 mr-3"></div>
                      Yellow Gold
                    </a>
                    <a
                      href="/wedding-rings/women"
                      className="flex items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 mr-3"></div>
                      Rose Gold
                    </a>
                    <a
                      href="/wedding-rings/women"
                      className="flex items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 mr-3"></div>
                      White Gold
                    </a>
                    <a
                      href="/wedding-rings/women"
                      className="flex items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 mr-3"></div>
                      Titanium
                    </a>
                    <a
                      href="/wedding-rings/women"
                      className="flex items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 mr-3"></div>
                      Tantalum
                    </a>
                    <a
                      href="/wedding-rings/women"
                      className="flex items-center text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-900 to-black mr-3"></div>
                      Carbon Fibre
                    </a>
                  </div>
                </div> */}

                {/* Wedding Ring Guidance */}
                <div className="w-60">
                  <h3 className="text-gray-700 text-sm font-medium tracking-wide mb-6 font-gintoNord ">
                    WEDDING RING GUIDANCE
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="/wedding-rings/women"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Wedding Ring Guide
                    </a>
                    <a
                      href="/wedding-rings/women"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Design Basics
                    </a>
                    <a
                      href="/wedding-rings/women"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Find Your Ring Size
                    </a>
                    <a
                      href="/precious-metals-guide"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Precious Metals Guide
                    </a>
                    <a
                      href="/crafting-process"
                      className="block text-gray-600 hover:text-[#236339] text-sm transition-colors duration-200 font-gintoNormal"
                    >
                      Our Crafting Process
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Contact Dropdown Menu */}
      {showContactDropdown && (
        <div
          className="fixed top-16 left-0 w-full pt-4 border-gray-200 shadow-lg z-50"
          onMouseEnter={() => setShowContactDropdown(true)}
          onMouseLeave={() => setShowContactDropdown(false)}
        >
          <div className="w-full bg-[#FEFAF5] border-gray-200 shadow-lg z-50">
            <div className="max-w-5xl p-4 mx-auto px-4 sm:px-6 lg:px-8 pt-12">
              <div className="flex gap-12">
                {/* Left Side - Contact Options */}
                <div className="w-48 lg:w-[30%]">
                  <div>
                    <h3 className="text-gray-700 text-sm font-medium font-gintoNord tracking-wide mb-6">
                      CONTACT US
                    </h3>
                    <div>
                      <a
                        href="/contact"
                        className="block text-gray-600 hover:bg-[#fff4e6] py-3 px-1 text-sm font-gintoNormal transition-colors duration-200"
                      >
                        Get In Touch
                      </a>
                      <a
                        href="/visit"
                        className="block text-gray-600 hover:bg-[#fff4e6] py-3 px-1 text-sm font-gintoNormal transition-colors duration-200"
                      >
                        Book an Appointment
                      </a>
                      <a
                        href="/faqs"
                        className="block text-gray-600 hover:bg-[#fff4e6] py-3 px-1 text-sm font-gintoNormal transition-colors duration-200"
                      >
                        FAQs
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Side - 2x2 Grid similar to jewellery */}
                <div className="flex-1 lg:w-[70%]">
                  <div className="grid grid-cols-1 gap-4 ">
                    {/* Get In Touch */}
                    <div className="group cursor-pointer">
                      <div className="relative overflow-hidden lg:mb-2 h-44">
                        <h3 className="text-gray-700 text-sm font-medium tracking-wide  group-hover:text-[#236339] font-gintoNord transition-colors duration-200">
                          GET IN TOUCH
                        </h3>
                        <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                          <Image
                            src="/images/getintouch.webp"
                            width={400}
                            height={400}
                            alt="Statement Ring"
                            className=" h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Book Appointment */}
                    <div className="group cursor-pointer">
                      <div className="relative overflow-hidden lg:mb-2 h-44">
                        <h3 className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-[#236339] font-gintoNord transition-colors duration-200">
                          BOOK AN APPOINTMENT
                        </h3>
                        <div className="w-full h-full bg-yellow-200 flex items-center justify-center">
                          <Image
                            src="/images/appointment.webp"
                            width={400}
                            height={400}
                            alt="Statement Ring"
                            className=" h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-[#fefaf57e] overflow-hidden">
          <div className="h-full w-[80%] max-w-[240px] bg-[#FEFAF5] flex flex-col">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 bg-[#FEFAF5] relative z-[10000]">
              <div className="w-6"></div> {/* Spacer */}
              <button className="text-gray-800 hover:text-gray-600 transition-colors duration-200">
                <Search size={20} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-4 py-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Regular nav items without dropdowns */}
                {navItems
                  .filter((item) => !item.hasDropdown)
                  .map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block text-gray-800 hover:text-gray-600 text-[10px] font-medium tracking-wide transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}

                {/* Accordion for Fine Jewellery */}
                {mobileAccordionItems.map((accordionItem, index) => (
                  <div
                    key={accordionItem.title}
                    className="border-b border-gray-200"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="flex items-center justify-between w-full text-left text-gray-800 hover:text-gray-600 text-[10px] font-medium tracking-wide transition-colors duration-200"
                    >
                      <span>{accordionItem.title}</span>
                      {expandedAccordion === index ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    {expandedAccordion === index && (
                      <div className="mt-4 ml-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {accordionItem.subcategories.map((subcat, subIndex) => (
                          <div key={subIndex}>
                            {subcat.items ? (
                              // If subcategory has items, show as a submenu
                              <div>
                                <div className="text-gray-600 text-[10px] font-medium tracking-wide mb-2">
                                  {subcat.name}
                                </div>
                                <div className="ml-3 space-y-2">
                                  {subcat.items.map((item) => (
                                    <a
                                      key={item.name}
                                      href={item.href}
                                      className="block text-gray-500 hover:text-[#236339] text-[10px] transition-colors duration-200"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      {item.name}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              // If subcategory has no items, show as direct link
                              <a
                                href={subcat.href}
                                className="block text-gray-600 hover:text-[#236339] text-[10px] transition-colors duration-200"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subcat.name}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Right nav items */}
                {rightNavItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-gray-800 hover:text-gray-600 text-[10px] font-medium tracking-wide transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}

                {/* Book Appointment - Special styling */}
                <a
                  href="/book-appointment"
                  className="block text-teal-600 hover:text-teal-700 text-lg font-medium tracking-wide transition-colors duration-200 pt-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  BOOK APPOINTMENT
                </a>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="px-4 pb-8">
              {/* Currency Selector */}
              <div className="mb-8">
                <select className="text-gray-800 text-sm font-medium tracking-wide bg-transparent border-none outline-none">
                  <option>IN (USD $)</option>
                  <option>IN (EUR €)</option>
                  <option>IN (GBP £)</option>
                </select>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center space-x-6 flex-wrap gap-2">
                <a
                  href="#"
                  className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
                >
                  <Youtube size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.423-2.001 4.536-1.194 1.188-2.819 1.844-4.67 1.844-.598 0-1.174-.085-1.727-.247-.264-.078-.526-.171-.782-.278-.348-.146-.68-.317-.993-.513-.793-.495-1.485-1.211-1.957-2.085-.332-.614-.52-1.295-.52-2.01 0-.717.188-1.398.52-2.01.472-.874 1.164-1.59 1.957-2.085.313-.196.645-.367.993-.513.256-.107.518-.2.782-.278.553-.162 1.129-.247 1.727-.247 1.851 0 3.476.656 4.67 1.844 1.105 1.113 1.832 2.678 2.001 4.536z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
