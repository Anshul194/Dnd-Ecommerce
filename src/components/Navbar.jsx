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
import { selectWishlistItems } from "@/app/store/slices/wishlistSlice";
import Image from "next/image";
import { fetchProducts } from "@/app/store/slices/productSlice";
import { fetchBlogs } from "@/app/store/slices/blogSclie";
import axiosInstance from "@/axiosConfig/axiosInstance";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null); // Track expanded category
  const { cartItems } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.blogs);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);

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
    dispatch(fetchBlogs());
  };

  useEffect(() => {
    initialData();
  }, []);

  const handelCartToggle = () => {
    dispatch(toggleCart());
  };

  const handleUserDashboardClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
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
        quaryParams.append("selectFields", { name: searchTerm });
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

  // Toggle category expansion
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
        <div className="container mx-auto px-2 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-6">
            {/* Mobile Menu & Logo */}
            <div className="flex items-center gap-2 md:gap-4">
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
                    <Link href={`/search`}>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-4 py-3 text-gray-800 hover:bg-[#3C950D]/10 rounded-lg transition-colors font-semibold"
                      >
                        All Products
                      </button>
                    </Link>

                    <div className="border-t border-gray-200 my-2"></div>

                    <p className="px-4 py-2 text-sm font-semibold text-gray-800">
                      Categories
                    </p>
                    {categories.map((category, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/search?category=${category._id}`}
                            className="flex-1"
                          >
                            <button
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-4 py-2 text-gray-500 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                            >
                              {category?.name}
                            </button>
                          </Link>

                          {/* Toggle button for subcategories */}
                          {category.subcategories?.length > 0 && (
                            <button
                              onClick={() => toggleCategory(category._id)}
                              className="px-3 py-2 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                            >
                              <ChevronDown
                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                  expandedCategory === category._id
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
                            className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                              expandedCategory === category._id
                                ? "max-h-96 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub._id}
                                href={`/search?subcategory=${sub._id}`}
                              >
                                <button
                                  onClick={() => setIsOpen(false)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-[#3C950D]/5 rounded-lg transition-colors"
                                >
                                  • {sub.name}
                                </button>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="border-t border-gray-200 my-2"></div>

                    <Link href={`/pages/68fb0ce58b4cf00083b826d2`}>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                      >
                        About Us
                      </button>
                    </Link>

                    <Link href={`/contact`}>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                      >
                        Contact Us
                      </button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <Link href="/" className="text-black">
                  <Image
                    src="/logo.webp"
                    alt="TeaHaven Logo"
                    width={40}
                    height={40}
                    className="rounded-full h-10 w-10 object-cover"
                  />
                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-6 ml-8">
                {/* Categories with Mega Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowCategoryMenu(true)}
                  onMouseLeave={() => setShowCategoryMenu(false)}
                >
                  <button className="flex items-center gap-1 text-gray-700 hover:text-[#3C950D] transition-colors py-2 font-medium">
                    Categories
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showCategoryMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Categories Mega Menu Dropdown */}
                  {showCategoryMenu && (
                    <div className="absolute left-0 top-full pt-2 w-screen max-w-7xl  -ml-4">
                      <div className="bg-white h-[36rem]  overflow-y-scroll rounded-lg shadow-2xl border border-gray-100 p-8">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#3C950D] rounded-full"></span>
                            All Categories
                          </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          {categories.map((category) => {
                            if (category.status !== "Active") return null;
                            return (
                              <div
                                key={category._id}
                                className="group space-y-3"
                              >
                                {/* Main Category */}
                                <Link
                                  href={`/search?category=${category._id}`}
                                  onClick={() => setShowCategoryMenu(false)}
                                >
                                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#3C950D]/5 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                      {category.image ? (
                                        <Image
                                          src={category.image}
                                          alt={category.name}
                                          width={48}
                                          height={48}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#3C950D]/20 to-[#2d7009]/20 flex items-center justify-center">
                                          <span className="text-[#3C950D] font-bold text-lg">
                                            {category.name.charAt(0)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 group-hover:text-[#3C950D] transition-colors truncate">
                                        {category.name}
                                      </h4>
                                      {category.subcategories?.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                          {category.subcategories.length}{" "}
                                          subcategories
                                        </p>
                                      )}
                                    </div>
                                    {category.subcategories?.length > 0 && (
                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                </Link>

                                {/* Subcategories */}
                                {category.subcategories?.length > 0 ? (
                                  <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
                                    {category.subcategories.map(
                                      (subcategory) => {
                                        if (subcategory.status !== "Active")
                                          return null;

                                        return (
                                          <Link
                                            key={subcategory._id}
                                            href={`/search?category=${category._id}&subcategory=${subcategory._id}`}
                                            onClick={() =>
                                              setShowCategoryMenu(false)
                                            }
                                          >
                                            <div className="group/sub flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#3C950D]/5 transition-colors cursor-pointer">
                                              <div className="w-8 h-8 rounded overflow-hidden bg-gray-50 flex-shrink-0">
                                                {subcategory.image ? (
                                                  <Image
                                                    src={subcategory.image}
                                                    alt={subcategory.name}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full bg-gradient-to-br from-[#3C950D]/10 to-[#2d7009]/10 flex items-center justify-center">
                                                    <span className="text-[#3C950D] text-xs font-semibold">
                                                      {subcategory.name.charAt(
                                                        0
                                                      )}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                              <span className="text-sm text-gray-600 group-hover/sub:text-[#3C950D] transition-colors truncate">
                                                {subcategory.name}
                                              </span>
                                            </div>
                                          </Link>
                                        );
                                      }
                                    )}
                                  </div>
                                ) : (
                                  <h2 className="ml-10 pl-10 text-gray-500 space-y-1">
                                    Not Found
                                  </h2>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <Link
                          href="/search"
                          onClick={() => setShowCategoryMenu(false)}
                        >
                          <button className="mt-6 w-full py-3 bg-gradient-to-r from-[#3C950D] to-[#2d7009] text-white rounded-lg hover:shadow-lg transition-all font-medium">
                            View All Categories →
                          </button>
                        </Link>
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
                      className={`w-4 h-4 transition-transform ${
                        showProductMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Products Mega Menu Dropdown */}
                  {showProductMenu && (
                    <div className="absolute left-0 top-full pt-2 w-screen max-w-6xl -ml-4">
                      <div className="bg-white rounded-lg shadow-2xl border border-gray-100 p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-[#3C950D] rounded-full"></span>
                          Featured Products
                        </h3>
                        <div className="grid grid-cols-5 gap-4 max-h-[400px] overflow-y-auto">
                          {products?.length > 0 &&
                            products?.map((product) => (
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

                <Link href={`/pages/68fb0ce58b4cf00083b826d2`}>
                  <button className="text-gray-700 hover:text-[#3C950D] transition-colors font-medium">
                    About Us
                  </button>
                </Link>

                <Link href={`/contact`}>
                  <button className="text-gray-700 hover:text-[#3C950D] transition-colors font-medium">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>

            {/* Spacer for centering */}
            <div className="flex-1"></div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="hover:text-[#3C950D] text-black outline-none transition-all hover:scale-110"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Wishlist */}
              <Link
                href={isAuthenticated ? "/dashboard?tab=wishlist" : "/login"}
              >
                <button className="relative flex hover:text-[#3C950D] text-black transition-all hover:scale-110">
                  <Heart className="w-5 h-5 md:w-6 md:h-6" />
                  <Badge className="absolute text-white -top-1 -right-1 md:-top-2 md:-right-2 bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] w-4 h-4 md:w-5 md:h-5 rounded-full p-0 flex items-center justify-center text-[10px] md:text-xs shadow-lg">
                    {LikedProducts?.length || 0}
                  </Badge>
                </button>
              </Link>

              {/* Cart */}
              <button
                onClick={handelCartToggle}
                className="relative flex hover:text-[#3C950D] text-black transition-all hover:scale-110"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                <Badge className="absolute text-white -top-1 -right-1 md:-top-2 md:-right-2 bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] w-4 h-4 md:w-5 md:h-5 rounded-full p-0 flex items-center justify-center text-[10px] md:text-xs shadow-lg">
                  {cartItems.length || 0}
                </Badge>
              </button>

              {/* User */}
              <div
                onClick={handleUserDashboardClick}
                className="flex items-center gap-2 cursor-pointer hover:text-[#3C950D] transition-all hover:scale-105"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-[#3C950D] to-[#2d7009] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
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
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showSearch ? "max-h-fit opacity-100" : "max-h-0 opacity-0"
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
                              {product.name}
                            </h3>
                            {product?.variants?.[0]?.salePrice ? (
                              <p className="text-gray-600 text-xs">
                                RS{" "}
                                <span className="font-semibold text-gray-800">
                                  {product.variants[0].salePrice}
                                </span>
                              </p>
                            ) : (
                              <p className="text-gray-600 text-xs">
                                RS{" "}
                                <span className="font-semibold text-gray-800">
                                  {product.variants[0].price}
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
