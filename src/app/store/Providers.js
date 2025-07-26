// src/app/store/Providers.js
"use client";

import { Provider } from "react-redux";
import store from "./index"; // points to store configuration

export default function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}