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
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the token
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post("/api/auth/refresh-token", {
            refreshToken: refreshToken
          }, {
            headers: {
              "Content-Type": "application/json",
              "x-tenant": getTenantFromURL(),
            }
          });

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
            
            // Update stored tokens
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            localStorage.setItem("user", JSON.stringify(user));

            // Update the original request with new token
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            originalRequest.headers["x-access-token"] = accessToken;
            originalRequest.headers["x-refresh-token"] = newRefreshToken;

            // Retry the original request
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      // If refresh fails or no refresh token, clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Redirect to login page with current page as redirect parameter
      // if (typeof window !== 'undefined') {
      //   const currentPath = window.location.pathname + window.location.search;
      //   window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      // }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
