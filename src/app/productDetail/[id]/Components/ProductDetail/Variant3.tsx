import {
  addToCart,
  getCartItems,
  setBuyNowProduct,
  toggleCart,
} from "@/app/store/slices/cartSlice";
import { setCheckoutOpen } from "@/app/store/slices/checkOutSlice";
import { selectSelectedProduct } from "@/app/store/slices/productSlice";
import {
  Clock,
  RotateCcw,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { trackEvent } from "@/app/lib/tracking/trackEvent";

function Variant3() {
  const [expandedSection, setExpandedSection] =
    React.useState<string>("details");
  const [quantity, setQuantity] = React.useState<number>(1);
  const productData = useSelector(selectSelectedProduct);
  const dispatch = useDispatch();
  const [selectedVariant, setSelectedVariant] = React.useState<number>(
    productData?.variants[0]?._id || 0
  );
  const [showFixedBar, setShowFixedBar] = React.useState<boolean>(false);
  const actionButtonsRef = React.useRef<HTMLDivElement>(null);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user?._id);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  React.useEffect(() => {
    const handleScroll = () => {
      if (actionButtonsRef.current) {
        const rect = actionButtonsRef.current.getBoundingClientRect();
        const isPastButtons = rect.bottom < 0;
        setShowFixedBar(isPastButtons);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (productData?._id) {
      try {
        trackEvent("product_view", {
          productId: productData._id,
          user: isAuthenticated ? userId : "guest",
        });
      } catch (err) {}
    }
  }, [productData?._id, isAuthenticated, userId]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = async () => {
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const price = productData?.variants?.find(
      (variant) => variant._id === selectedVariant
    );
    try {
      await dispatch(
        addToCart({
          product: {
            id: productData._id,
            name: productData.name,
            image: productData.thumbnail || productData.images?.[0],
            variant: selectedVariant,
            slug: productData.slug,
          },
          quantity,
          price: price?.salePrice || price?.price,
          variant: selectedVariant,
        })
      );
      await dispatch(getCartItems());
      try {
        trackEvent("add_to_cart", {
          productId: productData._id,
          variantId: selectedVariant,
          quantity,
          user: isAuthenticated ? userId : "guest",
        });
      } catch (err) {}
      dispatch(toggleCart());
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const price = productData?.variants?.find(
      (variant) => variant._id === selectedVariant
    );
    try {
      await dispatch(
        setBuyNowProduct({
          product: {
            id: productData._id,
            name: productData.name,
            image: productData.thumbnail || productData.images?.[0],
            variant: selectedVariant,
            slug: productData.slug,
          },
          quantity,
          price: price?.salePrice || price?.price,
          variant: selectedVariant,
        })
      );
      await dispatch(getCartItems());
      try {
        trackEvent("buy_now", {
          productId: productData._id,
          variantId: selectedVariant,
          quantity,
          user: isAuthenticated ? userId : "guest",
        });
      } catch (err) {}
      dispatch(setCheckoutOpen(true));
      // dispatch(toggleCart());
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };
  return (
    <div className="lg:col-span-6">
      {/* Fixed Buy Now and Add to Cart Section */}
      {productData && showFixedBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            {/* Product Image */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={productData.thumbnail || productData.images?.[0]}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {productData.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-gray-900">
                  ₹
                  {productData.variants?.find(
                    (variant) => variant._id === selectedVariant
                  )?.salePrice || productData.variants?.[0]?.salePrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹
                  {productData.variants?.find(
                    (variant) => variant._id === selectedVariant
                  )?.price || productData.variants?.[0]?.price}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:flex block gap-2">
              <button
                onClick={handleAddToCart}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-1 text-sm max-md:mb-2"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm max-md:w-full"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        {/* Title & Rating */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {productData.name}
        </h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className={`${
                  i < Math.round(productData?.reviews?.Average || 0)
                    ? "fill-orange-400 text-orange-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">
              ({productData?.reviews?.Average?.toFixed(1)}) (
              {productData?.reviews?.Reviews.length} reviews)
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <span className="text-sm text-green-600 font-medium">In Stock</span>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-gray-900">
              ₹
              {
                productData.variants.filter(
                  (variant) => variant._id === selectedVariant
                )[0]?.salePrice
              }
            </span>
            <span className="text-xl text-gray-500 line-through">
              ₹{" "}
              {
                productData.variants.filter(
                  (variant) => variant._id === selectedVariant
                )[0]?.price
              }
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              {(
                ((productData.variants.filter(
                  (variant) => variant._id === selectedVariant
                )[0]?.salePrice -
                  productData.variants.filter(
                    (variant) => variant._id === selectedVariant
                  )[0]?.price) *
                  100) /
                productData.variants.filter(
                  (variant) => variant._id === selectedVariant
                )[0]?.price
              ).toFixed(0)}
              % OFF
            </span>
          </div>
          <p className="text-sm text-gray-600">Inclusive of all taxes</p>
        </div>

        {/* Pack Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Choose Size
          </h3>
          <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-3">
            {productData.variants.map((variant) => (
              <button
                key={variant._id}
                className={`relative p-4 border-2 rounded-xl text-center transition-all ${
                  selectedVariant === variant._id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedVariant(variant._id)}
              >
                <div className="font-semibold max-sm:text-sm text-gray-900">
                  {variant.title}
                </div>
                <div className="text-sm text-gray-600">
                  ₹{variant.salePrice || variant.price}
                </div>
                {variant.discount && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    -{variant.discount}%
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div ref={actionButtonsRef} className="flex gap-3 mb-6">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} className="max-sm:hidden" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="bg-orange-500 text-white py-4 px-8 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Buy Now
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Truck size={18} className="text-green-600" />
            <span>Free Delivery</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <RotateCcw size={18} className="text-green-600" />
            <span>Easy Returns</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Shield size={18} className="text-green-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock size={18} className="text-green-600" />
            <span>7-8 Days Delivery</span>
          </div>
        </div>

        {/* Coupons */}
      </div>

      {/* Product Details Tabs */}
      <div className="bg-white rounded-2xl shadow-sm pb-24 lg:pb-6">
        <div className="border-b border-gray-200">
          <div className="flex max-sm:overflow-x-scroll ">
            {[
              { key: "details", label: "Details" },
              { key: "ingredients", label: "Ingredients" },
              { key: "benefits", label: "Benefits" },
              { key: "precautions", label: "Precautions" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => toggleSection(tab.key)}
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  expandedSection === tab.key
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {expandedSection === "details" && (
            <div
              dangerouslySetInnerHTML={{
                __html: productData.description,
              }}
              className="text-gray-700 leading-relaxed"
            ></div>
          )}

          {expandedSection === "ingredients" && (
            <div className="space-y-3">
              {productData.ingredients.map((item) => (
                <div key={item._id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: productData.description,
                    }}
                    className="text-gray-700"
                  ></span>
                </div>
              ))}
            </div>
          )}

          {expandedSection === "benefits" && (
            <div className="space-y-3">
              {productData.benefits.map((item, idx) => (
                <div key={item._id} className="flex flex-col items-start gap-3">
                  <span className="flex gap-2">
                    <div className="w-2 h-2  bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <strong>
                      {idx + 1}. {item.title}
                    </strong>
                  </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: item.description,
                    }}
                    className="text-gray-700"
                  ></span>
                </div>
              ))}
            </div>
          )}

          {expandedSection === "precautions" && (
            <div className="space-y-3">
              {productData.precautions.map((item) => (
                <div key={item._id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: productData.description,
                    }}
                    className="text-gray-700"
                  ></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Variant3;
