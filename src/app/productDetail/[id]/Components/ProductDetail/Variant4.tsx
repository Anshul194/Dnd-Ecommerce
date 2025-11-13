import React from "react";
import {
  Check,
  ChevronDown,
  Gift,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedProduct } from "@/app/store/slices/productSlice";
import {
  addToCart,
  getCartItems,
  setBuyNowProduct,
  toggleCart,
} from "@/app/store/slices/cartSlice";
import { toast } from "react-toastify";
import { setCheckoutOpen } from "@/app/store/slices/checkOutSlice";

function Variant4() {
  const [expandedSection, setExpandedSection] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const productData = useSelector(selectSelectedProduct);
  const [selectedVariant, setSelectedVariant] = React.useState<number>(
    productData?.variants[0] || null
  );
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };
  const dispatch = useDispatch();

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = async () => {
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const price = productData.variants.find(
      (variant) => variant._id === selectedVariant._id
    );
    try {
      const resultAction = await dispatch(
        addToCart({
          product: {
            id: productData._id,
            name: productData.name,
            image: productData.thumbnail || productData.images[0],
            variant: selectedVariant,
            slug: productData.slug,
          },
          quantity,
          price: price.salePrice || price.price,
          variant: selectedVariant,
        })
      );
      if (resultAction.error) {
        // Show backend error (payload) if present, else generic
        toast.error(
          resultAction.payload ||
            resultAction.error.message ||
            "Failed to add to cart"
        );
        return;
      }
      await dispatch(getCartItems());
      dispatch(toggleCart());
    } catch (error) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const priceObj = productData.variants.find(
      (variant) => variant._id === selectedVariant._id
    );
    try {
      const resultAction = await dispatch(
        setBuyNowProduct({
          product: {
            id: productData._id,
            name: productData.name,
            image: productData.thumbnail || productData.images[0],
            variant: selectedVariant,
            slug: productData.slug,
          },
          quantity,
          price: priceObj.salePrice || priceObj.price,
          variant: selectedVariant,
        })
      );
      if (resultAction.error) {
        // Show backend error (payload) if present, else generic
        toast.error(
          resultAction.payload ||
            resultAction.error.message ||
            "Failed to add to cart"
        );
        return;
      }
      await dispatch(getCartItems());
      dispatch(setCheckoutOpen(true));
      // dispatch(toggleCart());
    } catch (error) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {productData.name}
            </h1>
            <p className="text-md text-gray-600">{productData.subtitle}</p>
          </div>
        </div>

        {/* Rating & Social Proof */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={`${
                    i < Math.floor(productData?.reviews?.Average || 0)
                      ? "fill-orange-400 text-orange-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-900">
              {productData?.reviews?.Average.toFixed(1)}
            </span>
            <span className="text-gray-500">({productData?.reviews?.Reviews.length})</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          {/* <div className="flex items-center gap-2 text-green-600">
            <Users size={16} />
            <span className="font-medium">{productData.soldCount}</span>
          </div> */}
        </div>
      </div>

      {/* Price Section with Animation */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
        <div className="flex items-baseline gap-4 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            ₹{selectedVariant?.salePrice}
          </span>
          <span className="text-xl text-gray-500 line-through">
            ₹{selectedVariant?.price}
          </span>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold">
            Save{" "}
            {(() => {
              const v =
                productData?.variants?.find(
                  (v) => v._id === selectedVariant._id
                ) ?? productData?.variants?.[0];
              const price = v?.price ?? 0;
              const sale = v?.salePrice ?? 0;
              return price > 0 ? Math.round(((price - sale) / price) * 100) : 0;
            })()}
            %
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Free shipping • Easy returns • Best price guaranteed
        </p>
      </div>

      {/* Variant Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Choose Your Pack
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {productData.variants.map((variant) => (
            <button
              key={variant._id}
              className={`relative p-4 border-2 rounded-2xl text-left transition-all hover:shadow-lg ${
                selectedVariant?._id === variant._id
                  ? "border-orange-400 bg-orange-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedVariant(variant)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-900">
                      {variant.title}
                    </span>
                    {variant.popular && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Most Popular
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {variant.subtitle}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{variant.salePrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹{variant.price}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedVariant._id === variant._id
                      ? "border-orange-400 bg-orange-400"
                      : "border-gray-300"
                  }`}
                >
                  {selectedVariant._id === variant._id && (
                    <Check size={14} className="text-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center bg-gray-100 rounded-xl">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-3 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center font-bold text-lg">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-3 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-2xl font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
        >
          <ShoppingCart size={22} />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-8 rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Buy Now
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        {productData?.features?.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon size={20} className="text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">
                  {feature.title}
                </div>
                <div className="text-xs text-gray-600">
                  {feature.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offers Section */}
      {/* <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="text-purple-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">
            Special Offers
          </h3>
        </div>
        <div className="space-y-3">
          {productData?.offers?.map((offer, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles size={16} className="text-purple-600" />
                </div>
                <div>
                  <span className="font-bold text-purple-700">
                    {offer.code}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    {offer.discount}
                  </span>
                  {offer.minOrder !== "No minimum" && (
                    <span className="text-xs text-gray-500 block">
                      Min order: {offer.minOrder}
                    </span>
                  )}
                </div>
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Copy
              </button>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default Variant4;
