// src/app/layout.js
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./store/Providers";
import ClientLayout from "./ClientLayout";
import { ToastContainer } from "react-toastify";
import CheckoutPopup from "../components/CheckoutPopup";

export const metadata = {
  title: "DND - Ecommerce",
  description: "Find the perfect good",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        <link
          rel="preload"
          href="/fonts/Poppins-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/BebasNeue-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>

      {/* ❌ removed suppressHydrationWarning */}
      <body>
        <Providers>
          <ClientLayout>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              className="!z-[9999999]"
            />
            <CheckoutPopup />
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
