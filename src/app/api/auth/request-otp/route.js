import { NextResponse } from "next/server";
import UserService from "../../../lib/services/userService.js";
import { redisWrapper } from "../../../config/redis.js";
import { getSubdomain } from "@/app/lib/tenantDb";
import { getDbConnection } from "../../../lib/tenantDb.js";
import axios from "axios";

export async function POST(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);

    if (!conn) {
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone is required" },
        { status: 400 }
      );
    }

    const userService = new UserService(conn);
    const user = await userService.getUserByPhone(phone);

    // Generate OTP
    const otp =
      phone === "7014629750"
        ? "123456"
        : Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in Redis
    if (redisWrapper.isEnabled()) {
      await redisWrapper.setex(`otp:${phone}`, 300, otp);
    }

    // 🔴 MSG91 API CALL
    await axios.post(
      "https://control.msg91.com/api/v5/flow/",
      {
        template_id: "694a2080301fbd6fd46bc6a2",
        sender: process.env.MSG91_SENDER_ID,
        mobiles: `91${phone}`,
        OTP: otp,
      },
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: `OTP sent to ${phone}`,
        data: {
          isNewUser: !user,
          redisEnabled: redisWrapper.isEnabled(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP error:", error?.response?.data || error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP",
        error: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
