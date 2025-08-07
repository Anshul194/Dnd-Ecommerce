"use client";
import { useEffect, useState } from "react";
import { fetchOrders } from "../store/slices/orderSlice";
import { useDispatch, useSelector } from "react-redux";

export default function YourOrders() {
  const [activeTab, setActiveTab] = useState("Orders");
  const { orders, loading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const tabData = {
    Orders: {
      count: 7,
      status: "Product is shipped and will be delivered soon",
      date: "20/07/2025",
    },
    "Buy Again": {
      count: 3,
      status: "Available for repurchase",
      date: "Order again anytime",
    },
    "Not Yet Shipped": {
      count: 2,
      status: "Order is being prepared for shipment",
      date: "22/07/2025",
    },
    "Cancelled orders": {
      count: 1,
      status: "Order was cancelled on your request",
      date: "Refund processed",
    },
  };

  useEffect(() => {
    // Fetch orders when the component mounts
    dispatch(
      fetchOrders({
        userId: "6891d1240f35f119d4f7425b",
      })
    );
  }, [dispatch]);
  //   console.log("Orders:", orders);
  //  console.log("user is ==>", user);
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-4">Your Orders</h1>

          {/* Filter Tabs */}
          <div className="flex gap-6 text-sm text-nowrap overflow-x-scroll mb-6">
            <button
              onClick={() => setActiveTab("Orders")}
              className={
                activeTab === "Orders"
                  ? "text-black font-medium border-b-2 border-black pb-1"
                  : "text-gray-500 hover:text-black"
              }
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("Buy Again")}
              className={
                activeTab === "Buy Again"
                  ? "text-black font-medium border-b-2 border-black pb-1"
                  : "text-gray-500 hover:text-black"
              }
            >
              Buy Again
            </button>
            <button
              onClick={() => setActiveTab("Not Yet Shipped")}
              className={
                activeTab === "Not Yet Shipped"
                  ? "text-black font-medium border-b-2 border-black pb-1"
                  : "text-gray-500 hover:text-black"
              }
            >
              Not Yet Shipped
            </button>
            <button
              onClick={() => setActiveTab("Cancelled orders")}
              className={
                activeTab === "Cancelled orders"
                  ? "text-black font-medium border-b-2 border-black pb-1"
                  : "text-gray-500 hover:text-black"
              }
            >
              Cancelled orders
            </button>
          </div>

          {/* Orders Count */}
          <p className="text-sm text-black font-medium mb-6">
            {tabData[activeTab].count} orders found
          </p>
        </div>

        <div className="border-2 rounded-lg border-gray-300">
          {/* Order Summary Bar */}
          <div className="bg-gray-100 rounded-lg p-4 flex flex-col md:flex-row gap-3 justify-between md:items-center">
            <div className="flex gap-4 justify-between md:justify-start">
              <div>
                <div className="text-sm text-gray-600">Orders Placed</div>
                <div className="text-sm font-medium text-black">
                  26 May 2025
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-sm font-medium text-black">₹289.00</div>
              </div>
            </div>
            <div className="text-start md:text-right">
              <div className="text-sm text-gray-600">
                Orders Placed{" "}
                <span className="text-xs"># order id#5796348, 576315</span>
              </div>
              <div className="flex gap-4 justify-between mt-1">
                <button className="text-blue-600 text-xs hover:underline">
                  View Order Details
                </button>
                <button className="text-blue-600 text-xs hover:underline">
                  Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Product Card */}
          <div className=" rounded-lg p-6">
            <div className="flex gap-6 flex-col md:flex-row items-start">
              {/* Product Image Placeholder */}
              <div className="h-44 md:aspect-square md:max-w-56 w-full bg-gray-200 rounded-lg flex-shrink-0 relative">
                {/* NEW badge */}
                <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  NEW
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-black mb-3">
                  Lorem ipsum dolor sit amet
                </h2>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span className="text-gray-300">★</span>
                  </div>
                  <span className="text-sm text-gray-600">939 Reviews</span>
                </div>

                {/* See Button */}
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm font-medium">
                  See
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200 text-xs text-gray-600">
              <span>{tabData[activeTab].status}</span>
              <span>
                Estimated Delivery date:{" "}
                <span className="font-medium text-black">
                  {tabData[activeTab].date}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
