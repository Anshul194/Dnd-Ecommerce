"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import useTokenRefresh from "../hooks/useTokenRefresh";

export default function ClientLayout({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth ?? {});

  // Always call hooks at top level
  useTokenRefresh();

  return (
    <>
      <Navbar />
      {children ?? null}
      <Footer />
    </>
  );
}
