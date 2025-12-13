"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  fetchCoupons,
  applyCoupon,
  clearSelectedCoupon,
} from "@/app/store/slices/couponSlice";
import {
  updateCartItemQuantity,
  getCartItems,
} from "@/app/store/slices/cartSlice";
import { placeOrder } from "@/app/store/slices/checkOutSlice";
import { sendOtp, verifyOtp } from "@/app/store/slices/authSlice";
import axiosInstance from "@/axiosConfig/axiosInstance";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems = [], total = 0 } = useSelector((state) => state.cart);
  const {
    items: coupons = [],
    selectedCoupon = null,
    discount = 0,
  } = useSelector((state) => state.coupon);
  const { settings } = useSelector((state) => state.setting);

  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    dispatch(fetchCoupons());
    dispatch(getCartItems());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        phone: user.phone || "",
        name: user.name || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateQuantity = async (itemId, change) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) return;

    await dispatch(
      updateCartItemQuantity({
        itemId: item.id,
        quantity: newQuantity,
      })
    );
    dispatch(getCartItems());
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await dispatch(
        applyCoupon({ code: couponCode, cartTotal: itemsTotal })
      ).unwrap();
      setCouponCode("");
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error(error || "Failed to apply coupon");
    }
  };

  const handleSelectCoupon = async (coupon) => {
    if (selectedCoupon?._id === coupon._id) {
      dispatch(clearSelectedCoupon());
    } else {
      try {
        await dispatch(
          applyCoupon({ code: coupon.code, cartTotal: itemsTotal })
        ).unwrap();
        toast.success("Coupon applied successfully!");
      } catch (error) {
        toast.error(error || "Failed to apply coupon");
      }
    }
  };

  const calculateShipping = () => {
    if (itemsTotal > 500) return 0;
    if (paymentMethod === "cod") {
      return settings?.codShippingChargeBelowThreshold || 80;
    } else {
      return settings?.prepaidShippingChargeBelowThreshold || 50;
    }
  };

  const itemsTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = calculateShipping();
  const grandTotal = itemsTotal - discount + shipping;

  const loadRazorpayScript = () => {
    if (typeof window === "undefined")
      return Promise.reject(new Error("Window is undefined"));
    if (document.getElementById("razorpay-sdk")) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => {
        console.error("Failed to load Razorpay script", err);
        reject(err);
      };
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.phone || !formData.name || !formData.address || !formData.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const payload = {
        userId: user?._id,
        paymentMode: paymentMethod === "cod" ? "COD" : "Prepaid",
        items: cartItems.map((item) => ({
          product: item.product?._id || item.product?.id,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant,
        })),
        total: itemsTotal,
        shippingAddress: {
          fullName: formData.name,
          addressLine1: formData.address,
          addressLine2: "",
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: "India",
          phoneNumber: formData.phone,
        },
        billingAddress: {
          fullName: formData.name,
          addressLine1: formData.address,
          addressLine2: "",
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: "India",
          phoneNumber: formData.phone,
        },
        deliveryOption: "standard_delivery",
      };

      if (selectedCoupon) {
        payload.coupon = selectedCoupon._id;
        payload.discount = discount;
      }

      if (paymentMethod === "prepaid") {
        await loadRazorpayScript();

        const options = {
          key: "rzp_test_1DP5mmOlF5G5ag",
          amount: grandTotal * 100,
          currency: "INR",
          name: "Tea Box",
          description: "Order Payment",
          handler: async (response) => {
            try {
              payload.paymentId = response.razorpay_payment_id;
              payload.paymentDetails = response.razorpay_payment_id;
              await dispatch(placeOrder(payload));
              router.push("/order-success?Order_status=success");
            } catch (error) {
              toast.error("Order placement failed. Please contact support.");
              router.push("/checkout?Order_status=failure");
            }
          },
          prefill: {
            email: user?.email || "",
            contact: formData.phone,
          },
          theme: {
            color: "#3c950d",
          },
          modal: {
            ondismiss: function () {
              toast.info("Payment cancelled");
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        await dispatch(placeOrder(payload));
        router.push("/order-success?Order_status=success");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Checkout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-1">
                Hi {formData.name || "there"}, welcome!
              </h2>
              <p className="text-sm text-gray-500 mb-4">Enter Contact Details</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-blue-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-blue-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <h3 className="font-semibold mb-3">Shipping details</h3>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="w-full px-4 py-3 bg-blue-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Pincode"
                  className="w-full px-4 py-3 bg-blue-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full px-4 py-3 bg-blue-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                className="w-full px-4 py-3 bg-blue-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mt-4"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Choose Payment Method</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 border-2 rounded-lg text-center ${
                    paymentMethod === "upi"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-xs font-medium">UPI</div>
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 border-2 rounded-lg text-center ${
                    paymentMethod === "card"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-xs font-medium">Credit/Debit Card</div>
                </button>
                <button
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-4 border-2 rounded-lg text-center ${
                    paymentMethod === "wallet"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">👛</div>
                  <div className="text-xs font-medium">Wallets</div>
                </button>
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 border-2 rounded-lg text-center ${
                    paymentMethod === "cod"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">💵</div>
                  <div className="text-xs font-medium">Cash On Delivery</div>
                </button>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                PLACE ORDER • ₹{grandTotal.toFixed(2)}
              </button>

              <div className="mt-4 text-center text-xs text-gray-500">
                100% SECURE PAYMENTS
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item?.product?.image?.url || "/placeholder.png"}
                        alt={item?.product?.name || "Product"}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">
                        {item?.product?.name}
                      </h3>
                      <p className="text-lg font-semibold">₹{item?.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item?.id, -1)}
                        className="w-6 h-6 border rounded flex items-center justify-center"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center">{item?.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item?.id, 1)}
                        className="w-6 h-6 border rounded flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupons */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Coupons</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon code"
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium"
                  >
                    APPLY
                  </button>
                </div>

                {coupons.length > 0 && (
                  <div className="space-y-2">
                    {coupons.slice(0, 2).map((coupon) => (
                      <button
                        key={coupon._id}
                        onClick={() => handleSelectCoupon(coupon)}
                        className={`w-full p-3 text-left rounded-md border text-sm ${
                          selectedCoupon?._id === coupon._id
                            ? "bg-green-50 border-green-500"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="font-semibold">{coupon.code}</div>
                        <div className="text-xs text-gray-600">
                          {coupon.type === "percent"
                            ? `${coupon.value}% OFF`
                            : `₹${coupon.value} OFF`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Total MRP:</span>
                  <span>₹{itemsTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
