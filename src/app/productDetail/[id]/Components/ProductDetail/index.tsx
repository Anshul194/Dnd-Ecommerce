import {
  Award,
  Clock,
  FileText,
  Leaf,
  RotateCcw,
  Shield,
  Truck,
} from "lucide-react";
import Variant1 from "./Variant1";
import Variant2 from "./Variant2";
import Variant3 from "./Variant3";
import Variant4 from "./Variant4";
import Variant5 from "./Variant5";
import { useSelector } from "react-redux";

export function ProductDetails({
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
  const detailSettings = {
    ...{
      showPrice: true,
      showDescription: true,
      showFeatures: true,
      span: component.span || 1,
      variant: "minimal",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "minimal",
  };

  const { selectedProduct } = useSelector((state: any) => state.product);
  console.log("Selected Product from Redux:", selectedProduct);
  // Comprehensive dummy data

  const productData = {
    name: product?.name ,
    subtitle: product?.subtitle ,
    brand: product?.brand ,
    price: product?.price ,
    originalPrice: product?.originalPrice ,
    discount: product?.discount ,
    rating: product?.rating || 4.5,
    reviewCount: product?.reviewCount || 0,
    soldCount: product?.soldCount || 0,
    availability: product?.availability || "In Stock",
    description: product?.description || "No description available",
    variants: product?.variants || [],
    features: product?.features || [],
    ingredients: product?.ingredients || [],
    benefits: product?.benefits || [],
    precautions: product?.precautions || [],
    offers: product?.offers || [],
    usage: product?.usage || [],
    coupons: product?.coupons || [],
  };

  const renderVariant = () => {
    switch (detailSettings.variant) {
      case "minimal":
        return <Variant1 productData={productData} />;
      case "premium":
        return <Variant2 productData={productData} />;
      case "accordion":
        return <Variant3 productData={productData} />;
      case "ecommerce":
        return <Variant4 productData={productData} />;
      case "detailed":
        return (
          <Variant5 productData={productData} detailSettings={detailSettings} />
        );
      default:
        return <Variant1 productData={productData} />;
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-green-100 rounded-xl">
              <FileText size={20} className="text-green-600" />
            </div>
            Product Details
            {isFullWidth && (
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Full Width
              </span>
            )}
          </h3>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}
