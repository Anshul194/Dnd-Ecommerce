import { Gift } from "lucide-react";
import Variant2 from "./Variant2";
import Variant1 from "./Variant1";
import Variant3 from "./Variant3";

export function Coupons({
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
  const couponSettings = {
    ...{
      itemsPerView: 2,
      showSelection: true,
      span: component.span || 1,
      variant: "slider",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "slider",
  };

  // Dummy coupon data
  const dummyCoupons = [
    {
      _id: "1",
      code: "SAVE20",
      type: "percent",
      value: 20,
      description: "Get 20% off on your order",
      minCartValue: 500,
    },
    {
      _id: "2",
      code: "FLAT100",
      type: "flat",
      value: 100,
      description: "Flat ₹100 off on orders above ₹1000",
      minCartValue: 1000,
    },
    {
      _id: "3",
      code: "WELCOME15",
      type: "percent",
      value: 15,
      description: "Welcome offer for new customers",
      minCartValue: 300,
    },
    {
      _id: "4",
      code: "MEGA50",
      type: "flat",
      value: 50,
      description: "Mega sale offer",
      minCartValue: 750,
    },
  ];

  const coupons = dummyCoupons;

  const renderVariant = () => {
    switch (couponSettings.variant) {
      case "grid":
        return <Variant1 coupons={coupons} couponSettings={couponSettings} />;
      case "compact":
        return <Variant2 coupons={coupons} couponSettings={couponSettings} />;
      case "slider":
        return <Variant3 coupons={coupons} />;
      default:
        return <Variant1 coupons={coupons} couponSettings={couponSettings} />;
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
              <Gift size={20} className="text-green-600" />
            </div>
            Discount Coupons
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
