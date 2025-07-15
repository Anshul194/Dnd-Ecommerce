import axiosInstance from "@/axiosConfig/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Add this declaration to extend ImportMeta for Vite env support

const parseStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};
const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Network error";
  }
  return error instanceof Error ? error.message : "Unknown error";
};

const initialState = {
  user: parseStoredUser(),
  token: null,
  isAuthenticated: !!parseStoredUser(),
  status: "idle",
  error: null,
  loginStatus: "idle",
  signupStatus: "idle",
  logoutStatus: "idle",
  profileUpdateStatus: "idle",
  passwordResetStatus: "idle",
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/login`,
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data?.data;
      console.log("Login response:", data);
      // Store tokens in localStorage
      if (data?.accessToken) {
        localStorage.setItem("token", data?.accessToken);
        localStorage.setItem("accessToken", data?.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data?.refreshToken);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data?.user));
      }

      return {
        user: data?.user,
        accessToken: data?.accessToken,
        refreshToken: data?.refreshToken,
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Trying to sign up with data:", userData);
      console.log("API Base URL:", API_BASE_URL);
      const response = await axiosInstance.post(
        `${API_BASE_URL}/signup`,
        {
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          role: "student",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Signup response:", response);

      const data = response.data;

      console.log("Signup data:", data);
      // Store tokens in localStorage
      if (data?.data?.accessToken) {
        localStorage.setItem("token", data?.data?.accessToken);
        localStorage.setItem("accessToken", data?.data?.accessToken);
      }
      if (data?.data?.refreshToken) {
        localStorage.setItem("refreshToken", data?.data?.refreshToken);
      }
      if (data?.data?.user) {
        localStorage.setItem("user", JSON.stringify(data?.data?.user));
      }

      return {
        user: data?.data?.user,
        accessToken: data?.data?.accessToken,
        refreshToken: data?.data?.refreshToken,
      };
    } catch (error) {
      console.log("tring signup", error.message);
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/user_auth/sendotp`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/user_auth/verifyotp`,
        { email, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data.data;
      console.log("Verify OTP response:", response);
      console.log("Verify OTP response: --->", data);

      localStorage.setItem("accessToken", data?.accessToken);
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data?.refreshToken);
      }
      await fetchCurrentUser();

      return {
        user: data?.user,
        accessToken: data?.accessToken,
        refreshToken: data?.refreshToken,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      // Clear all tokens
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      // Clear tokens even on error
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token =
        state.auth.token ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const response = await axiosInstance.put(
        `${API_BASE_URL}/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data?.data || response.data;

      // Update user in localStorage
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return { user: data.user };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token =
        state.auth.token ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const response = await axiosInstance.get(`/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data?.data || response.data;

      // Update user in localStorage
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return { user: data.user || data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token =
        state.auth.token ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const response = await axiosInstance.post(
        `${API_BASE_URL}/change-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Change password response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStatuses: (state) => {
      state.loginStatus = "idle";
      state.signupStatus = "idle";
      state.logoutStatus = "idle";
      state.profileUpdateStatus = "idle";
      state.passwordResetStatus = "idle";
    },
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.isAuthenticated = true;

      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(user));
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loginStatus = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginStatus = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })

      // Signup
      .addCase(signup.pending, (state) => {
        state.signupStatus = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.signupStatus = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.signupStatus = "failed";
        state.error = action.payload || "Signup failed";
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(logout.pending, (state) => {
        state.logoutStatus = "loading";
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.logoutStatus = "succeeded";
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;

        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      })
      .addCase(logout.rejected, (state, action) => {
        state.logoutStatus = "failed";
        state.error = action.payload || "Logout failed";
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdateStatus = "loading";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileUpdateStatus = "succeeded";
        state.user = action.payload.user;
        state.error = null;

        // Update user in localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdateStatus = "failed";
        state.error = action.payload || "Profile update failed";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;

        // Update user in localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch current user";
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(sendOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to send OTP";
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to verify OTP";
      });
  },
});

export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectLoginStatus = (state) => state.auth.loginStatus;
export const selectSignupStatus = (state) => state.auth.signupStatus;
export const selectLogoutStatus = (state) => state.auth.logoutStatus;
export const selectProfileUpdateStatus = (state) =>
  state.auth.profileUpdateStatus;
export const selectPasswordResetStatus = (state) =>
  state.auth.passwordResetStatus;

export const { clearError, clearStatuses, setCredentials, clearCredentials } =
  authSlice.actions;
export default authSlice.reducer;
