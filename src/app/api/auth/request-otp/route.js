import { NextResponse } from "next/server";
import UserService from "../../../lib/services/userService.js";
import mongoose from "mongoose";
import { redisWrapper } from "../../../config/redis.js";
import { getSubdomain } from "@/app/lib/tenantDb";
import { getDbConnection } from "../../../lib/tenantDb.js";
import fetch from "node-fetch";

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

    const userService = new UserService(conn);
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone is required" },
        { status: 400 }
      );
    }

    // Check if user exists with this phone number
    const user = await userService.getUserByPhone(phone);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();


    // Always use generated OTP
    let finalOtp = otp;


    try {
      if (redisWrapper.isEnabled()) {
        await redisWrapper.setex(`otp:${phone}`, 300, finalOtp); // Store OTP for 5 minutes
      }

      // Send OTP via MSG91
      const MSG91_AUTH_KEY = "414720AGI6HDghnl690de1a9P1";
      const senderId = "BGUS"; // Use your approved sender ID
      const templateId = "69283c13fd192c6b21371606"; // Optional: Add your template ID if required
      const msg91Url = `https://api.msg91.com/api/v5/otp?template_id=${templateId}`;
      const payload = {
        mobile: phone,
        otp: finalOtp,
        authkey: MSG91_AUTH_KEY,
        sender: senderId,
        // Add more fields if required by your template
      };

      let msg91Response = null;
      try {
        msg91Response = await fetch(msg91Url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (msg91Err) {
        // Optionally log or handle MSG91 error
      }

      return NextResponse.json(
        {
          success: true,
          message: `OTP sent to ${phone}`,
          data: {
            isNewUser: !user,
            redisEnabled: redisWrapper.isEnabled(),
            msg91Status: msg91Response && msg91Response.ok ? "sent" : "failed",
          },
        },
        { status: 200 }
      );
    } catch (redisError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to store OTP or send SMS",
          error: redisError.message,
        },
        { status: 500 }
      );
    }

    // TODO: Integrate SMS service here
    // For now, we're just storing the OTP in Redis
  } catch (error) {
    //console.error("POST /auth/request-otp error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
