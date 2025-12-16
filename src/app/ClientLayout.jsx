"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import useTokenRefresh from "../hooks/useTokenRefresh";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector as useReduxSelector } from "react-redux";
import { fetchSettings } from "./store/slices/settingSlice";
import { fetchCategoryWithSubcategories } from "./store/slices/categorySlice";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth ?? {});
  const dispatch = useDispatch();
  const { settings, lastFetched } = useReduxSelector((state) => state.setting);
  const [categories, setCategories] = useState([]);
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  // Check if we're on the checkout page
  const isCheckoutPage = pathname === "/checkout";

  // Always call hooks at top level
  // useTokenRefresh();

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const isCacheValid = lastFetched && (Date.now() - lastFetched < CACHE_DURATION);
    
    // Fetch settings once on client side if not present or cache expired
    if (!settings || !settings.activeHomepageLayout || !isCacheValid) {
      dispatch(fetchSettings());
    }

    // Fetch categories once and pass to Navbar
    let mounted = true;
    (async () => {
      try {
        const res = await fetchCategoryWithSubcategories();
        if (mounted && res) setCategories(res || []);
      } catch (err) {
        // console.error("Error loading categories in ClientLayout:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {!isCheckoutPage && <Navbar initialCategories={categories} />}
      {children ?? null}
      {!isCheckoutPage && <Footer />}
    </>
  );
}
