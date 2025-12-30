"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings } from "./store/slices/settingSlice";
import { fetchCategoryWithSubcategories } from "./store/slices/categorySlice";
import {
  closeCart,
  restoreCartState,
} from "./store/slices/cartSlice";
import { restoreCheckoutState } from "./store/slices/checkOutSlice";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isCheckoutPage = pathname === "/checkout";

  const [categories, setCategories] = useState([]);
  const initializedRef = useRef(false);

  // ✅ run ONCE only (prevents refresh loop)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    dispatch(closeCart());
    dispatch(restoreCartState());
    dispatch(restoreCheckoutState());

    dispatch(fetchSettings());

    fetchCategoryWithSubcategories()
      .then((res) => {
        if (Array.isArray(res)) setCategories(res);
      })
      .catch(() => {});
  }, [dispatch]);

  return (
    <>
      {!isCheckoutPage && <Navbar initialCategories={categories} />}
      {children}
      {!isCheckoutPage && <Footer />}
    </>
  );
}
