"use client";
import DynamicHomepage from "@/components/homepage/DynamicHomepage";
import DynamicHomepage2 from "@/components/homepage/DynamicHomepage2";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings } from "./store/slices/settingSlice";
import { LoadingSpinner } from "@/components/common/Loading";

export default function HomePage() {
  const { settings, loading } = useSelector((state) => state.setting);
  const dispatch = useDispatch();

  console.log("Current Settings:", settings);
  useEffect(() => {
    if (!settings || !settings.activeHomepageLayout) dispatch(fetchSettings());
  }, [settings]);

  if (loading) {
    return (
      <div className="h-[90Vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <main>
      {!settings?.activeHomepageLayout === "Minimal & Organic UI" ? (
        <DynamicHomepage2 />
      ) : (
        <DynamicHomepage />
      )}
    </main>
  );
}
