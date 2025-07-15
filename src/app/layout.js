// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "../store/Providers";
import ClientLayout from "./ClientLayout";
import { ToastContainer } from "react-toastify";

// Google Fonts
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Local Fonts
const cullenGinto = localFont({
  src: [
    {
      path: "../../public/fonts/CullenGintoNormal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CullenGintoNormal-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/CullenGinto-NordRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ABCArizonaMix-Light.woff2",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-cullen",
  display: "swap",
});

export const metadata = { title: "Diamond", description: "Buy your luxury" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cullenGinto.variable} antialiased`}
      >
        <Providers>
          <ClientLayout>
            {" "}
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
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
