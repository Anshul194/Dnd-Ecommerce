"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import useTokenRefresh from "../hooks/useTokenRefresh";
import { useEffect, useState } from "react";
import { useDispatch, useSelector as useReduxSelector } from "react-redux";
import { fetchSettings } from "./store/slices/settingSlice";
import { fetchCategoryWithSubcategories } from "./store/slices/categorySlice";

export default function ClientLayout({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth ?? {});
  const dispatch = useDispatch();
  const settings = useReduxSelector((state) => state.setting?.settings);
  const [categories, setCategories] = useState([]);

  // Always call hooks at top level
  useTokenRefresh();

  useEffect(() => {
    // Fetch settings once on client side if not present
    if (!settings || !settings.activeHomepageLayout) {
      dispatch(fetchSettings());
    }

    // Fetch categories once and pass to Navbar
    let mounted = true;
    (async () => {
      try {
        const res = await fetchCategoryWithSubcategories();
        if (mounted && res) setCategories(res || []);
      } catch (err) {
        console.error("Error loading categories in ClientLayout:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch, settings]);

  return (
    <>
      <Navbar initialCategories={categories} />
      {children ?? null}
      <Footer />
    </>
  );
}
