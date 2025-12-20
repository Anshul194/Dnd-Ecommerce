"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCheckoutOpen } from "@/app/store/slices/checkOutSlice";
import CheckoutPopup from "@/components/CheckoutPopup";

export default function CheckoutPopupPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Automatically open the checkout popup when this page loads
    dispatch(setCheckoutOpen());
  }, [dispatch]);

  return <CheckoutPopup />;
}

