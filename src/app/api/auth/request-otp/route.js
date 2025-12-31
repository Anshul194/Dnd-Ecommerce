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
    let { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone is required" },
        { status: 400 }
      );
    }

    // Clean phone number - remove all non-digits
    phone = phone.replace(/\D/g, "");

    // If it has 12 digits and starts with 91, it might already have country code.
    // Otherwise if it's 10 digits, we'll prefix it later in MSG91 call.
    if (phone.length > 10 && phone.startsWith("91")) {
      phone = phone.slice(2);
    }

    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number. Please enter a 10-digit number." },
        { status: 400 }
      );
    }

    const userService = new UserService(conn);
    const user = await userService.getUserByPhone(phone);

    // Generate OTP
    const isTestNumber = phone === "7014629750";
    const otp = isTestNumber
      ? "123456"
      : Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in Redis
    if (redisWrapper.isEnabled()) {
      await redisWrapper.setex(`otp:${phone}`, 300, otp);
    }

    // 🔴 MSG91 API CALL (Skip for test number)
    if (!isTestNumber) {
      try {
       const msg91Payload = {
  template_id: "694a2080301fbd6fd46bc6a2",
  short_url: 0,
  recipients: [
    {
      mobiles: `91${phone}`,
      OTP: otp,
    },
  ],
};

        if (process.env.MSG91_SENDER_ID) {
          msg91Payload.sender = process.env.MSG91_SENDER_ID;
        }

        await axios.post(
          "https://api.msg91.com/api/v5/flow/",
          msg91Payload,
          {
            headers: {
              authkey: process.env.MSG91_AUTH_KEY,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (msgError) {
        console.error("MSG91 Error Detailed:", msgError?.response?.data || msgError.message);
        // We still continue even if MSG91 fails during dev? 
        // No, it's better to fail so user knows OTP wasn't sent.
        throw msgError;
      }
    }

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
