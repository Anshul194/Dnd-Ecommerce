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

  // Fetch settings only once on mount
  useEffect(() => {
    if (!settingsFetchedRef.current) {
      dispatch(fetchSettings());
      settingsFetchedRef.current = true;
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="h-[90vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main>
      {/* {settings?.activeHomepageLayout !== "Minimal & Organic UI" ? (
        <DynamicHomepage2 />
      ) : (
        <DynamicHomepage />
      )} */}
      <DynamicHomepage />
      
    </main>
  );
}
