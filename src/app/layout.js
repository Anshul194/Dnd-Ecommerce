// src/app/layout.js
import { Bebas_Neue } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./store/Providers"; // ✅ Updated path
import ClientLayout from "./ClientLayout";
import { ToastContainer } from "react-toastify";
import CheckoutPopup from "../components/CheckoutPopup";
import OrderPopup from "../components/OrderPopup";
export const metadata = {
  title: "DND - Ecommerce ",
  description: "Find the perfect good",
};

import { getDbConnection, getSubdomain } from "@/app/lib/tenantDb";
import { getCategories } from "@/app/lib/controllers/categoryController";
import { getSubCategories } from "@/app/lib/controllers/subCategoryController";

export default async function RootLayout({ children }) {
  // Fetch navbar categories server-side (SSG/ISR friendly)
  let categories = [];
  try {
    // In App Router layout, we are a server component so we can call controllers directly
    // This mirrors the logic in the API route but runs at render/build time.
    const fakeReq = undefined;
    const subdomain = getSubdomain(fakeReq);
    const conn = await getDbConnection(subdomain);
    if (conn) {
      const [catResult, subResult] = await Promise.all([
        getCategories({}, conn),
        getSubCategories({}, conn),
      ]);

      const extractItems = (res) => {
        if (!res) return [];
        if (res.status && res.body) {
          const d = res.body.data;
          if (!d) return [];
          if (Array.isArray(d)) return d;
          if (d.result && Array.isArray(d.result)) return d.result;
          if (d.status && d.body && d.body.data) {
            const inner = d.body.data;
            if (Array.isArray(inner)) return inner;
            if (inner.result && Array.isArray(inner.result))
              return inner.result;
          }
          return Array.isArray(d) ? d : [];
        }
        if (Array.isArray(res)) return res;
        if (res.result && Array.isArray(res.result)) return res.result;
        if (res.body && res.body.data && Array.isArray(res.body.data))
          return res.body.data;
        return [];
      };

      const normCategories = extractItems(catResult).map((c) => {
        if (c._doc) c = c._doc;
        if (c.body && c.body.data) c = c.body.data;
        if (c._id && !c.id) {
          try {
            c.id = String(c._id);
          } catch (e) {
            c.id = c._id;
          }
        }
        const cleaned = {};
        for (const key of Object.keys(c)) {
          if (key === "__v") continue;
          if (key.startsWith("$")) continue;
          cleaned[key] = c[key];
        }
        return cleaned;
      });

      const normSubcategories = extractItems(subResult).map((s) => {
        if (s._doc) s = s._doc;
        if (s.body && s.body.data) s = s.body.data;
        if (s._id && !s.id) {
          try {
            s.id = String(s._id);
          } catch (e) {
            s.id = s._id;
          }
        }
        const cleaned = {};
        for (const key of Object.keys(s)) {
          if (key === "__v") continue;
          if (key.startsWith("$")) continue;
          cleaned[key] = s[key];
        }
        return cleaned;
      });

      const map = new Map();
      normCategories.forEach((c) => {
        const id = String(c.id || c._id || "");
        map.set(id, { ...c, subcategories: [] });
      });

      normSubcategories.forEach((s) => {
        const parentId = String(
          s.parentCategory ||
            s.parent_category ||
            (s.parent && (s.parent.id || s.parent._id)) ||
            ""
        );
        if (!parentId) return;
        const parent = map.get(parentId);
        if (parent) parent.subcategories.push(s);
      });

      categories = normCategories.map((c) => map.get(String(c.id || c._id)));
    }
  } catch (err) {
    // swallow — we don't want layout render to crash if categories fail (fallback to client)
    console.error("Error fetching navbar categories in layout:", err);
    categories = [];
  }

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
          <ClientLayout initialCategories={categories}>
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
            {children ?? null}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
