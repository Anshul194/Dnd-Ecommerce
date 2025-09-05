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

function Variant5({ productData ,detailSettings }) {
  const [expandedSection, setExpandedSection] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [selectedVariant, setSelectedVariant] = React.useState<number>(0);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    console.log("Added to cart:", {
      product: productData.name,
      variant: productData.variants[selectedVariant],
      quantity,
    });
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
                    className="fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <span className="font-medium text-gray-900">
                {productData.rating}
              </span>
              <span className="text-gray-500">
                ({productData.reviewCount} reviews)
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-green-600">
              <Users size={16} />
              <span className="font-medium">{productData.soldCount}</span>
            </div>
          </div>
        </div>

        {detailSettings.showDescription && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Product Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {productData.description}
            </p>
          </div>
        )}

        {/* Features Grid */}
        {detailSettings.showFeatures && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Why Choose This Product
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productData.features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {feature.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {feature.description}
                      </div>
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
                    ₹{productData.variants[selectedVariant].price}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{productData.variants[selectedVariant].originalPrice}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {productData.variants[selectedVariant].discount}% OFF
                  </span>
                  <span className="text-green-600 text-sm font-medium">
                    Save ₹
                    {productData.variants[selectedVariant].originalPrice -
                      productData.variants[selectedVariant].price}
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
                        <div className="text-sm text-gray-600">
                          {variant.size} • {variant.servings}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ₹{variant.price}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ₹{variant.originalPrice}
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
                    productData.variants[selectedVariant].price * quantity
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
              <button className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Buy Now
              </button>
              <div className="flex gap-2">
                <button className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
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
