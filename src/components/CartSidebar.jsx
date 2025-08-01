"use client";
import React, { useEffect, useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  getCartItems,
  removeItemFromCart,
  toggleCart,
  updateCartItemQuantity,
} from "@/app/store/slices/cartSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";

const CartSidebar = () => {
  const dispatch = useDispatch();
  const {
    loading,
    isCartOpen = false,
    cartItems,
    cartId,
    total = 0,
  } = useSelector((state) => state.cart);

  const route = useRouter();

  const shipping = 65;

  const handelCartToggle = () => {
    dispatch(toggleCart());
  };

  const removeItem = async (cartId) => {
    await dispatch(removeItemFromCart(cartId));
    dispatch(getCartItems());
  };

  const updateQuantity = async (itemId, change) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      // await removeItem(itemId);
      return;
    } else {
      await dispatch(
        updateCartItemQuantity({
          itemId: item.id,
          quantity: newQuantity,
        })
      );
      dispatch(getCartItems());
    }
  };

  const handelRedirect = (e, item) => {
    e.preventDefault();
    route.push(`/product-detail/${item?.product?.id}`);
  };

  // Fetch cart items whenever the cart sidebar is opened
  useEffect(() => {
    if (isCartOpen) {
      dispatch(getCartItems());
    }
  }, [isCartOpen, dispatch]);

  if (!loading && !isCartOpen) {
    return null;
  }

  console.log("Cart Items:", cartItems);

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/5 bg-opacity-50"
        onClick={handelCartToggle}
      />

      {/* Cart Sidebar */}
      <div className="w-full max-w-md bg-white text-black h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-green-500 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">MY CART</h2>
          <button
            onClick={handelCartToggle}
            className="p-1 hover:bg-green-600 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Trust Badge */}
        <div className="bg-gray-100 px-6 py-3 flex items-center justify-between border-b">
          <span className="text-sm text-gray-700">
            Trusted by 4 Lakh+ Customers
          </span>
          <span className="text-gray-400">▶</span>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Cart Items */}
          <div className="p-6">
            {cartItems?.length > 0 ? (
              cartItems.map((item, index) => (
                <div
                  key={index}
                  onClick={(e) => handelRedirect(e, item)}
                  className="flex items-center cursor-pointer gap-4 pb-6 border-b border-gray-200"
                >
                  <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <div className="w-12 h-16 bg-white rounded-sm overflow-hidden shadow-sm flex items-center justify-center">
                        {item?.product ? (
                          <Image
                            src={item?.product?.image}
                            alt={item?.product?.name || "Product"}
                            width={48}
                            height={64}
                            className="object-cover h-full w-full "
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 leading-tight">
                          {item?.product?.name}
                        </h3>
                        {/* <p className="text-xs text-gray-500 mt-1">
                        {item.weight}
                      </p> */}
                      </div>
                      <button
                        onClick={() => removeItem(item?.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item?.id, -1)}
                          className={`${
                            item?.quantity === 1
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item?.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item?.id, 1)}
                          className={`${
                            item?.quantity === item?.product?.stock
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-lg font-semibold">
                        ₹ {item?.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="mt-[40%] w-full flex items-center justify-center">
                <h2 className="text-gray-500/20 font-semibold text-2xl">
                  Your cart is empty
                </h2>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`${
            cartItems?.length > 0 ? "" : "opacity-40 cursor-not-allowed"
          } *: border-t bg-white p-6 space-y-4`}
        >
          {/* Shipping */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Shipping</span>
            <div className="text-right">
              <span className="text-gray-500 line-through text-sm">₹65</span>
              <span className="text-green-500 font-semibold ml-2">FREE</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center text-xl font-semibold">
            <span>Total</span>
            <span>₹ {total.toLocaleString()}</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => {
              if (cartItems?.length > 0) {
                route.push("/checkout");
                dispatch(toggleCart());
              }
            }}
            className="w-full bg-green-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors"
          >
            Proceed to Checkout 🔒
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
