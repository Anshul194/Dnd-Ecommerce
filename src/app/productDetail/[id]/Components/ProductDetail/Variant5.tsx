import React from "react";
import {
  ChevronDown,
  Clock,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import {
  addToCart,
  getCartItems,
  setBuyNowProduct,
  toggleCart,
} from "@/app/store/slices/cartSlice";
import { toast } from "react-toastify";
import { setCheckoutOpen } from "@/app/store/slices/checkOutSlice";
import { addToWishlist } from "@/app/store/slices/wishlistSlice";
import { selectSelectedProduct } from "@/app/store/slices/productSlice";

const Base_Url = process.env.NEXT_PUBLIC_BASE_URL;

function Variant5({ detailSettings }) {
  const [expandedSection, setExpandedSection] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [selectedVariant, setSelectedVariant] = React.useState<number>(0);
  const productData = useSelector(selectSelectedProduct);
  const dispatch = useDispatch();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = async () => {
    // if (!isAuthenticated) {
    //   setAuthModalOpen(true);
    //   return;
    // }
    const price = productData.variants[selectedVariant];
    try {
      const resultAction = await dispatch(
        addToCart({
          product: {
            id: productData._id,
            name: productData.name,
            image: productData.thumbnail || productData.images[0],
            variant: productData.variants[selectedVariant],
            slug: productData.slug,
          },
          quantity,
          price: price.salePrice || price.price,
          variant: productData.variants[selectedVariant],
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
    const price = productData.variants[selectedVariant];
    try {
      const resultAction = await dispatch(
        setBuyNowProduct({
          product: {
            id: productData._id,
            name: productData.name,
            image: productData.thumbnail || productData.images[0],
            variant: productData.variants[selectedVariant],
            slug: productData.slug,
          },
          quantity,
          price: price.salePrice || price.price,
          variant: productData.variants[selectedVariant],
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Product Info */}
      <div className="lg:col-span-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600 font-medium">
              {productData.brand}
            </span>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span className="text-green-600 font-medium">
              ✓ {productData.availability}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {productData.name}
          </h1>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
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
              </div>
              <span className="font-medium text-gray-900">
                {productData?.reviews?.Average.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({productData?.reviews?.Reviews.length} reviews)
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            {/* <div className="flex items-center gap-2 text-green-600">
              <Users size={16} />
              <span className="font-medium">{productData.soldCount}</span>
            </div> */}
          </div>
        </div>

        {detailSettings.showDescription && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Product Description
            </h3>
            <p
              dangerouslySetInnerHTML={{
                __html: productData.description,
              }}
              className="text-gray-700 leading-relaxed"
            ></p>
          </div>
        )}

        {/* Features Grid */}
        {productData?.benefits?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Why Choose This Product
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productData?.benefits?.map((feature, idx) => {
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200"
                  >
                    <div className="h-9 w-9 flex justify-center items-center  text-green-800 bg-green-100 rounded-lg">
                      {idx + 1}
                    </div>
                    <div className="w-[90%]">
                      <div className="font-semibold text-gray-900">
                        {feature.title}
                      </div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: feature.description,
                        }}
                        className="text-sm text-gray-600 mt-1"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
          <div className="space-y-6">
            {/* Price */}
            {productData.variants[selectedVariant] && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{productData.variants[selectedVariant].salePrice}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{productData.variants[selectedVariant].price}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {(() => {
                    const variant = productData.variants[selectedVariant] || {};
                    const price = Number(variant.price) || 0;
                    const salePrice = Number(variant.salePrice ?? price) || 0;
                    const discount =
                      price > 0
                        ? Math.round(((price - salePrice) / price) * 100)
                        : 0;
                    return discount > 0 ? (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {discount}% OFF
                      </span>
                    ) : null;
                  })()}
                  <span className="text-green-600 text-sm font-medium">
                    Save ₹
                    {productData.variants[selectedVariant].price -
                      productData.variants[selectedVariant].salePrice}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Inclusive of all taxes • Free shipping
                </p>
              </div>
            )}

            {/* Variant Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Choose Size</h3>
              <div className="space-y-2">
                {productData.variants.map((variant, index) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(index)}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                      selectedVariant === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {variant.title}
                          {variant.popular && (
                            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ₹{variant.salePrice}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ₹{variant.price}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-3 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Total: ₹
                  {(
                    (productData.variants[selectedVariant].salePrice ||
                      productData.variants[selectedVariant].price) * quantity
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Buy Now
              </button>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await dispatch(
                      addToWishlist({
                        product: productData._id,
                        variant: productData.variants[selectedVariant]._id,
                      })
                    );
                  }}
                  className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart size={18} />
                  Wishlist
                </button>
                <button className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={16} className="text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={16} className="text-blue-600" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw size={16} className="text-purple-600" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-orange-600" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Variant5;
