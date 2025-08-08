"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import useTokenRefresh from "../hooks/useTokenRefresh";

export default function ClientLayout({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Use the token refresh hook only if user is authenticated
  useTokenRefresh();

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
