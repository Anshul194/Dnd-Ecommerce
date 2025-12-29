// src/app/store/Providers.js
"use client";

import { Provider } from "react-redux";
import store from "./index"; // points to store configuration
import { useEffect } from "react";
import { getCartItems } from "./slices/cartSlice";

export default function Providers({ children }) {
  // Restore cart from localStorage/server on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Use the store directly because this Providers component wraps the <Provider />
      // and calling useDispatch() here would fail (no context yet).
      store.dispatch(getCartItems());
    } catch (e) {
      // ignore
    }
  }, []);
  return <Provider store={store}>{children}</Provider>;
}