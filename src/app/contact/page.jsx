"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Send, CheckCircle } from "lucide-react";
import axiosInstance from "@/axiosConfig/axiosInstance";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Basic client-side validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in name, email and message.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      };
      const response = await axiosInstance.post("/contact", payload);
      // axiosInstance returns response.data
      if (response?.data?.success) {
        setStatus("Thanks! Your message has been received.");
        setName("");
        setEmail("");
        setMessage("");
        // hide success after a while
        setTimeout(() => setStatus(null), 5000);
      } else {
        setError(response?.data?.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      // Prefer server message when available
      const msg =
        err?.response?.data?.message || err?.message || "Server error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Get In <span className="text-[#3C950D]">Touch</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-100 hover:border-[#3C950D] group">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-[#3C950D] to-[#2d7009] p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Email Us
                  </h3>
                  <a
                    href="mailto:support@bharatgramudyogsangh.org"
                    className="text-[#3C950D] hover:text-[#2d7009] font-medium break-all transition-colors"
                  >
                    support@bharatgramudyogsangh.org
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-100 hover:border-[#3C950D] group">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-[#3C950D] to-[#2d7009] p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Call Us
                  </h3>
                  <a
                    href="tel:+918708944266"
                    className="text-[#3C950D] hover:text-[#2d7009] font-medium text-xl transition-colors"
                  >
                    +91-8708944266
                  </a>
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="hidden md:block bg-gradient-to-br from-[#3C950D]/10 to-[#2d7009]/5 rounded-2xl p-8 border-2 border-[#3C950D]/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Contact Us?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-[#3C950D] rounded-full"></div>
                  <span>Quick response time</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-[#3C950D] rounded-full"></div>
                  <span>Dedicated support team</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-[#3C950D] rounded-full"></div>
                  <span>Expert guidance</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Send us a <span className="text-[#3C950D]">Message</span>
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-50 border-2 border-gray-200 focus:border-[#3C950D] focus:ring-[#3C950D] text-gray-900 placeholder:text-gray-400 h-12 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-50 border-2 border-gray-200 focus:border-[#3C950D] focus:ring-[#3C950D] text-gray-900 placeholder:text-gray-400 h-12 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  placeholder="Tell us what you'd like to discuss..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full resize-none rounded-lg bg-gray-50 border-2 border-gray-200 focus:border-[#3C950D] focus:ring-2 focus:ring-[#3C950D]/20 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-colors"
                />
              </div>

              {status && (
                <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{status}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#3C950D] to-[#2d7009] hover:from-[#2d7009] hover:to-[#3C950D] text-white font-semibold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
              >
                <span>{loading ? "Sending..." : "Send Message"}</span>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
