import { ChevronDown, ShoppingCart, Star } from "lucide-react";
import React from "react";

function Variant2({ productData }) {
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
    <div className="w-full">
      {/* Product Title and Rating */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {productData.name}
        </h1>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className="fill-orange-400 text-orange-400"
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">(4.7) - 390 Product Sold</span>
      </div>

      {/* Delivery Options */}
      <div className="mb-6">
        <h3 className="font-semibold text-black mb-2">Delivery Options</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter pincode"
            className="flex-1 px-3 py-2 border text-black border-gray-300 rounded text-sm"
          />
          <button className="bg-green-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-green-700 transition-colors">
            Check
          </button>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Product Delivers on your doorstep within 7-8 days
        </div>
      </div>

      {/* Pack Selection */}
      <div className="mb-6 relative">
        <h3 className="font-semibold text-black mb-3">Select Pack</h3>
        <div className="flex gap-3">
          {productData.variants.map((variant, index) => (
            <div
              key={index}
              className={`relative flex-1 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                productData.variants[0]._id === variant._id
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              // onClick={() => setSelectedPack(variant._id)}
            >
              <div
                className={`absolute -top-2 -right-2 text-white text-xs px-2 py-1 rounded ${
                  variant?.color === "green"
                    ? "bg-green-600"
                    : variant?.color === "orange"
                    ? "bg-orange-500"
                    : "bg-blue-500"
                }`}
              >
                {variant.discount}
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-black">
                  {variant.title}
                </div>
                <div
                  className={`font-semibold ${
                    productData.variants[0]._id === variant._id
                      ? "text-green-600"
                      : "text-gray-900"
                  }`}
                >
                  ₹{variant.price}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  ₹{variant.salePrice}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="mb-6">
        <h3 className="font-semibold text-black mb-2">Quantity</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-10 h-10 border border-gray-300 text-black rounded flex items-center justify-center hover:bg-gray-50"
          >
            -
          </button>
          <span className="text-lg font-medium text-black px-4">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-10 h-10 border border-gray-300 text-black rounded flex items-center justify-center hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleAddToCart}
          className="px-4 w-full py-3 border border-gray-300 text-black rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        {/* Product Details */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <button
            onClick={() => toggleSection("details")}
            className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
              expandedSection === "details"
                ? "bg-green-50 hover:bg-green-100"
                : "hover:bg-gray-50"
            }`}
          >
            <span
              className={`font-semibold text-base ${
                expandedSection === "details"
                  ? "text-green-700"
                  : "text-green-600"
              }`}
            >
              Product Details
            </span>
            <div
              className={`p-1 rounded-full transition-all duration-300 ${
                expandedSection === "details"
                  ? "bg-green-200 rotate-180"
                  : "bg-gray-100"
              }`}
            >
              <ChevronDown
                className={`transition-colors duration-200 ${
                  expandedSection === "details"
                    ? "text-green-700"
                    : "text-gray-600"
                }`}
                size={18}
              />
            </div>
          </button>
          <div
            className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
              expandedSection === "details"
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="px-5 py-4 text-sm text-gray-700 leading-relaxed bg-gray-50">
              {productData.description}
            </div>
          </div>
        </div>

        {/* Ingredients Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <button
            onClick={() => toggleSection("ingredients")}
            className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
              expandedSection === "ingredients"
                ? "bg-green-50 hover:bg-green-100"
                : "hover:bg-gray-50"
            }`}
          >
            <span
              className={`font-semibold text-base ${
                expandedSection === "ingredients"
                  ? "text-green-700"
                  : "text-green-600"
              }`}
            >
              Ingredients
            </span>
            <div
              className={`p-1 rounded-full transition-all duration-300 ${
                expandedSection === "ingredients"
                  ? "bg-green-200 rotate-180"
                  : "bg-gray-100"
              }`}
            >
              <ChevronDown
                className={`transition-colors duration-200 ${
                  expandedSection === "ingredients"
                    ? "text-green-700"
                    : "text-gray-600"
                }`}
                size={18}
              />
            </div>
          </button>
          <div
            className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
              expandedSection === "ingredients"
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="px-5 py-4 text-sm text-gray-700 bg-gray-50">
              <ul className="space-y-2">
                {productData.ingredients.map((item, idx) => (
                  <li key={item._id || idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">{item.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <button
            onClick={() => toggleSection("benefits")}
            className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
              expandedSection === "benefits"
                ? "bg-green-50 hover:bg-green-100"
                : "hover:bg-gray-50"
            }`}
          >
            <span
              className={`font-semibold text-base ${
                expandedSection === "benefits"
                  ? "text-green-700"
                  : "text-green-600"
              }`}
            >
              Benefits
            </span>
            <div
              className={`p-1 rounded-full transition-all duration-300 ${
                expandedSection === "benefits"
                  ? "bg-green-200 rotate-180"
                  : "bg-gray-100"
              }`}
            >
              <ChevronDown
                className={`transition-colors duration-200 ${
                  expandedSection === "benefits"
                    ? "text-green-700"
                    : "text-gray-600"
                }`}
                size={18}
              />
            </div>
          </button>
          <div
            className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
              expandedSection === "benefits"
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="px-5 py-4 text-sm text-gray-700 bg-gray-50">
              <ul className="space-y-2">
                {productData.benefits.map((item, idx) => (
                  <li key={item._id || idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">{item.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Precautions Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <button
            onClick={() => toggleSection("precautions")}
            className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
              expandedSection === "precautions"
                ? "bg-green-50 hover:bg-green-100"
                : "hover:bg-gray-50"
            }`}
          >
            <span
              className={`font-semibold text-base ${
                expandedSection === "precautions"
                  ? "text-green-700"
                  : "text-green-600"
              }`}
            >
              Precautions
            </span>
            <div
              className={`p-1 rounded-full transition-all duration-300 ${
                expandedSection === "precautions"
                  ? "bg-green-200 rotate-180"
                  : "bg-gray-100"
              }`}
            >
              <ChevronDown
                className={`transition-colors duration-200 ${
                  expandedSection === "precautions"
                    ? "text-green-700"
                    : "text-gray-600"
                }`}
                size={18}
              />
            </div>
          </button>
          <div
            className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
              expandedSection === "precautions"
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="px-5 py-4 text-sm text-gray-700 bg-gray-50">
              <ul className="space-y-2">
                {productData.precautions.map((item, idx) => (
                  <li key={item._id || idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">{item.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* How to use */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <button
            onClick={() => toggleSection("usage")}
            className={`w-full px-5 py-4 text-left flex items-center justify-between transition-all duration-200 ${
              expandedSection === "usage"
                ? "bg-green-50 hover:bg-green-100"
                : "hover:bg-gray-50"
            }`}
          >
            <span
              className={`font-semibold text-base ${
                expandedSection === "usage"
                  ? "text-green-700"
                  : "text-green-600"
              }`}
            >
              How to use
            </span>
            <div
              className={`p-1 rounded-full transition-all duration-300 ${
                expandedSection === "usage"
                  ? "bg-green-200 rotate-180"
                  : "bg-gray-100"
              }`}
            >
              <ChevronDown
                className={`transition-colors duration-200 ${
                  expandedSection === "usage"
                    ? "text-green-700"
                    : "text-gray-600"
                }`}
                size={18}
              />
            </div>
          </button>
          <div
            className={`border-t border-gray-100 transition-all duration-300 ease-in-out ${
              expandedSection === "usage"
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="px-5 py-4 text-sm text-gray-700 leading-relaxed bg-gray-50">
              Add a pinch to warm milk or tea. Can be used in cooking and
              baking. Store in a cool, dry place. Mix 1/2 teaspoon with honey
              for daily consumption or add to your favorite recipes for enhanced
              flavor and health benefits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Variant2;
