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
  useEffect(() => {
    // Guard so we only fetch settings once on mount (prevents repeated fetch loops
    // when the settings object changes reference but doesn't include the active layout)
    if (
      !settingsFetchedRef.current &&
      (!settings || !settings.activeHomepageLayout)
    ) {
      settingsFetchedRef.current = true;
      dispatch(fetchSettings());
    }
  }, [dispatch, settings]);

  if (loading) {
    return (
      <div className="h-[90Vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }
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
