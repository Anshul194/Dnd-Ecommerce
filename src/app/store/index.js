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
  },
});

export default store;
