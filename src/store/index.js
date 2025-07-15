"use client";
import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./slices/categorySlice";
import attributesReducer from "./slices/attributes";
import faqReducer from "./slices/faq";
import Product from "./slices/product";
import CartReducer from "./slices/cart";
import CheckOutReducer from "./slices/checkout";
import region from "./slices/region";
import authReducer from "./slices/auth";
import orderReducer from "./slices/myorders";
import sizeReducer from "./slices/size";
export const store = configureStore({
  reducer: {
    category: categoryReducer,
    attributes: attributesReducer,
    faq: faqReducer,
    product: Product,
    cart: CartReducer,
    checkout: CheckOutReducer,
    region: region,
    auth: authReducer,
    myOrders: orderReducer,
    size: sizeReducer,
  },
});
