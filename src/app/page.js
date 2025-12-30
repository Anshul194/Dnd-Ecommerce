"use client";

import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { LoadingSpinner } from "@/components/common/Loading";

const DynamicHomepage = dynamic(
  () => import("@/components/homepage/DynamicHomepage"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[90vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    ),
  }
);

const DynamicHomepage2 = dynamic(
  () => import("@/components/homepage/DynamicHomepage2"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[90vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    ),
  }
);

export default function HomePage() {
  const { settings, loading } = useSelector((state) => state.setting);

  if (loading) {
    return (
      <div className="h-[90vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main>
      {settings?.activeHomepageLayout === "Minimal & Organic UI" ? (
        <DynamicHomepage2 />
      ) : (
        <DynamicHomepage />
      )}
    </main>
  );
}
