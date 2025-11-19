"use client";

import {
  Search,
  Bell,
  ShoppingCart,
  User,
  Menu,
  Heart,
  ChevronDown,
  X,
  ChevronRight,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchCategoryWithSubcategories,
} from "@/app/store/slices/categorySlice";
import { getCartItems, toggleCart } from "@/app/store/slices/cartSlice";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import CartSidebar from "./CartSidebar";
import {
  fetchWishlist,
  selectWishlistItems,
} from "@/app/store/slices/wishlistSlice";
import Image from "next/image";
import { fetchProducts } from "@/app/store/slices/productSlice";
import { fetchBlogs } from "@/app/store/slices/blogSclie";
import axiosInstance from "@/axiosConfig/axiosInstance";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null); // For desktop hover
  const { cartItems } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.blogs);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isClient, setIsClient] = useState(false);

  const LikedProducts = useSelector(selectWishlistItems);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const initialData = async () => {
    const res = await fetchCategoryWithSubcategories();
    setCategories(res || []);
    if (products?.products?.length == 0) {
      const payload = {
        page: 1,
        limit: 10,
        sort: "createdAt",
        order: "desc",
        filters: {},
      };
      dispatch(fetchProducts(payload));
    }
    isAuthenticated && dispatch(fetchWishlist());
    dispatch(fetchBlogs());
  };

  useEffect(() => {
    initialData();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure mobile menu subcategory is collapsed when sheet opens/closes
  useEffect(() => {
    if (isOpen) {
      setExpandedCategory(null);
    }
  }, [isOpen]);

  const handelCartToggle = () => {
    dispatch(toggleCart());
  };

  const handleUserDashboardClick = () => {
    console.log("Navigating to user dashboard");
    if (isAuthenticated) {
      console.log("Navigating to user dashboard 2");
      router.push("/dashboard");
      console.log("Navigating to user dashboard 3");
    } else {
      console.log("Navigating to user dashboard 4a");
      router.push("/login");
    }
  };

  const [displayName, setDisplayName] = useState("User");
  useEffect(() => {
    if (isAuthenticated && user?.name) {
      setDisplayName(user.name);
    } else if (isAuthenticated) {
      setDisplayName("User");
    } else {
      setDisplayName("Guest");
    }
  }, [isAuthenticated, user?.name]);

  const fetchProductsFromApi = async () => {
    try {
      const quaryParams = new URLSearchParams();

      if (searchTerm) {
        quaryParams.append(
          "searchFields",
          JSON.stringify({ name: searchTerm })
        );
      }

      const response = await axiosInstance.get("/product", {
        params: quaryParams,
      });
      setProducts(
        response.data.products.data.products || response.data.products.data
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filterBlogs = (term) => {
    if (term.trim() === "") {
      setFilteredBlogs([]);
      return;
    }
    const filtered = items.filter((blog) =>
      blog.title.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBlogs(filtered);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProductsFromApi();
      filterBlogs(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Toggle category expansion for mobile
  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (
    pathname.includes("/signup") ||
    pathname.includes("/login") ||
    pathname.includes("/builder")
  ) {
    return null;
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-[999] border-b border-gray-100">
        <div className="container mx-auto px-2 md:px-8 py-2 md:py-2">
          <div className="flex items-center justify-between gap-2 md:gap-6">
            {/* Mobile Menu & Logo */}
            {/* <div className="flex items-center w-2/3 justify-between   gap-2 md:gap-4"> */}
            {/* Hamburger Menu - Mobile Only */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              {!pathname.includes("/dashboard") && (
                <SheetTrigger asChild>
                  <button className="md:hidden text-[#3C950D] hover:text-[#3C950D] transition-colors p-2">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
              )}
              <SheetContent
                side="left"
                className="w-[280px] sm:w-[320px] overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle className="text-[#3C950D]">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/");
                    }}
                    className="w-full text-left px-4 py-1 text-gray-800 hover:bg-[#3C950D]/10 rounded-lg transition-colors font-semibold"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/search");
                    }}
                    className="w-full text-left px-4 py-1 text-gray-800 hover:bg-[#3C950D]/10 rounded-lg transition-colors font-semibold"
                  >
                    All Products
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <p className="px-4 py-2 text-sm font-semibold text-gray-800">
                    Categories
                  </p>
                  {categories.map((category, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            router.push(`/search?category=${category._id}`);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-500 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                        >
                          {category?.name}
                        </button>

                        {/* Toggle button for subcategories */}
                        {category.subcategories?.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category._id)}
                            className="px-3 py-2 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                          >
                            <ChevronDown
                              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expandedCategory === category._id
                                  ? "rotate-180"
                                  : ""
                                }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Collapsible subcategories */}
                      {category.subcategories?.length > 0 && (
                        <div
                          className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${expandedCategory === category._id
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                            }`}
                        >
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub._id}
                              onClick={() => {
                                setIsOpen(false);
                                router.push(`/search?subcategory=${sub._id}`);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-[#3C950D]/5 rounded-lg transition-colors"
                            >
                              • {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/pages/68fb0ce58b4cf00083b826d2");
                    }}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                  >
                    About Us
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/contact");
                    }}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                  >
                    Contact Us
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="text-black">
                <Image
                  src="/logo.webp"
                  alt="TeaHaven Logo"
                  width={100}
                  height={100}
                  className="rounded-full h-[90px] w-[90px] object-cover "
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center  gap-6 ml-1/2">
              {/* Categories with Mega Menu - LEFT/RIGHT LAYOUT */}

              <button
                onClick={() => router.push("/")}
                className="text-gray-700 hover:text-[#3C950D] transition-colors font-medium"
              >
                Home
              </button>
              <div
                className="relative"
                onMouseEnter={() => setShowCategoryMenu(true)}
                onMouseLeave={() => {
                  setShowCategoryMenu(false);
                  setHoveredCategory(null);
                }}
              >
                <button className="flex items-center gap-1 text-gray-700 hover:text-[#3C950D] transition-colors py-2 font-medium">
                  Categories
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showCategoryMenu ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Categories Mega Menu Dropdown - NEW LAYOUT */}
                {showCategoryMenu && (
                  <div className="absolute left-0 top-full pt-2 w-[700px] -ml-4">
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="flex h-[500px]">
                        {/* LEFT SIDE - Categories List */}
                        <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                          <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="w-1 h-5 bg-[#3C950D] rounded-full"></span>
                              All Categories
                            </h3>
                            <div className="space-y-1">
                              {categories.map((category) => {
                                if (category.status !== "Active") return null;
                                return (
                                  <div
                                    key={category._id}
                                    onMouseEnter={() =>
                                      setHoveredCategory(category._id)
                                    }
                                    className={`group cursor-pointer rounded-lg transition-all ${hoveredCategory === category._id
                                        ? "bg-white shadow-sm"
                                        : "hover:bg-white/50"
                                      }`}
                                  >
                                    <div
                                      onClick={() => {
                                        setShowCategoryMenu(false);
                                        setHoveredCategory(null);
                                        router.push(`/search?category=${category._id}`);
                                      }}
                                      className="flex items-center gap-3 p-3"
                                      style={{ cursor: "pointer" }}
                                    >
                                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
                                        {category.image ? (
                                          <Image
                                            src={category.image}
                                            alt={category.name}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gradient-to-br from-[#3C950D]/20 to-[#2d7009]/20 flex items-center justify-center">
                                            <span className="text-[#3C950D] font-bold">
                                              {category.name.charAt(0)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4
                                          className={`font-medium text-sm transition-colors truncate ${hoveredCategory === category._id
                                              ? "text-[#3C950D]"
                                              : "text-gray-700"
                                            }`}
                                        >
                                          {category.name}
                                        </h4>
                                        {category.subcategories?.length >
                                          0 && (
                                            <p className="text-xs text-gray-500">
                                              {category.subcategories.length}{" "}
                                              items
                                            </p>
                                          )}
                                      </div>
                                      {category.subcategories?.length >
                                        0 && (
                                          <ChevronRight
                                            className={`w-4 h-4 transition-colors ${hoveredCategory === category._id
                                                ? "text-[#3C950D]"
                                                : "text-gray-400"
                                              }`}
                                          />
                                        )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT SIDE - Subcategories */}
                        <div className="flex-1 bg-white overflow-y-auto">
                          <div className="p-6">
                            {hoveredCategory ? (
                              <>
                                {(() => {
                                  const selectedCategory = categories.find(
                                    (cat) => cat._id === hoveredCategory
                                  );
                                  return (
                                    <>
                                      <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                          {selectedCategory?.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                          {selectedCategory?.subcategories
                                            ?.length > 0
                                            ? `${selectedCategory.subcategories.length} subcategories`
                                            : "No subcategories"}
                                        </p>
                                      </div>

                                      {selectedCategory?.subcategories
                                        ?.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                          {selectedCategory.subcategories.map(
                                            (subcategory) => {
                                              if (
                                                subcategory.status !==
                                                "Active"
                                              )
                                                return null;
                                              return (
                                                <Link
                                                  key={subcategory._id}
                                                  href={`/search?category=${selectedCategory._id}&subcategory=${subcategory._id}`}
                                                  onClick={() => {
                                                    setShowCategoryMenu(
                                                      false
                                                    );
                                                    setHoveredCategory(null);
                                                  }}
                                                >
                                                  <div className="group/sub flex items-center gap-3 p-3 rounded-lg hover:bg-[#3C950D]/5 transition-all cursor-pointer border border-transparent hover:border-[#3C950D]/20">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                                      {subcategory.image ? (
                                                        <Image
                                                          src={
                                                            subcategory.image
                                                          }
                                                          alt={
                                                            subcategory.name
                                                          }
                                                          width={48}
                                                          height={48}
                                                          className="w-full h-full object-cover"
                                                        />
                                                      ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-[#3C950D]/10 to-[#2d7009]/10 flex items-center justify-center">
                                                          <span className="text-[#3C950D] font-semibold">
                                                            {subcategory.name.charAt(
                                                              0
                                                            )}
                                                          </span>
                                                        </div>
                                                      )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 group-hover/sub:text-[#3C950D] transition-colors">
                                                      {subcategory.name}
                                                    </span>
                                                  </div>
                                                </Link>
                                              );
                                            }
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center h-48">
                                          <p className="text-gray-400 text-sm">
                                            No subcategories available
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 bg-[#3C950D]/10 rounded-full flex items-center justify-center mb-4">
                                  <ChevronRight className="w-8 h-8 text-[#3C950D]" />
                                </div>
                                <p className="text-gray-500 text-sm">
                                  Hover over a category to see subcategories
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* View All Button */}
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <Link
                          href="/search"
                          onClick={() => {
                            setShowCategoryMenu(false);
                            setHoveredCategory(null);
                          }}
                        >
                          <button className="w-full py-2.5 bg-gradient-to-r from-[#3C950D] to-[#2d7009] text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm">
                            View All Categories →
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Products with Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setShowProductMenu(true)}
                onMouseLeave={() => setShowProductMenu(false)}
              >
                <button className="flex items-center gap-1 text-gray-700 hover:text-[#3C950D] transition-colors py-2 font-medium">
                  Products
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showProductMenu ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Products Mega Menu Dropdown */}
                {showProductMenu && (
                  <div className="absolute -left-[32vw] top-full pt-2 w-screen  max-w-6xl -ml-4">
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-100 p-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#3C950D] rounded-full"></span>
                        Featured Products
                      </h3>
                      <div className="grid grid-cols-5 gap-4 max-h-[400px] overflow-y-auto">
                        {products?.products?.length > 0
                          ? products?.products?.map((product) => (
                            <Link
                              key={product._id}
                              href={`/productDetail/${product.slug}`}
                              onClick={() => setShowProductMenu(false)}
                            >
                              <div className="group cursor-pointer">
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                                  <Image
                                    src={
                                      product?.thumbnail?.url ||
                                      product.images?.[0]?.url
                                    }
                                    alt={
                                      product?.thumbnail?.alt ||
                                      product.images?.[0]?.alt
                                    }
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                </div>
                                <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-[#3C950D] transition-colors line-clamp-2">
                                  {product.name}
                                </h4>
                                {product?.variants?.[0]?.price ? (
                                  <div className="flex items-center gap-2">
                                    {product?.variants[0]?.salePrice && (
                                      <span className="text-[#3C950D] font-semibold text-sm">
                                        Rs {product?.variants[0]?.salePrice}
                                      </span>
                                    )}
                                    <span className="text-black/50 font-semibold text-xs line-through">
                                      Rs {product?.variants[0]?.price}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {product?.salePrice && (
                                      <span className="text-[#3C950D] font-semibold text-sm">
                                        Rs {product?.salePrice}
                                      </span>
                                    )}
                                    <span className="text-black/50 font-semibold text-xs line-through">
                                      Rs {product?.price}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))
                          : products?.map((product) => (
                            <Link
                              key={product._id}
                              href={`/productDetail/${product.slug}`}
                              onClick={() => setShowProductMenu(false)}
                            >
                              <div className="group cursor-pointer">
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                                  <Image
                                    src={
                                      product?.thumbnail?.url ||
                                      product.images?.[0]?.url
                                    }
                                    alt={
                                      product?.thumbnail?.alt ||
                                      product.images?.[0]?.alt
                                    }
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                </div>
                                <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-[#3C950D] transition-colors line-clamp-2">
                                  {product.name}
                                </h4>
                                {product?.variants?.[0]?.price ? (
                                  <div className="flex items-center gap-2">
                                    {product?.variants[0]?.salePrice && (
                                      <span className="text-[#3C950D] font-semibold text-sm">
                                        Rs {product?.variants[0]?.salePrice}
                                      </span>
                                    )}
                                    <span className="text-black/50 font-semibold text-xs line-through">
                                      Rs {product?.variants[0]?.price}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {product?.salePrice && (
                                      <span className="text-[#3C950D] font-semibold text-sm">
                                        Rs {product?.salePrice}
                                      </span>
                                    )}
                                    <span className="text-black/50 font-semibold text-xs line-through">
                                      Rs {product?.price}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                      </div>

                      <Link
                        href="/search"
                        onClick={() => setShowProductMenu(false)}
                      >
                        <button className="mt-6 w-full py-3 bg-gradient-to-r from-[#3C950D] to-[#2d7009] text-white rounded-lg hover:shadow-lg transition-all font-medium">
                          Explore More Products →
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/pages/68fb0ce58b4cf00083b826d2")}
                className="text-gray-700 hover:text-[#3C950D] transition-colors font-medium"
              >
                About Us
              </button>

              <button
                onClick={() => router.push("/contact")}
                className="text-gray-700 hover:text-[#3C950D] transition-colors font-medium"
              >
                Contact Us
              </button>
            </div>
            {/* </div> */}

            {/* Spacer for centering */}
            {/* <div className="flex-1"></div> */}

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="hover:text-[#3C950D] text-black outline-none transition-all hover:scale-110"
              >
                <Search className="w-5 h-5 mb-1/2  md:w-6 md:h-6" />
              </button>

              {/* Wishlist */}
              {isClient && (
                <Link
                  href={isAuthenticated ? "/dashboard?tab=wishlist" : "/login"}
                >
                  <button className="relative flex hover:text-[#3C950D] text-black transition-all hover:scale-110">
                    <Heart className="w-5 h-5 md:w-6 md:h-6" />
                    <Badge className="absolute text-white -top-1 -right-1 md:-top-1 md:-right-2  bg-[#3C950D]  w-4 h-4  rounded-full p-0 flex items-center justify-center text-[10px]  shadow-lg">
                      {LikedProducts?.length || 0}
                    </Badge>
                  </button>
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={handelCartToggle}
                className="relative flex hover:text-[#3C950D] text-black transition-all hover:scale-110"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                <Badge className="absolute text-white -top-1 -right-1 md:-top-1 md:-right-2  bg-[#3C950D]  w-4 h-4  rounded-full p-0 flex items-center justify-center text-[10px]  shadow-lg">
                  {cartItems.length || 0}
                </Badge>
              </button>

              {/* User */}
              <div
                onClick={handleUserDashboardClick}
                className="flex items-center gap-2 cursor-pointer hover:text-[#3C950D] transition-all hover:scale-105"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 bg-[#3C950D]  rounded-full flex items-center justify-center">
                  {displayName ? (
                    <span className="text-white font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-white font-semibold">User</span>
                  )}
                </div>
                <span className="hidden lg:block text-sm text-[#3C950D]">
                  {displayName ?? "User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showSearch ? "max-h-fit opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="container mx-auto px-2 md:px-8 pb-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-10 pr-10 w-full outline-none ring-0 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                autoFocus={showSearch}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setShowSearch(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3C950D] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="container flex flex-col gap-2 mx-auto px-2 md:px-8 pb-4">
            {filteredBlogs.length > 0 && (
              <div>
                <h2 className="text-black">Blogs</h2>

                <div className="mt-2">
                  {filteredBlogs.length === 0 ? (
                    <p className="text-gray-500">No blogs found.</p>
                  ) : (
                    <div className="flex gap-4 max-sm:flex-wrap">
                      {filteredBlogs.map((blog) => (
                        <div
                          key={blog._id}
                          className="border-2 cursor-pointer p-2 rounded-md flex gap-2 border-gray-200"
                        >
                          <Image
                            src={blog?.thumbnail?.url || blog?.images?.[0]?.url}
                            alt={blog?.thumbnail?.alt || blog?.images?.[0]?.alt}
                            width={100}
                            height={60}
                            className="w-24 h-16 max-sm:w-20 max-sm:h-14 object-cover rounded-md"
                          />

                          <h3 className="text-gray-800 w-20 text-xs font-medium">
                            {blog.title}
                          </h3>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <h2 className="text-black">Products</h2>

              <div className="mt-2">
                {products.length === 0 ? (
                  <p className="text-gray-500">No products found.</p>
                ) : (
                  <div className="flex gap-4 max-sm:flex-wrap">
                    {products.map((product) => (
                      <Link
                        href={`/productDetail/${product.slug}`}
                        key={product._id}
                      >
                        <div className="border-2 cursor-pointer p-2 rounded-md flex gap-2 border-gray-200">
                          <Image
                            src={
                              product?.thumbnail?.url ||
                              product?.images?.[0]?.url
                            }
                            alt={
                              product?.thumbnail?.alt ||
                              product?.images?.[0]?.alt
                            }
                            width={100}
                            height={60}
                            className="w-24 h-16 max-sm:w-20 max-sm:h-14 object-cover rounded-md"
                          />

                          <div>
                            <h3 className="text-gray-800 w-20 text-xs font-medium">
                              {product?.name}
                            </h3>
                            {product?.variants?.[0]?.salePrice ? (
                              <p className="text-gray-600 text-xs">
                                RS{" "}
                                <span className="font-semibold text-gray-800">
                                  {product?.variants?.[0]?.salePrice}
                                </span>
                              </p>
                            ) : (
                              <p className="text-gray-600 text-xs">
                                RS{" "}
                                <span className="font-semibold text-gray-800">
                                  {product?.variants?.[0]?.price}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <CartSidebar />
    </>
  );
}
