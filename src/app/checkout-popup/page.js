"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCheckoutOpen } from "@/app/store/slices/checkOutSlice";
import CheckoutPopup from "@/components/CheckoutPopup";

export default function CheckoutPopupPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Automatically open the checkout popup when this page loads
    dispatch(setCheckoutOpen());
  }, [dispatch]);

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CheckoutPopup />
    </React.Suspense>
  );
}

