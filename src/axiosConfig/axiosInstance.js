"use client";

import { getTenantFromURL } from "@/app/utils/getTenantFromURL";
import axios from "axios";

// API base URL

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-tenant": getTenantFromURL(),
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["x-access-token"] = token;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        config.headers["x-refresh-token"] = refreshToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle 401 Unauthorized errors
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      // You can add redirect logic here if needed
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
