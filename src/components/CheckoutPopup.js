"use client";

import React, { use, useEffect, useRef, useState } from "react";
import {
  X,
  Plus,
  Minus,
  MapPin,
  Phone,
  ArrowBigLeft,
  ArrowLeft,
  PencilLine,
  PhoneCall,
  Mail,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAddressFormLocalStorage,
  placeOrder,
  resetAddress,
  setAddress,
  setCheckoutClose,
} from "@/app/store/slices/checkOutSlice";
import {
  createUserAddress,
  getuserAddresses,
  sendOtp,
  setAuthenticated,
  setOtpSended,
  updateUserAddress,
  verifyOtp,
} from "@/app/store/slices/authSlice";
import Loading from "@/components/Loading";
import Image from "next/image";
import { applyCoupon } from "@/app/store/slices/couponSlice";
import { addToCart, clearCart } from "@/app/store/slices/cartSlice";
import { usePathname, useRouter } from "next/navigation";
import { fetchProducts } from "@/app/store/slices/productSlice";

export default function CheckoutPopup() {
  const checkoutOpen = useSelector((state) => state.checkout.checkoutOpen);
  const { addressData, addressAdded } = useSelector((state) => state.checkout);
  const { products } = useSelector((state) => state.product);
  const [userAddresses, setUserAddresses] = useState([]);
  const [addressType, setAddressType] = useState("");
  const router = useRouter();
  const location = usePathname();
  const { isAuthenticated, otpSended, loading, user } = useSelector(
    (state) => state.auth
  );
  const { cartItems, total = 0 } = useSelector((state) => state.cart);
  const { selectedCoupon } = useSelector((state) => state.coupon);
  console.log("Products ==> ", products);
  const [couponCode, setCouponCode] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const inputRefs = useRef([]); // Array of refs for each input field
  const [SelectedProduct, setSelectedProduct] = useState(null);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    pincode: "",
    firstName: "",
    lastName: "",
    flatNumber: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    email: "",
    addressType: "Home",
    phone: "",
  });
  const [otp, setOtp] = useState(Array(6).fill("")); // Array with 6 empty strings

  const handleSelectAddress = async (selectedIndex) => {
    if (selectedIndex === "" || selectedIndex === "default") return;

    const selectedAddress = userAddresses[parseInt(selectedIndex)];
    console.log("Selected Address:", JSON.stringify({ ...selectedAddress }));
    console.log("Selected Address Phone:", selectedAddress.phone);
    setFormData({
      pincode: selectedAddress.pincode || "",
      firstName: selectedAddress.firstName || "",
      lastName: selectedAddress.lastName || "",
      flatNumber: selectedAddress.line1 || "",
      area: selectedAddress.area || "",
      landmark: selectedAddress.line2 || "",
      city: selectedAddress.city || "",
      state: selectedAddress.state || "",
      email: selectedAddress.email || "",
      addressType: selectedAddress.addressType || "Home",
      phone: selectedAddress.phone || user?.phone || "",
    });
    dispatch(setAddress({ ...selectedAddress, phone: user?.phone }));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleKeyDown = (e) => {
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      const index = inputRefs.current.indexOf(e.target);
      if (index > 0) {
        setOtp((prevOtp) => [
          ...prevOtp.slice(0, index - 1),
          "",
          ...prevOtp.slice(index),
        ]);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleInput = (e) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    if (target.value) {
      setOtp((prevOtp) => [
        ...prevOtp.slice(0, index),
        target.value,
        ...prevOtp.slice(index + 1),
      ]);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(text)) {
      return;
    }
    const digits = text.split("");
    setOtp(digits);
  };

  const handleAddAddress = async () => {
    if (
      formData.pincode === "" ||
      formData.firstName === "" ||
      formData.lastName === "" ||
      formData.flatNumber === "" ||
      formData.area === "" ||
      formData.landmark === ""
    ) {
      alert("Please fill all required fields");
      return;
    }
    const data =
      localStorage.getItem("address") &&
      JSON.parse(localStorage.getItem("address"));
    console.log("checking addressData", data);
    if (data && data._id) {
      console.log("Updating existing address:", data._id);
      await dispatch(
        updateUserAddress({
          addressId: data._id,
          addressData: {
            user: user?._id,
            title: addressType || "Home",
            address: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              pincode: formData.pincode,
              line1: formData.flatNumber,
              line2: formData.landmark,
              landmark: formData.landmark,
              city: formData.city,
              state: formData.state,
            },
          },
        })
      );
    } else {
      await dispatch(
        createUserAddress({
          user: user?._id,
          title: addressType || "Home",
          address: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || user?.phone,
            pincode: formData.pincode,
            line1: formData.flatNumber,
            line2: formData.landmark,
            landmark: formData.landmark,
            city: formData.city,
            state: formData.state,
          },
        })
      );
    }
    // Structure the address data to match the expected format for display
    const addressStructure = {
      title: addressType || "Home",
      address: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || user?.phone,
        pincode: formData.pincode,
        line1: formData.flatNumber,
        line2: formData.landmark,
        landmark: formData.landmark,
        area: formData.area,
        city: formData.city,
        state: formData.state,
      },
    };
    await dispatch(setAddress(addressStructure));

    // Refresh user addresses after adding/updating
    if (isAuthenticated && user?._id) {
      try {
        const response = await dispatch(getuserAddresses(user._id));
        setUserAddresses(response.payload || []);
      } catch (error) {
        console.error("Error fetching user addresses:", error);
      }
    }
  };

  const handleSelectVariant = async (productId, variantId, quantity, price) => {
    await dispatch(
      addToCart({ product: productId, variant: variantId, quantity, price })
    );
    setSelectedProduct(null);
  };

  const handelPayment = async () => {
    try {
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag",
        amount: (total - (selectedCoupon?.discount || 0)) * 100, // Convert to paise
        currency: "INR",
        name: "Tea Box",
        description: "Slot Booking Fee",
        handler: async (response) => {
          try {
            const payload = {
              userId: user._id,
              items: cartItems.map((item) => ({
                product: item.product.id,
                quantity: item.quantity,
                price: item.price,
                variant: item.variant,
              })),
              total,
              paymentId: response.razorpay_payment_id,
              shippingAddress: {
                fullName: `${formData.firstName} ${formData.lastName}`,
                addressLine1: formData.flatNumber,
                addressLine2: formData.landmark,
                city: formData.city,
                state: formData.state,
                postalCode: formData.pincode,
                country: formData.country || "India",
                phoneNumber: formData.phone,
              },
              billingAddress: {
                fullName: `${formData.firstName} ${formData.lastName}`,
                addressLine1: formData.flatNumber,
                addressLine2: formData.landmark,
                city: formData.city,
                state: formData.state,
                postalCode: formData.pincode,
                country: formData.country || "India",
                phoneNumber: formData.phone,
              },
              paymentDetails: response.razorpay_payment_id,
              deliveryOption: "standard_delivery",
            };
            selectedCoupon && (payload.coupon = selectedCoupon.coupon._id);
            selectedCoupon && (payload.discount = selectedCoupon.discount);

            await dispatch(placeOrder(payload));
            dispatch(setCheckoutClose());
            dispatch(clearCart());
            router.push(location + "?Order_status=success");
          } catch (error) {
            console.error("Error booking slot:", error);
            toast.error("Booking failed. Please contact support.");
            router.push(location + "?Order_status=failure");
          }
        },
        prefill: {
          email: localStorage.getItem("userEmail") || "",
          contact: "",
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
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
    }
  };

  useEffect(() => {
    if (formData.phone.length === 10) {
      dispatch(sendOtp(formData.phone));
    }
  }, [formData.phone, dispatch]);

  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      dispatch(verifyOtp({ phone: formData.phone, otp: otp.join("") }));
    }
  }, [otp, dispatch, formData.phone]);

  useEffect(() => {
    // Only set form data from addressData if it exists and has actual data
    if (addressData && Object.keys(addressData).length > 0) {
      setFormData({
        pincode: addressData?.address?.pincode || "",
        firstName: addressData?.address?.firstName || "",
        lastName: addressData?.address?.lastName || "",
        flatNumber: addressData?.address?.line1 || "",
        area: addressData?.address?.area || "",
        landmark: addressData?.address?.line2 || "",
        city: addressData?.address?.city || "",
        state: addressData?.address?.state || "",
        email: addressData?.address?.email || "",
        addressType: addressData?.address?.addressType || "Home",
        phone: addressData?.address?.phone || "",
      });
      setAddressType(addressData?.title || "");
    }

    const fetchUserAddresses = async () => {
      if (isAuthenticated && user?._id) {
        try {
          const response = await dispatch(getuserAddresses(user._id));
          console.log("User addresses response:", response);

          setUserAddresses(response.payload || []);
        } catch (error) {
          console.error("Error fetching user addresses:", error);
        }
      }
    };

    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay script loaded");
      script.onerror = () => console.error("Failed to load Razorpay script");
      document.body.appendChild(script);
    };
    fetchUserAddresses();
    loadRazorpayScript();
  }, [addressData, isAuthenticated, user?._id, dispatch]);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [products, dispatch]);

  if (!checkoutOpen) return null;

  return (
    <div className="fixed inset-0 text-black bg-black/10 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[999] p-4">
      <div className="bg-[#f5f6fb]  shadow-xl w-full max-w-lg h-screen overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 bg-white rounded-t-lg relative">
          <button
            onClick={() => dispatch(setCheckoutClose())}
            className="absolute left-4 top-4 text-black rounded-full p-1"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-center text-lg font-semibold">Tea box</h1>
        </div>

        {/* Offer Banner */}
        <div className="bg-green-100 text-black text-center py-1 px-4 text-xs font-medium">
          Get Flat 5% Off On All Prepaid Orders
        </div>

        <div className="p-4 space-y-4">
          {/* Order Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center rounded-xl bg-white py-3 px-4">
              <h2 className="text-md font-medium">
                Order summary <span className="text-gray-600">(1 item)</span>
              </h2>
              <span className="text-sm font-medium">
                ₹{(total - (selectedCoupon?.discount || 0)).toFixed(2)}
              </span>
            </div>

            {/* Coupon Code */}
            {selectedCoupon ? (
              <div className="flex gap-2  justify-between items-center rounded-xl bg-white py-3 px-4">
                <div className="flex-1 relative ">
                  <h2 className="text-xs">
                    Code :{" "}
                    <span className="font-semibold">
                      {selectedCoupon.coupon?.code}
                    </span>
                  </h2>
                  <h2>
                    Discount :{" "}
                    <span className="font-semibold">
                      ₹{selectedCoupon?.discount}
                    </span>
                  </h2>
                </div>
                <button className="px-2 py-2 text-blue-600 text-sm font-medium">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2  justify-between items-center rounded-xl bg-white py-3 px-4">
                <div className="flex-1 relative ">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 bg-green-500 rounded-full text-white text-xs flex items-center justify-center">
                      %
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border-black/5 border-2 outline-none"
                  />
                </div>
                <button
                  onClick={() =>
                    dispatch(applyCoupon({ code: couponCode, total }))
                  }
                  className="px-2 py-2 text-blue-600 text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Items You May Like */}

          {!isAuthenticated && (
            <div className="flex  mt-6 flex-col justify-center gap-1 px-6">
              <h2 className="font-semibold text-center">
                {otpSended ? "Verify phone number" : "Enter mobile number"}
              </h2>
              <div className="text-xs text-center mb-2">
                {otpSended ? (
                  <div className="flex items-center justify-center gap-2">
                    Enter OTP sent to{" "}
                    <span className="font-semibold">
                      {formData.phone || "+91 9725398484"}
                    </span>
                    <div
                      onClick={() => {
                        setFormData({ ...formData, phone: "" });
                        setOtp(Array(6).fill(""));
                        dispatch(setOtpSended(false));
                      }}
                      className="h-fit ml-4  w-fit border-[1.2px] border-gray-300 rounded-md flex items-center justify-center"
                    >
                      <PencilLine size={12} className="m-1 text-blue-500" />
                    </div>
                  </div>
                ) : (
                  <h2>An OTP has been sent to your mobile number</h2>
                )}
              </div>

              {otpSended ? (
                <div>
                  <div
                    className={`${
                      loading && "opacity-40"
                    } mt-2 flex justify-center items-center gap-2`}
                  >
                    <form id="otp-form" className="flex gap-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={handleInput}
                          onKeyDown={handleKeyDown}
                          onFocus={handleFocus}
                          onPaste={handlePaste}
                          disabled={loading}
                          ref={(el) => (inputRefs.current[index] = el)}
                          className="shadow-xs flex w-[50px] h-[50px] items-center justify-center rounded-lg border-[1px] border-gray-300 border-stroke bg-white p-2 text-center text-xl font-medium text-gray-5 outline-none sm:text-4xl dark:border-dark-3 dark:bg-white/5"
                        />
                      ))}
                      {/* You can conditionally render a submit button here based on otp length */}
                    </form>
                  </div>
                  <h2 className="text-xs mt-4 text-center">
                    Resend OTP via{" "}
                    <span
                      onClick={() => {
                        dispatch(sendOtp(formData.phone));
                      }}
                      className="ml-2 rounded-sm font-semibold cursor-pointer text-blue-500 px-1 border-1 border-blue-500"
                    >
                      SMS
                    </span>
                  </h2>

                  <div className=" flex items-center justify-center mt-4">
                    <input
                      type="checkbox"
                      id="keepLoggedIn"
                      className="mr-2 h-4 w-4"
                      onChange={() => setIsLogged(!isLogged)}
                    />

                    <label
                      htmlFor="keepLoggedIn"
                      className="text-xs font-medium"
                    >
                      Keep me logged in on this device.
                    </label>
                  </div>

                  {loading && (
                    <div className="mt-4">
                      <Loading />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div
                    className={`relative  group w-full flex bg-white  py-0 h-11 border-[1px] ${
                      activeField === "phone"
                        ? "border-blue-600"
                        : "border-gray-300"
                    } rounded-md`}
                  >
                    <div
                      className={`${
                        loading && "opacity-40"
                      } border-r-[1px] w-fit px-4 h-full flex justify-center items-center border-gray-2400`}
                    >
                      +91
                    </div>

                    <input
                      type="text"
                      name="phone"
                      placeholder="10 digit mobile number"
                      value={formData.phone}
                      disabled={loading}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("phone")}
                      onBlur={() => setActiveField(null)}
                      className={`${
                        loading && "opacity-40"
                      } outline-none text-md  px-4 w-full border-0 h-full `}
                    />
                  </div>
                  {loading && (
                    <div className="mt-4">
                      <Loading />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {isAuthenticated && (
            <div className="space-y-3 rounded-xl bg-white py-3 px-4">
              <h3 className="font-semibold text-md">Items </h3>
              <div className="flex gap-3 w-full overflow-x-scroll">
                {/* Product 1 */}
                {cartItems?.length > 0 &&
                  cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="rel flex border-[1px] border-black/10 gap-2 rounded-lg p-3"
                    >
                      <div className="w-14 h-full  rounded-sm overflow-hidden mb-2 flex items-center justify-center">
                        <Image
                          src={item?.product?.image.url}
                          alt={item?.product?.image.alt || "Product"}
                          width={56}
                          height={64}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <div className="w-fit">
                        <p className="text-xs w-40 text-gray-600 mb-1">
                          {item?.product?.name} X {item?.quantity}
                        </p>
                        <span className="font-extrabold text-sm ">
                          ₹
                          {parseFloat(item?.price) *
                            parseFloat(item?.quantity).toFixed(2)}
                        </span>
                        <div className="flex w-fit ml-auto -mt-3 items-center gap-1 font-medium rounded-sm px-1 py-[2px] border-[1.5px] border-blue-600 text-blue-600 text-xs">
                          <Plus className="h-3 w-3" />
                          <h3>3 options</h3>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {/* Add Shipping Address */}
          {isAuthenticated && (
            <div>
              {addressAdded ? (
                <div className="space-y-4 rounded-xl bg-white py-3 px-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold mb-4">Delivery details</h3>
                    <h2
                      className="text-blue-600 text-sm font-medium cursor-pointer"
                      onClick={() => {
                        dispatch(resetAddress());
                        // localStorage.removeItem("address");
                        // setFormData({
                        //   pincode: "",
                        //   firstName: "",
                        //   lastName: "",
                        //   flatNumber: "",
                        //   area: "",
                        //   landmark: "",
                        //   city: "",
                        //   state: "",
                        //   email: "",
                        //   addressType: "Home",
                        //   phone: user?.phone || "",
                        // });
                      }}
                    >
                      Change
                    </h2>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-semibold">
                        {(addressData?.address?.firstName || "") +
                          " " +
                          (addressData?.address?.lastName || "")}
                      </h2>
                      <h2 className="bg-blue-300 px-1 text-xs rounded-full font-medium">
                        {addressData?.title || "Home"}
                      </h2>
                    </div>
                    <p>
                      {[
                        addressData?.address?.line1,
                        addressData?.address?.line2,
                        addressData?.address?.city,
                        addressData?.address?.state,
                        addressData?.address?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    <div className="flex items-center gap-4 mt-2  text-black/80">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneCall className="h-3 w-3" />
                        <h2>
                          {addressData?.address?.phone || user?.phone || ""}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-3 w-3" />
                        <h2>{addressData?.address?.email || ""}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-xl bg-white py-3 px-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold ">Add shipping address</h3>
                    <select
                      onChange={(e) => handleSelectAddress(e.target.value)}
                      className="text-sm w-1/3 font-medium text-black px-2 py-1 border rounded-md cursor-pointer outline-none"
                      defaultValue="default"
                    >
                      <option value="default" disabled>
                        Select Address
                      </option>
                      {userAddresses?.length > 0 &&
                        userAddresses.map((address, index) => (
                          <option
                            key={index}
                            className="outline-none border-none"
                            value={index}
                          >
                            {address.title || `Address ${index + 1}`}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div
                    className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                      activeField === "pincode"
                        ? "border-blue-600"
                        : "border-gray-300"
                    } rounded-md`}
                  >
                    <h2
                      className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                        activeField === "pincode" || formData.pincode !== ""
                          ? "-translate-y-6"
                          : "translate-y-0"
                      }`}
                    >
                      Pincode{" "}
                      <span
                        className={
                          activeField === "pincode"
                            ? "text-red-500"
                            : "text-black"
                        }
                      >
                        *
                      </span>
                    </h2>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("pincode")}
                      onBlur={() => setActiveField(null)}
                      className="outline-none text-md   w-full border-0 h-full "
                    />
                  </div>
                  <div
                    className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                      activeField === "firstName"
                        ? "border-blue-600"
                        : "border-gray-300"
                    } rounded-md`}
                  >
                    <h2
                      className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                        activeField === "firstName" || formData.firstName !== ""
                          ? "-translate-y-6"
                          : "translate-y-0"
                      }`}
                    >
                      First Name{" "}
                      <span
                        className={
                          activeField === "firstName"
                            ? "text-red-500"
                            : "text-black"
                        }
                      >
                        *
                      </span>
                    </h2>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("firstName")}
                      onBlur={() => setActiveField(null)}
                      className="outline-none text-md   w-full border-0 h-full "
                    />
                  </div>

                  <div
                    className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                      activeField === "lastName"
                        ? "border-blue-600"
                        : "border-gray-300"
                    } rounded-md`}
                  >
                    <h2
                      className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                        activeField === "lastName" || formData.lastName !== ""
                          ? "-translate-y-6"
                          : "translate-y-0"
                      }`}
                    >
                      Last Name{" "}
                      <span
                        className={
                          activeField === "lastName"
                            ? "text-red-500"
                            : "text-black"
                        }
                      >
                        *
                      </span>
                    </h2>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("lastName")}
                      onBlur={() => setActiveField(null)}
                      className="outline-none text-md   w-full border-0 h-full "
                    />
                  </div>

                  <div
                    className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                      activeField === "flatNumber"
                        ? "border-blue-600"
                        : "border-gray-300"
                    } rounded-md`}
                  >
                    <h2
                      className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                        activeField === "flatNumber" ||
                        formData.flatNumber !== ""
                          ? "-translate-y-6"
                          : "translate-y-0"
                      }`}
                    >
                      Flat, house number, floor, building{" "}
                      <span
                        className={
                          activeField === "flatNumber"
                            ? "text-red-500"
                            : "text-black"
                        }
                      >
                        *
                      </span>
                    </h2>
                    <input
                      type="text"
                      name="flatNumber"
                      value={formData.flatNumber}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("flatNumber")}
                      onBlur={() => setActiveField(null)}
                      className="outline-none text-md   w-full border-0 h-full "
                    />
                  </div>

                  <div
                    className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                      activeField === "area"
                        ? "border-blue-600"
                        : "border-gray-300"
                    } rounded-md`}
                  >
                    <h2
                      className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                        activeField === "area" || formData.area !== ""
                          ? "-translate-y-6"
                          : "translate-y-0"
                      }`}
                    >
                      Area, street, sector, village{" "}
                      <span
                        className={
                          activeField === "area" ? "text-red-500" : "text-black"
                        }
                      >
                        *
                      </span>
                    </h2>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("area")}
                      onBlur={() => setActiveField(null)}
                      className="outline-none text-md   w-full border-0 h-full "
                    />
                  </div>

                  <div
                    className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                      activeField === "pincode"
                        ? "border-blue-600"
                        : "border-gray-300"
                    } rounded-md`}
                  >
                    <h2
                      className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                        activeField === "landmark" || formData.landmark !== ""
                          ? "-translate-y-6"
                          : "translate-y-0"
                      }`}
                    >
                      Landmark{" "}
                      <span
                        className={
                          activeField === "landmark"
                            ? "text-red-500"
                            : "text-black"
                        }
                      >
                        *
                      </span>
                    </h2>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("landmark")}
                      onBlur={() => setActiveField(null)}
                      className="outline-none text-md z-10 w-full border-0 h-full "
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                        activeField === "pincode"
                          ? "border-blue-600"
                          : "border-gray-300"
                      } rounded-md`}
                    >
                      <h2
                        className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                          activeField === "city" || formData.city !== ""
                            ? "-translate-y-6"
                            : "translate-y-0"
                        }`}
                      >
                        City{" "}
                        <span
                          className={
                            activeField === "city"
                              ? "text-red-500"
                              : "text-black"
                          }
                        >
                          *
                        </span>
                      </h2>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("city")}
                        onBlur={() => setActiveField(null)}
                        className="outline-none text-md   w-full border-0 h-full "
                      />
                    </div>

                    <div
                      className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                        activeField === "state"
                          ? "border-blue-600"
                          : "border-gray-300"
                      } rounded-md`}
                    >
                      <h2
                        className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                          activeField === "state" || formData.state !== ""
                            ? "-translate-y-6"
                            : "translate-y-0"
                        }`}
                      >
                        State{" "}
                        <span
                          className={
                            activeField === "state"
                              ? "text-red-500"
                              : "text-black"
                          }
                        >
                          *
                        </span>
                      </h2>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("state")}
                        onBlur={() => setActiveField(null)}
                        className="outline-none text-md   w-full border-0 h-full "
                      />
                    </div>
                  </div>

                  <div
                    className={`relative group w-full px-3 py-0 h-11 border-[1px] ${
                      activeField === "email"
                        ? "border-blue-600"
                        : "border-gray-300"
                    } rounded-md`}
                  >
                    <h2
                      className={`absolute top-3 text-[14px]  transition-all duration-200 bg-white px-2 ${
                        activeField === "email" || formData.email !== ""
                          ? "-translate-y-6"
                          : "translate-y-0"
                      }`}
                    >
                      Email (optional){" "}
                    </h2>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("email")}
                      onBlur={() => setActiveField(null)}
                      className="outline-none text-md   w-full border-0 h-full "
                    />
                    <p className="text-xs mt-1 -ml-3 text-gray-500">
                      Order delivery details will be sent here
                    </p>
                  </div>

                  {/* Address Type */}
                  <div className="space-y-2 text-sm font-medium mt-10">
                    <h4 className="font-medium text-xs">Address type</h4>
                    <div>
                      <input
                        type="text"
                        value={addressType}
                        onChange={(e) => setAddressType(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddAddress}
                    className="w-full mt-4 mb-4 text-sm bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors "
                  >
                    Add address
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 rounded-xl bg-white py-3 px-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold mb-3">More Products</h3>
            </div>
            <div className="text-sm flex gap-2 overflow-auto">
              {products?.products?.length > 0 &&
                products.products.map((item, index) => (
                  <div
                    key={index}
                    className="relative  flex flex-col border-[1px] border-black/10 gap-2 rounded-lg p-3"
                  >
                    <div className="w-full aspect-square  rounded-sm overflow-hidden mb-2 flex items-center justify-center">
                      <Image
                        src={item?.thumbnail?.url}
                        alt={item?.thumbnail?.alt || "Product"}
                        width={56}
                        height={64}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="w-fit h-fit">
                      <div className="text-xs w-40  min-h-7 text-gray-600 mb-1">
                        {item?.name}
                      </div>
                      {item?.variants?.[0]?.salePrice ? (
                        <>
                          <span className="font-extrabold text-sm text-black">
                            ₹{item?.variants?.[0]?.salePrice}
                          </span>
                          <span className="font-extrabold line-through ml-1 opacity-75 text-sm text-black">
                            ₹{item?.variants?.[0]?.price}
                          </span>
                        </>
                      ) : (
                        <span className="font-extrabold text-sm ">
                          ₹{item?.variants?.[0]?.price || "500"}
                        </span>
                      )}
                    </div>

                    {SelectedProduct?._id === item._id && (
                      <div className="absolute flex justify-between flex-col transition-all duration-300 bottom-0 h-1/2 left-0 right-0 rounded-t-md bg-green-100 backdrop-blur-sm p-4 z-[999]">
                        <div>
                          <h2 className="mb-1">Select Variant</h2>
                          {item?.variants?.map((variant, index) => (
                            <div
                              key={index}
                              onClick={() =>
                                handleSelectVariant(
                                  {
                                    id: item._id,
                                    image: {
                                      url:
                                        item.thumbnail.url ||
                                        item.image?.[0].url,
                                      alt:
                                        item.thumbnail.alt ||
                                        item.image?.[0].alt,
                                    },
                                    name: item.name,
                                    slug: item.slug,
                                    variant: variant._id,
                                  },
                                  variant._id,
                                  1,
                                  variant.salePrice || variant.price
                                )
                              }
                              className="cursor-pointer hover:font-semibold"
                            >
                              <h2 className="text-xs capitalize">
                                {variant.title} - {"₹" + variant.salePrice}{" "}
                                <span
                                  className={
                                    variant.salePrice
                                      ? "line-through opacity-75  text-gray-500"
                                      : ""
                                  }
                                >
                                  ₹{variant.price}
                                </span>
                              </h2>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => setSelectedProduct(null)}
                          className="flex mt-4 w-full items-center h-7 rounded-md justify-center border text-green-800 gap-1 text-sm "
                        >
                          Close
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedProduct(item)}
                      className="flex items-center h-7 rounded-md justify-center bg-blue-500 gap-1 text-sm text-white"
                    >
                      <Plus className="h-4 w-4 text-white " />
                      Add Now
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {isAuthenticated && addressAdded && (
            <button
              onClick={handelPayment}
              className="w-full mt-4 mb-4 text-sm bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors "
            >
              Place Order
            </button>
          )}
          {/* Contact Info */}
          {isAuthenticated && (
            <div className="flex justify-between items-center gap-2 bg-white rounded-xl text-gray-600 py-3 px-4">
              <div className="flex items-center gap-2">
                <div className="h-fit  w-fit border-[1.2px] border-gray-300 rounded-md flex items-center justify-center">
                  <Phone size={12} className="m-2" />
                </div>
                <span className="text-sm">+91 {user?.phone}</span>
                {console.log("user phone", user?.phone)}
              </div>
              <div
                onClick={() => {
                  dispatch(setAuthenticated(false));
                  dispatch(setOtpSended(false));
                }}
                className="h-fit  w-fit border-[1.2px] border-gray-300 rounded-md flex items-center justify-center"
              >
                <PencilLine size={12} className="m-1 text-blue-500" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-8 pb-4 ${
            !isAuthenticated && "mt-[32vh]"
          } text-xs flex justify-between mb-4 text-gray-500 text-center`}
        >
          T&C | Privacy Policy | IGAZC5
          <br />
          <span className="text-gray-400">Powered by Shiprocket</span>
        </div>
      </div>
    </div>
  );
}
