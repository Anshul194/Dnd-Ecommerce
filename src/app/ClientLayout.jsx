"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import useTokenRefresh from "../hooks/useTokenRefresh";
import { useEffect, useState } from "react";
import { useDispatch, useSelector as useReduxSelector } from "react-redux";
import { fetchSettings } from "./store/slices/settingSlice";
export default function ClientLayout({ children, initialCategories = [] }) {
  const { isAuthenticated } = useSelector((state) => state.auth ?? {});
  const dispatch = useDispatch();
  const settings = useReduxSelector((state) => state.setting?.settings);
  const [categories, setCategories] = useState(initialCategories || []);

  // Always call hooks at top level
  // useTokenRefresh();

  useEffect(() => {
    // Fetch settings once on client side if not present
    if (!settings || !settings.activeHomepageLayout) {
      dispatch(fetchSettings());
    }

    // If server provided categories are present, skip client fetch
    if (initialCategories && initialCategories.length > 0) return;

    // Otherwise, fetch categories once on client side and pass to Navbar
    let mounted = true;
    (async () => {
      try {
        const { fetchCategoryWithSubcategories } = await import(
          "./store/slices/categorySlice"
        );
        const res = await fetchCategoryWithSubcategories();
        if (mounted && res) setCategories(res || []);
      } catch (err) {
        // console.error("Error loading categories in ClientLayout:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch, settings, initialCategories]);

  return (
    <>
      <Navbar initialCategories={categories} />
      {children ?? null}
      <Footer />
    </>
  );
}
