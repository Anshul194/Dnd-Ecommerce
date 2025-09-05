import { FileText } from "lucide-react";
import Variant1 from "./Variant1";
import Variant2 from "./Variant2";
import Variant3 from "./Variant3";
import { useSelector } from "react-redux";

export function Description({
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
  const descriptionSettings = {
    ...{
      showVideo: true,
      showImages: true,
      span: component.span || 1,
      variant: "layout",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "layout",
  };

  const { selectedProduct } = useSelector((state: any) => state.product);

  // Enhanced dummy data structure with more comprehensive content
  const dummyDescriptionData = {
    description: `
      <div>
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">Premium Quality Craftsmanship</h2>
        <p style="margin-bottom: 16px; line-height: 1.6; color: #374151;">
          Experience the perfect blend of innovation and style with our premium product. Carefully crafted with attention to detail, 
          this item represents the pinnacle of quality and design excellence.
        </p>
        <p style="margin-bottom: 16px; line-height: 1.6; color: #374151;">
          Our team of expert craftsmen has spent countless hours perfecting every aspect of this product, ensuring that it not only 
          meets but exceeds the highest standards of quality and performance.
        </p>
       
      </div>
    `,
    descriptionVideo: "https://www.youtube.com/watch?v=9bZkp7q19f0", // Demo video (Gangnam Style for demo purposes)
    descriptionImages: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
        alt: "Product main view",
      },
      {
        url: "https://images.unsplash.com/photo-1506629905685-74283b375c04?w=600&h=600&fit=crop",
        alt: "Product detail view",
      },
      {
        url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
        alt: "Product in use",
      },
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
        alt: "Product close-up",
      },
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
        alt: "Product lifestyle",
      },
      {
        url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop",
        alt: "Product features",
      },
    ],
  };

  // Use product data if available, otherwise fallback to dummy data
  const data = {
    description: product?.description || dummyDescriptionData.description,
    descriptionVideo: product?.descriptionVideo || dummyDescriptionData.descriptionVideo,
    descriptionImages: product?.descriptionImages || dummyDescriptionData.descriptionImages,
  };

  const renderVariant = () => {
    switch (descriptionSettings.variant) {
      case "compact":
        return <Variant1 descriptionData={data} />;
      case "showcase":
        return <Variant2 descriptionData={data} />;
      case "layout":
        return <Variant3 descriptionData={data} />;
      default:
        return <Variant1 descriptionData={data} />;
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
            <div className="p-2 bg-purple-100 rounded-xl">
              <FileText size={20} className="text-purple-600" />
            </div>
            Description
            {isFullWidth && (
              <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
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
