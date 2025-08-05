// src/app/layout.js
import { Bebas_Neue } from "next/font/google";
import "./globals.css";
import Providers from "./store/Providers"; // ✅ Updated path
import ClientLayout from "./ClientLayout";
import { ToastContainer } from "react-toastify";
import CheckoutPopup from "../components/CheckoutPopup";
import OrderPopup from "../components/OrderPopup";
export const metadata = {
  title: "DND - Ecommerce ",
  description: "Find the perfect good",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <body
        className={`${geistSans.variable} ${geistMono.variable} ${cullenGinto.variable} antialiased`}
      > */}
        <Providers>
          <ClientLayout>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
            />
            <CheckoutPopup />
            <OrderPopup />
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
