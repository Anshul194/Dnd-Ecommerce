import { Search, Bell, ShoppingCart, User, Menu, Heart } from "lucide-react";
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
import { fetchCategories } from "@/app/store/slices/categorySlice";
import { getCartItems, toggleCart } from "@/app/store/slices/cartSlice";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import CartSidebar from "./CartSidebar";
import { selectWishlistItems } from "@/app/store/slices/wishlistSlice";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { categories } = useSelector((state) => state.category);
  const { cartItems } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const LikedProducts = useSelector(selectWishlistItems);
  // Assuming you might use categories later
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

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

  // Hydration-safe user name display
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

  if (
    pathname.includes("/signup") ||
    pathname.includes("/login") ||
    pathname.includes("/builder")
  ) {
    return null; // Don't render Navbar on product detail page
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b  border-gray-100">
        <div className="container mx-auto px-2 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-6">
            {/* Mobile Menu & Logo */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Hamburger Menu - Mobile Only */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button className="md:hidden hover:text-[#3C950D] transition-colors p-2">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle className="text-[#3C950D]">
                      Categories
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col gap-2">
                    {categories.length > 0 && (
                      <Link href={`/search`}>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="w-full text-left px-4 py-3 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                        >
                          All
                        </button>
                      </Link>
                    )}
                   
                    {categories.map((category, index) => (
                      <Link
                        key={index}
                        href={`/search?category=${category._id}`}
                      >
                        <button
                          onClick={() => setIsOpen(false)}
                          className="w-full text-left px-4 py-3 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                        >
                          {category?.name}
                        </button>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.webp"
                  alt="TeaHaven Logo"
                  width={40}
                  height={40}
                  className="rounded-full h-10 w-10 object-cover"
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Search for teas..."
                className="pl-10 w-full bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">

              {/* Mobile Search Icon */}
              <button className="sm:hidden hover:text-[#3C950D] outline-none transition-all hover:scale-110">
                <Search className="w-5 h-5" />
              </button>

 <Link href={`/pages/68fb0ce58b4cf00083b826d2`}>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left text-black px-4 py-3 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                      >
                        About Us
                      </button>
                    </Link>
                    <Link href={`/pages/contact-us`}>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-4 py-3 hover:bg-[#3C950D]/10 rounded-lg transition-colors"
                      >
                        Contact Us
                      </button>
                    </Link>
              {/* Notifications */}
              <Link
                href={isAuthenticated ? "/dashboard?tab=wishlist" : "/login"}
              >
                <button className="relative hover:text-[#3C950D] text-black transition-all hover:scale-110">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 " />
                  <Badge className="absolute text-white -top-1 -right-1 md:-top-2 md:-right-2 bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] w-4 h-4 md:w-5 md:h-5 rounded-full p-0 flex items-center justify-center text-[10px] md:text-xs shadow-lg">
                    {LikedProducts?.length || 0}
                  </Badge>
                </button>
              </Link>

              {/* Cart */}
              <button
                onClick={handelCartToggle}
                className="relative hover:text-[#3C950D] text-black transition-all hover:scale-110"
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

          {/* Mobile Search Bar - Full Width */}
          <div className="sm:hidden mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search for teas..."
              className="pl-9 w-full bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-sm"
            />
          </div>
        </div>
      </nav>
      <div className="hidden md:block bg-gradient-to-r from-[#3C950D] via-[#45a610] to-[#3C950D] text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            
            {categories.map((category, index) => (
              <Link key={index} href={`/search?category=${category._id}`}>
                <button
                  key={index}
                  className="px-5 py-2.5 whitespace-nowrap hover:bg-white/20 rounded-full transition-all hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                >
                  {category?.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <CartSidebar />
    </>
  );
}
