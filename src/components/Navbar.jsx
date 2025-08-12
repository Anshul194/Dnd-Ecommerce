import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, Heart, User, Menu, X, Bell } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/app/store/slices/categorySlice";
import CartSidebar from "./CartSidebar";
import { getCartItems, toggleCart } from "@/app/store/slices/cartSlice";
import { usePathname, useRouter } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const menuRef = useRef(null);
  const backdropRef = useRef(null);
  const { categories } = useSelector((state) => state.category);
  const { cartItems } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  // Assuming you might use categories later
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  // Load GSAP
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    script.onload = () => {
      setGsapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const toggleMenu = () => {
    if (!gsapLoaded || typeof window.gsap === "undefined") {
      // Fallback if GSAP isn't loaded yet
      setIsMenuOpen(!isMenuOpen);
      return;
    }

    if (!isMenuOpen) {
      // Opening animation
      setIsMenuOpen(true);

      // Wait for next frame to ensure DOM elements are rendered
      requestAnimationFrame(() => {
        if (backdropRef.current && menuRef.current) {
          // Animate backdrop
          window.gsap.fromTo(
            backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" }
          );

          // Animate menu panel
          window.gsap.fromTo(
            menuRef.current,
            { x: "100%" },
            { x: "0%", duration: 0.4, ease: "power3.out" }
          );
        }
      });
    } else {
      // Closing animation
      if (backdropRef.current && menuRef.current) {
        window.gsap.to(backdropRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        });

        window.gsap.to(menuRef.current, {
          x: "100%",
          duration: 0.35,
          ease: "power3.in",
          onComplete: () => setIsMenuOpen(false),
        });
      } else {
        // Fallback if refs are null
        setIsMenuOpen(false);
      }
    }
  };

  const navItems = [
    { name: "Popular Fashion", href: "#" },
    { name: "Shoe Men", href: "#" },
    { name: "Gadgets", href: "#" },
    { name: "Computer", href: "#" },
    { name: "Landing", href: "#" },
    { name: "Flash Sale", href: "#" },
    { name: "Accessories", href: "#" },
    { name: "Blog", href: "#" },
  ];

  useEffect(() => {
    // Fetch categories or perform any necessary actions
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
    dispatch(getCartItems());
  }, []);

  const handelCartToggle = () => {
    dispatch(toggleCart());
  };

  const handleUserDashboardClick = () => {
    if (isAuthenticated) {
      console?.log("User is authenticated, navigating to dashboard");
      router.push("/dashboard");
    } else {
      // Redirect to login if not authenticated
      router.push("/login");
    }
  };

  if (
    pathname.includes("/signup") ||
    pathname.includes("/login") ||
    pathname.includes("/builder")
  ) {
    return null; // Don't render Navbar on product detail page
  }

  return (
    <>
      <CartSidebar />
      <nav className="bg-white shadow-sm border-b border-gray-200">
        {/* Top Header Bar */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-black">
                <div className=" text-black py-1 rounded text-lg font-bold">
                  YOUR LOGO
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-xl hidden md:block">
              <input
                type="text"
                placeholder="What are you looking for...."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none text-black focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <Link href="/search">
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg text-white p-1 rounded">
                  <Search size={16} />
                </button>
              </Link>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Icons */}
              <div className="flex items-center gap-1">
                <div className="flex items-center space-x-3">
                  <button className="text-gray-600 hover:text-green-500 transition-colors">
                    <Bell size={20} />
                  </button>
                  <Link href="/dashboard?tab=wishlist">
                    <button className="text-gray-600 hover:text-green-500 transition-colors">
                      <Heart size={20} />
                    </button>
                  </Link>
                  <button
                    onClick={handelCartToggle}
                    className="text-gray-600 hover:text-green-500 transition-colors relative"
                  >
                    <ShoppingCart size={20} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length || 0}
                    </span>
                  </button>
                  {/* Account Avatar */}
                  <button
                    onClick={handleUserDashboardClick}
                    className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 hover:border-green-500 transition-colors"
                  >
                    <User size={20} className="text-gray-600" />
                  </button>
                </div>
                <span className="text-gray-600 text-sm">
                  {isAuthenticated ? user?.name || "User" : "Guest"}
                </span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-green-500 focus:outline-none transition-transform duration-200 hover:scale-110"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Bar - Second Row */}
        <div className="hidden md:block border-t border-gray-100 bg-gray-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-3">
              {categories?.length > 0 &&
                categories?.map((item) => (
                  <Link
                    key={item.name}
                    href={`/search?category=${item._id}`}
                    className="text-gray-700 cursor-pointer capitalize hover:text-green-500 text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            ref={backdropRef}
            className="absolute inset-0 bg-black/20 bg-opacity-50 backdrop-blur-sm"
            onClick={toggleMenu}
          />

          {/* Menu Panel */}
          <div
            ref={menuRef}
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
            style={{ transform: "translateX(100%)" }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" className="text-black">
                <div className=" text-black px-3 py-1 rounded text-lg font-bold">
                  YOUR LOGO
                </div>
              </Link>
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-green-500 transition-transform duration-200 hover:scale-110 hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              {/* Mobile Search */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="What are you looking for...."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg text-white p-1 rounded">
                  <Search size={16} />
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-4 mb-6">
                {categories?.length > 0 &&
                  categories?.map((item, index) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block text-gray-700 cursor-pointer capitalize hover:text-green-500 py-2 text-sm font-medium transition-all duration-200 hover:translate-x-2 hover:bg-green-50 rounded px-2"
                      onClick={toggleMenu}
                      style={{
                        opacity: isMenuOpen ? 1 : 0,
                        transform: isMenuOpen
                          ? "translateY(0)"
                          : "translateY(20px)",
                        transition: `all 0.3s ease ${index * 0.05}s`,
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
              </div>

              {/* Mobile Icons */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-600 hover:text-green-500 transition-all duration-200 hover:scale-110">
                      <Bell size={20} />
                    </button>
                    <Link href="/dashboard?tab=wishlist">
                      <button className="text-gray-600 hover:text-green-500 transition-all duration-200 hover:scale-110">
                        <Heart size={20} />
                      </button>
                    </Link>
                    <button
                      onClick={handelCartToggle}
                      className="text-gray-600 hover:text-green-500 transition-all duration-200 hover:scale-110 relative"
                    >
                      <ShoppingCart size={20} />
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItems.length || 0}
                      </span>
                    </button>
                    {/* Account Avatar */}
                    <button
                      onClick={handleUserDashboardClick}
                      className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 hover:border-green-500 transition-colors"
                    >
                      <User size={20} className="text-gray-600" />
                    </button>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {isAuthenticated ? user?.name || "User" : "Guest"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
