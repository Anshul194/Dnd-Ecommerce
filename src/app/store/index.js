// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import attributeReducer from "./slices/attributeSlice";
import brandReducer from "./slices/brandSlice";
import categoryReducer from "./slices/categorySlice";
import planReducer from "./slices/planSlice";
import productReducer from "./slices/productSlice";
import subCategoryReducer from "./slices/subCategorySlice";
import tenantReducer from "./slices/tenantSlice";
import variantReducer from "./slices/variantSlice";
import cartReducer from "./slices/cartSlice";
import couponReducer from "./slices/couponSlice";
import blogSlice from "./slices/blogSclie";
import checkoutSlice from "./slices/checkOutSlice";
import orderSlice from "./slices/orderSlice";
import supportTicketSlice from "./slices/supportTicketSlice";
import orderReducer from "./slices/orderSlice";
import contentReducer from "./slices/contentSlice";
import wishlistReducer from "./slices/wishlistSlice";
import faq from "./slices/faqSlice";
import settingSlice from "./slices/settingSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    attribute: attributeReducer,
    brand: brandReducer,
    cart: cartReducer, // Assuming you have a cartSlice
    category: categoryReducer,
    plan: planReducer,
    product: productReducer,
    subCategory: subCategoryReducer,
    tenant: tenantReducer,
    variant: variantReducer,
    coupon: couponReducer,
    blogs: blogSlice,
    checkout: checkoutSlice,
    order: orderSlice,
    supportTicket: supportTicketSlice,
    orders: orderReducer,
    wishlist: wishlistReducer,
    content: contentReducer,
    faq: faq,
    setting: settingSlice,
  },
});

export default store;
