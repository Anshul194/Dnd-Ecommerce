"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  LogOut,
  User,
  FileText,
} from "lucide-react";

// Import dashboard components
import Dashboard from "../../components/dashboard/Dashboard";
import Orders from "../../components/dashboard/Orders";
import Addresses from "../../components/dashboard/Addresses";
import Wishlist from "../../components/dashboard/Wishlist";
import AccountDetails from "../../components/dashboard/AccountDetails";
import SupportTickets from "../../components/dashboard/SupportTickets";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/common/Loading";

export function SidebarDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const { user } = useSelector((state) => state.auth ?? {});

  // Get active tab from URL on component mount
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      setActiveComponent(tabFromUrl);
    }

    () => {
      setActiveComponent("dashboard");
      searchParams.delete("tab");
    };
  }, [searchParams]);

  // Function to handle tab change and update URL
  const handleTabChange = (component) => {
    setActiveComponent(component);
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("tab", component);
    router.replace(newUrl.pathname + newUrl.search);
  };

  const sidebarItems = [
    { icon: ShoppingBag, label: "Orders", component: "orders" },
    { icon: MapPin, label: "Addresses", component: "addresses" },
    { icon: Heart, label: "Wishlist", component: "wishlist" },
    { icon: Settings, label: "Account Details", component: "account-details" },
    { icon: FileText, label: "Support Ticket", component: "support-tickets" },
  ];

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "orders":
        return <Orders />;
      case "addresses":
        return <Addresses />;
      case "wishlist":
        return <Wishlist />;
      case "account-details":
        return <AccountDetails />;
      case "support-tickets":
        return <SupportTickets />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          {/* User Profile */}
          <div className="flex flex-col gap-3 items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-center text-gray-900">
                {typeof user?.name === "string" && user?.name.trim() !== ""
                  ? user.name
                  : "User"}
              </h3>
              <p className="text-xs text-gray-500">
                {typeof user?.email === "string" && user?.email.trim() !== ""
                  ? user.email
                  : ""}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full text-left ${
                activeComponent === "dashboard"
                  ? "bg-red-100 text-red-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-red-600"
              }`}
            >
              <User size={18} />
              <span className="font-medium">Dashboard</span>
            </button>

            {sidebarItems?.map((item, index) => (
              <button
                key={index}
                onClick={() => handleTabChange(item?.component ?? "")}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full text-left ${
                  activeComponent === item?.component
                    ? "bg-red-100 text-red-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-red-600"
                }`}
              >
                {item?.icon ? <item.icon size={18} /> : null}
                <span className="font-medium">{item?.label ?? ""}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 w-full">
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">{renderActiveComponent()}</div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SidebarDashboard />
    </Suspense>
  );
}
