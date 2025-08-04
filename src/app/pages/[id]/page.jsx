"use client";

import axiosInstance from "@/axiosConfig/axiosInstance";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

function page() {
  const params = useParams();
  const { id } = params;
  const [data, setData] = React.useState(null);

  useEffect(() => {
    // Fetch data based on the dynamic ID
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/page/${id}`);
        const result = response.data.body.data;
        console.log("Fetched data:", result);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="max-w-7xl min-h-[60vh] mx-auto px-4 py-10">
      <h1 className="text-2xl text-center text-black font-bold">
        {data ? data.title : "Loading..."}
      </h1>

      <div
        className="w-2/3 mx-auto mt-6  text-gray-600"
        dangerouslySetInnerHTML={{ __html: data ? data.content : "Loading..." }}
      ></div>
    </div>
  );
}

export default page;
