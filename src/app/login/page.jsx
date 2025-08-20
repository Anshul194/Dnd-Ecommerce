"use client";
import { useState } from "react";
import { Eye, EyeOff, Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { login, signUp } from "../store/slices/authSlice";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }
    try {
      await dispatch(login({ ...formData })).unwrap();
      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Welcome Section */}
        <div className="flex-1 bg-gradient-to-br from-green-500 to-green-600 p-12 text-white flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="text-3xl font-bold">🍃 TEABOX</div>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Welcome to the World of Fresh Indian Tea's!
            </h1>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-3">
                <Star className="w-6 h-6 text-yellow-300 mr-2" />
                <h3 className="font-semibold text-lg">
                  Fresh Teas Direct from Source
                </h3>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-3">
                <Star className="w-6 h-6 text-yellow-300 mr-2" />
                <h3 className="font-semibold text-lg">
                  Shipped to over 125+ countries
                </h3>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-3">
                <Star className="w-6 h-6 text-yellow-300 mr-2" />
                <h3 className="font-semibold text-lg">
                  Approved by 10k+ tea lovers
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-gray-50">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Login now</h2>
            <p className="text-gray-600 mb-8">
              Login to your account to explore our exclusive range of fresh
              Indian teas and enjoy a delightful tea experience.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                  I accept that I have read & understood TeaBox's{" "}
                  <a
                    href="#"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    T&Cs
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!acceptTerms}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-green-600 hover:text-green-700 font-medium underline"
                >
                  Sing up here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
