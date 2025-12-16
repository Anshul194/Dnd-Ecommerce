// src/app/layout.js
import { Bebas_Neue } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./store/Providers"; // ✅ Updated path
import ClientLayout from "./ClientLayout";
import { ToastContainer } from "react-toastify";
import CheckoutPopup from "../components/CheckoutPopup";
// import OrderPopup from "../components/OrderPopup";
export const metadata = {
  title: "DND - Ecommerce ",
  description: "Find the perfect good",
};

export default function RootLayout({ children }) {
  // console.log = () => {};

  return (
    <html lang="en">
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body>
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
            {/* <OrderPopup /> */}
            {children ?? null}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
