"use client";
import DynamicHomepage from "@/components/homepage/DynamicHomepage";
import DynamicHomepage2 from "@/components/homepage/DynamicHomepage2";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings } from "./store/slices/settingSlice";
import { LoadingSpinner } from "@/components/common/Loading";

export default function HomePage() {
  const { settings, loading } = useSelector((state) => state.setting);
  const dispatch = useDispatch();
  const settingsFetchedRef = useRef(false);

  console.log("Current Settings:", settings);
  // Settings are fetched in the client layout to avoid duplicate client fetches.

  if (loading) {
    return (
      <div className="h-[90Vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  console.log("home page ui ===> ", settings.activeHomepageLayout);
  return (
    <main>
      {settings?.activeHomepageLayout == "Minimal & Organic UI" ? (
        <DynamicHomepage2 />
      ) : (
        <DynamicHomepage />
      )}
    </main>
  );
}
