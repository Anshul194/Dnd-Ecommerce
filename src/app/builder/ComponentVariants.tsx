"use client";

import React from "react";
import { BookOpen, Star, Image, FileText } from "lucide-react";

// Component types
export const COMPONENT_TYPES = {
  IMAGES: "images",
  DETAILS: "details",
  HOW_TO_USE: "howToUse",
  REVIEWS: "reviews",
};

// Component variants configuration
export const COMPONENT_VARIANTS = {
  [COMPONENT_TYPES.IMAGES]: {
    classic: {
      label: "Classic",
      description: "Traditional product image layout",
    },
    gallery: {
      label: "Gallery",
      description: "Grid-based image gallery",
    },
    showcase: {
      label: "Showcase",
      description: "Large featured image with thumbnails",
    },
  },
  [COMPONENT_TYPES.DETAILS]: {
    standard: {
      label: "Standard",
      description: "Basic product information layout",
    },
    detailed: {
      label: "Detailed",
      description: "Enhanced layout with badges and highlights",
    },
    minimal: {
      label: "Minimal",
      description: "Clean, minimal design approach",
    },
  },
  [COMPONENT_TYPES.HOW_TO_USE]: {
    steps: {
      label: "Step by Step",
      description: "Numbered steps format",
    },
    simple: {
      label: "Simple",
      description: "Basic instructions format",
    },
    illustrated: {
      label: "Illustrated",
      description: "Visual guide with icons",
    },
  },
  [COMPONENT_TYPES.REVIEWS]: {
    cards: {
      label: "Card Layout",
      description: "Individual review cards",
    },
    list: {
      label: "List View",
      description: "Compact list format",
    },
    testimonial: {
      label: "Testimonial",
      description: "Featured testimonial style",
    },
  },
};

// Product Images Component with Variants
export function ProductImages({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const imageSettings = settings[component.id] || {
    showThumbnails: true,
    imageSize: "medium",
    span: component.span || 1,
    variant: "classic",
  };

  const renderClassicVariant = () => (
    <div
      className={`flex ${isFullWidth ? "flex-row gap-4" : "flex-col"} gap-2`}
    >
      <div
        className={`${
          imageSettings.imageSize === "small"
            ? "max-w-24"
            : imageSettings.imageSize === "medium"
            ? "max-w-32"
            : isFullWidth
            ? "max-w-md"
            : "w-full"
        } ${isFullWidth ? "" : "mx-auto"}`}
      >
        <img
          src={product.images[0]}
          alt="Main product"
          className="w-full h-auto rounded-lg object-cover"
        />
      </div>

      {imageSettings.showThumbnails && (
        <div
          className={`flex ${isFullWidth ? "flex-col" : "flex-row"} gap-1 ${
            isFullWidth ? "" : "justify-center"
          } overflow-x-auto`}
        >
          {product.images.slice(1).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Product ${idx + 2}`}
              className="w-8 h-8 rounded object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderGalleryVariant = () => (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2">
        <img
          src={product.images[0]}
          alt="Main product"
          className="w-full h-auto rounded-lg object-cover"
        />
      </div>
      {product.images.slice(1, 3).map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Product ${idx + 2}`}
          className="w-full h-24 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
        />
      ))}
    </div>
  );

  const renderShowcaseVariant = () => (
    <div className="space-y-3">
      <div className="relative">
        <img
          src={product.images[0]}
          alt="Main product"
          className="w-full h-64 rounded-lg object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Featured
        </div>
      </div>
      {imageSettings.showThumbnails && (
        <div className="flex gap-2 justify-center">
          {product.images.slice(1).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Product ${idx + 2}`}
              className="w-16 h-16 rounded border-2 border-transparent hover:border-blue-500 object-cover cursor-pointer transition-all"
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderVariant = () => {
    switch (imageSettings.variant) {
      case "gallery":
        return renderGalleryVariant();
      case "showcase":
        return renderShowcaseVariant();
      default:
        return renderClassicVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-lg shadow-lg border border-gray-200"
      } ${isPreviewMode ? "" : "p-3 mb-2"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Image size={16} />
            Product Images{" "}
            {isFullWidth && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Full Width
              </span>
            )}
          </h3>
          <div className="flex gap-1 items-center text-xs">
            <select
              value={imageSettings.variant}
              onChange={(e) =>
                onUpdateSettings(component.id, {
                  ...imageSettings,
                  variant: e.target.value,
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-1"
              title="Component Variant"
            >
              {Object.entries(COMPONENT_VARIANTS[COMPONENT_TYPES.IMAGES]).map(
                ([key, variant]) => (
                  <option key={key} value={key}>
                    {variant.label}
                  </option>
                )
              )}
            </select>
            <select
              value={imageSettings.span}
              onChange={(e) => {
                const newSpan = parseInt(e.target.value);
                onUpdateSpan(component.id, newSpan);
                onUpdateSettings(component.id, {
                  ...imageSettings,
                  span: newSpan,
                });
              }}
              className="text-xs border border-gray-300 rounded px-1 py-1"
              title="Component Span"
            >
              {Object.entries(COMPONENT_SPANS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
            <select
              value={imageSettings.imageSize}
              onChange={(e) =>
                onUpdateSettings(component.id, {
                  ...imageSettings,
                  imageSize: e.target.value,
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-1"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={imageSettings.showThumbnails}
                onChange={(e) =>
                  onUpdateSettings(component.id, {
                    ...imageSettings,
                    showThumbnails: e.target.checked,
                  })
                }
              />
              Thumbs
            </label>
          </div>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// Product Details Component with Variants
export function ProductDetails({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}) {
  const detailSettings = settings[component.id] || {
    showPrice: true,
    showFeatures: true,
    layout: "vertical",
    span: component.span || 1,
    variant: "standard",
  };

  const renderStandardVariant = () => (
    <div
      className={`${
        detailSettings.layout === "horizontal" || isFullWidth
          ? "flex gap-3"
          : "space-y-2"
      }`}
    >
      <div className="flex-1">
        <h1
          className={`${
            isFullWidth ? "text-2xl" : "text-lg"
          } font-bold text-gray-900 mb-1`}
        >
          {product.name}
        </h1>
        {detailSettings.showPrice && (
          <p
            className={`${
              isFullWidth ? "text-xl" : "text-lg"
            } font-semibold text-blue-600 mb-2`}
          >
            {product.price}
          </p>
        )}
        <p
          className={`text-gray-700 ${
            isFullWidth ? "text-sm" : "text-xs"
          } leading-relaxed`}
        >
          {product.description}
        </p>
      </div>

      {detailSettings.showFeatures && (
        <div className="flex-1">
          <h4
            className={`font-semibold text-gray-900 mb-1 ${
              isFullWidth ? "text-sm" : "text-xs"
            }`}
          >
            Key Features:
          </h4>
          <ul className="space-y-1">
            {product.features.map((feature, idx) => (
              <li
                key={idx}
                className={`flex items-center gap-1 ${
                  isFullWidth ? "text-sm" : "text-xs"
                }`}
              >
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderDetailedVariant = () => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1
              className={`${
                isFullWidth ? "text-2xl" : "text-lg"
              } font-bold text-gray-900`}
            >
              {product.name}
            </h1>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Premium
            </span>
          </div>
          {detailSettings.showPrice && (
            <div className="flex items-center gap-2 mb-2">
              <p
                className={`${
                  isFullWidth ? "text-xl" : "text-lg"
                } font-semibold text-blue-600`}
              >
                {product.price}
              </p>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                Limited Time
              </span>
            </div>
          )}
        </div>
      </div>

      <p
        className={`text-gray-700 ${
          isFullWidth ? "text-sm" : "text-xs"
        } leading-relaxed bg-gray-50 p-3 rounded-lg`}
      >
        {product.description}
      </p>

      {detailSettings.showFeatures && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4
            className={`font-semibold text-blue-900 mb-2 ${
              isFullWidth ? "text-sm" : "text-xs"
            }`}
          >
            ✨ Key Features:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {product.features.map((feature, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 ${
                  isFullWidth ? "text-sm" : "text-xs"
                } bg-white p-2 rounded`}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMinimalVariant = () => (
    <div className="text-center space-y-2">
      <h1
        className={`${
          isFullWidth ? "text-3xl" : "text-xl"
        } font-light text-gray-900 mb-2`}
      >
        {product.name}
      </h1>
      {detailSettings.showPrice && (
        <p
          className={`${
            isFullWidth ? "text-2xl" : "text-xl"
          } font-light text-gray-600 mb-3`}
        >
          {product.price}
        </p>
      )}
      <p
        className={`text-gray-600 ${
          isFullWidth ? "text-base" : "text-sm"
        } leading-relaxed max-w-md mx-auto`}
      >
        {product.description}
      </p>
      {detailSettings.showFeatures && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {product.features.map((feature, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
            >
              {feature}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderVariant = () => {
    switch (detailSettings.variant) {
      case "detailed":
        return renderDetailedVariant();
      case "minimal":
        return renderMinimalVariant();
      default:
        return renderStandardVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-lg shadow-lg border border-gray-200"
      } ${isPreviewMode ? "" : "p-3 mb-2"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText size={16} />
            Product Details{" "}
            {isFullWidth && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Full Width
              </span>
            )}
          </h3>
          <div className="flex gap-1 items-center text-xs">
            <select
              value={detailSettings.variant}
              onChange={(e) =>
                onUpdateSettings(component.id, {
                  ...detailSettings,
                  variant: e.target.value,
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-1"
              title="Component Variant"
            >
              {Object.entries(COMPONENT_VARIANTS[COMPONENT_TYPES.DETAILS]).map(
                ([key, variant]) => (
                  <option key={key} value={key}>
                    {variant.label}
                  </option>
                )
              )}
            </select>
            <select
              value={detailSettings.span}
              onChange={(e) => {
                const newSpan = parseInt(e.target.value);
                onUpdateSpan(component.id, newSpan);
                onUpdateSettings(component.id, {
                  ...detailSettings,
                  span: newSpan,
                });
              }}
              className="text-xs border border-gray-300 rounded px-1 py-1"
            >
              {Object.entries(COMPONENT_SPANS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
            <select
              value={detailSettings.layout}
              onChange={(e) =>
                onUpdateSettings(component.id, {
                  ...detailSettings,
                  layout: e.target.value,
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-1"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={detailSettings.showPrice}
                onChange={(e) =>
                  onUpdateSettings(component.id, {
                    ...detailSettings,
                    showPrice: e.target.checked,
                  })
                }
              />
              Price
            </label>
          </div>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// How to Use Component with Variants
export function HowToUse({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}) {
  const howToUseSettings = settings[component.id] || {
    showIcon: true,
    bgColor: "blue",
    span: component.span || 1,
    variant: "simple",
  };

  const bgColors = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    gray: "bg-gray-50 border-gray-200",
  };

  const steps = [
    "Pair with your device via Bluetooth",
    "Enjoy high-quality audio",
    "Use touch controls for playback management",
  ];

  const renderStepsVariant = () => (
    <div className="space-y-3">
      <h4
        className={`font-semibold text-gray-900 mb-3 ${
          isFullWidth ? "text-base" : "text-sm"
        }`}
      >
        How to Use - Step by Step
      </h4>
      {steps.map((step, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {idx + 1}
          </div>
          <p
            className={`text-gray-700 ${
              isFullWidth ? "text-sm" : "text-xs"
            } leading-relaxed`}
          >
            {step}
          </p>
        </div>
      ))}
    </div>
  );

  const renderSimpleVariant = () => (
    <div
      className={`${bgColors[howToUseSettings.bgColor]} border rounded-lg p-2`}
    >
      <div className="flex items-start gap-2">
        {howToUseSettings.showIcon && (
          <BookOpen
            size={16}
            className={`text-${howToUseSettings.bgColor}-600 flex-shrink-0 mt-1`}
          />
        )}
        <div>
          <h4
            className={`font-semibold text-${
              howToUseSettings.bgColor
            }-900 mb-1 ${isFullWidth ? "text-sm" : "text-xs"}`}
          >
            Instructions
          </h4>
          <p
            className={`text-${howToUseSettings.bgColor}-800 ${
              isFullWidth ? "text-sm" : "text-xs"
            } leading-relaxed`}
          >
            {product.howToUse}
          </p>
        </div>
      </div>
    </div>
  );

  const renderIllustratedVariant = () => (
    <div className="space-y-4">
      <h4
        className={`font-semibold text-gray-900 text-center mb-4 ${
          isFullWidth ? "text-base" : "text-sm"
        }`}
      >
        📱 Quick Start Guide
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "🔗", title: "Connect", desc: "Pair via Bluetooth" },
          { icon: "🎵", title: "Play", desc: "Enjoy audio" },
          { icon: "🎛️", title: "Control", desc: "Touch controls" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="text-center p-3 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <h5
              className={`font-semibold text-gray-900 mb-1 ${
                isFullWidth ? "text-sm" : "text-xs"
              }`}
            >
              {item.title}
            </h5>
            <p
              className={`text-gray-600 ${isFullWidth ? "text-xs" : "text-xs"}`}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVariant = () => {
    switch (howToUseSettings.variant) {
      case "steps":
        return renderStepsVariant();
      case "illustrated":
        return renderIllustratedVariant();
      default:
        return renderSimpleVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-lg shadow-lg border border-gray-200"
      } ${isPreviewMode ? "" : "p-3 mb-2"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen size={16} />
            How to Use{" "}
            {isFullWidth && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Full Width
              </span>
            )}
          </h3>
          <div className="flex gap-1 items-center text-xs">
            <select
              value={howToUseSettings.variant}
              onChange={(e) =>
                onUpdateSettings(component.id, {
                  ...howToUseSettings,
                  variant: e.target.value,
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-1"
              title="Component Variant"
            >
              {Object.entries(
                COMPONENT_VARIANTS[COMPONENT_TYPES.HOW_TO_USE]
              ).map(([key, variant]) => (
                <option key={key} value={key}>
                  {variant.label}
                </option>
              ))}
            </select>
            <select
              value={howToUseSettings.span}
              onChange={(e) => {
                const newSpan = parseInt(e.target.value);
                onUpdateSpan(component.id, newSpan);
                onUpdateSettings(component.id, {
                  ...howToUseSettings,
                  span: newSpan,
                });
              }}
              className="text-xs border border-gray-300 rounded px-1 py-1"
            >
              {Object.entries(COMPONENT_SPANS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
            <select
              value={howToUseSettings.bgColor}
              onChange={(e) =>
                onUpdateSettings(component.id, {
                  ...howToUseSettings,
                  bgColor: e.target.value,
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-1"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="gray">Gray</option>
            </select>
          </div>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// Reviews Component with Variants
export function Reviews({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}) {
  const reviewSettings = settings[component.id] || {
    showRating: true,
    maxReviews: 3,
    layout: "card",
    span: component.span || 1,
    variant: "cards",
  };

  const displayReviews = product.reviews.slice(0, reviewSettings.maxReviews);

  const renderCardsVariant = () => (
    <div className={`${isFullWidth ? "grid grid-cols-3 gap-4" : "space-y-2"}`}>
      {displayReviews.map((review, idx) => (
        <div key={idx} className="bg-gray-50 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`font-medium text-gray-900 ${
                isFullWidth ? "text-sm" : "text-xs"
              }`}
            >
              {review.name}
            </span>
            {reviewSettings.showRating && (
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < review.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            )}
          </div>
          <p
            className={`text-gray-700 ${
              isFullWidth ? "text-sm" : "text-xs"
            } leading-relaxed`}
          >
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>
      ))}
    </div>
  );

  const renderListVariant = () => (
    <div className="space-y-3">
      {displayReviews.map((review, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 p-2 border-l-4 border-blue-500 bg-blue-50"
        >
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {review.name.charAt(0)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`font-medium text-gray-900 ${
                  isFullWidth ? "text-sm" : "text-xs"
                }`}
              >
                {review.name}
              </span>
              {reviewSettings.showRating && (
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={
                        i < review.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
              )}
            </div>
            <p
              className={`text-gray-700 ${
                isFullWidth ? "text-sm" : "text-xs"
              } leading-relaxed`}
            >
              {review.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTestimonialVariant = () => {
    const featuredReview = displayReviews[0];
    if (!featuredReview) return null;

    return (
      <div className="text-center space-y-4">
        <div className="text-4xl text-gray-300 mb-2">&ldquo;</div>
        <blockquote
          className={`${
            isFullWidth ? "text-lg" : "text-base"
          } font-medium text-gray-900 italic leading-relaxed`}
        >
          {featuredReview.comment}
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
            {featuredReview.name.charAt(0)}
          </div>
          <div className="text-left">
            <div
              className={`font-medium text-gray-900 ${
                isFullWidth ? "text-sm" : "text-xs"
              }`}
            >
              {featuredReview.name}
            </div>
            {reviewSettings.showRating && (
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < featuredReview.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {displayReviews.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {displayReviews.slice(1).map((review, idx) => (
              <div key={idx} className="w-2 h-2 bg-gray-300 rounded-full"></div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderVariant = () => {
    switch (reviewSettings.variant) {
      case "list":
        return renderListVariant();
      case "testimonial":
        return renderTestimonialVariant();
      default:
        return renderCardsVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-lg shadow-lg border border-gray-200"
      } ${isPreviewMode ? "" : "p-3 mb-2"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Star size={16} />
            Reviews{" "}
            {isFullWidth && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Full Width
              </span>
            )}
          </h3>
          <div className="flex gap-1 items-center text-xs">
            <select
              value={reviewSettings.variant}
              onChange={(e) =>
                onUpdateSettings(component.id, {
                  ...reviewSettings,
                  variant: e.target.value,
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-1"
              title="Component Variant"
            >
              {Object.entries(COMPONENT_VARIANTS[COMPONENT_TYPES.REVIEWS]).map(
                ([key, variant]) => (
                  <option key={key} value={key}>
                    {variant.label}
                  </option>
                )
              )}
            </select>
            <select
              value={reviewSettings.span}
              onChange={(e) => {
                const newSpan = parseInt(e.target.value);
                onUpdateSpan(component.id, newSpan);
                onUpdateSettings(component.id, {
                  ...reviewSettings,
                  span: newSpan,
                });
              }}
              className="text-xs border border-gray-300 rounded px-1 py-1"
            >
              {Object.entries(COMPONENT_SPANS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
            <select
              value={reviewSettings.maxReviews}
              onChange={(e) =>
                onUpdateSettings(component.id, {
                  ...reviewSettings,
                  maxReviews: parseInt(e.target.value),
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-1"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// Component renderer
export function ComponentRenderer({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  totalColumns = 3,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  totalColumns?: number;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const isFullWidth = component.span === totalColumns;

  const commonProps = {
    component,
    product,
    settings,
    onUpdateSettings,
    onUpdateSpan,
    isFullWidth,
    isPreviewMode,
    COMPONENT_SPANS,
  };

  switch (component.type) {
    case COMPONENT_TYPES.IMAGES:
      return <ProductImages {...commonProps} />;
    case COMPONENT_TYPES.DETAILS:
      return <ProductDetails {...commonProps} />;
    case COMPONENT_TYPES.HOW_TO_USE:
      return <HowToUse {...commonProps} />;
    case COMPONENT_TYPES.REVIEWS:
      return <Reviews {...commonProps} />;
    default:
      return null;
  }
}
