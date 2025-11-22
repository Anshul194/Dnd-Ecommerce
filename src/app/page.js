"use client";
import DynamicHomepage from "@/components/homepage/DynamicHomepage";
import DynamicHomepage2 from "@/components/homepage/DynamicHomepage2";
import DynamicHomepageSkeleton from "@/components/homepage/DynamicHomepageSkeleton";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings } from "./store/slices/settingSlice";
import { LoadingSpinner } from "@/components/common/Loading";

export default function HomePage() {
  const { settings, loading } = useSelector((state) => state.setting);
  const dispatch = useDispatch();
  const settingsFetchedRef = useRef(false);

  // Fetch settings only once on mount
  useEffect(() => {
    if (!settingsFetchedRef.current) {
      dispatch(fetchSettings());
      settingsFetchedRef.current = true;
    }
  }, [dispatch]);

  // Track homepage view (best-effort)
  useEffect(() => {
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PAGE_VIEW",
          url: window.location.pathname,
          title: document.title || "Home",
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch (e) {}
  }, []);

  if (loading) {
    // Render a skeleton version of the homepage instead of the spinner
    return <DynamicHomepageSkeleton />;
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
