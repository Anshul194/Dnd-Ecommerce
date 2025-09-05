import { useSelector } from "react-redux";
import Variant1 from "./Variant1";
import Variant2 from "./Variant2";
import Variant3 from "./Variant3";

export function HowToUse({
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
  const howToUseSettings = {
    ...{
      showVideo: true,
      showSteps: true,
      span: component.span || 1,
      variant: "standard",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "standard",
  };
  const { selectedProduct } = useSelector((state: any) => state.product);

  const dummyHowToUseData = {
    howToUseVideo: selectedProduct?.howToUseVideo || "",
    howToUseTitle: selectedProduct?.howToUseTitle || "How to Use",
    howToUseSteps: selectedProduct?.howToUseSteps || [],
  };

  const data = dummyHowToUseData;

  const renderVariant = () => {
    switch (howToUseSettings.variant) {
      case "minimal":
        return <Variant1 data={data} />;
      case "detailed":
        return <Variant2 data={data} />;
      case "standard":
        return <Variant3 data={data} />;
      default:
        return <Variant1 data={data} />;
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
      {renderVariant()}
    </div>
  );
}
