import { NextResponse } from "next/server";
import UserService from "../../../lib/services/userService.js";
import mongoose from "mongoose";
import { redisWrapper } from "../../../config/redis.js";
import { getSubdomain } from "@/app/lib/tenantDb";
import { getDbConnection } from "../../../lib/tenantDb.js";

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

    // For testing purposes, use fixed OTP for specific numbers
    let finalOtp = otp;
    if (phone === "7014629750") {
      finalOtp = "123456";
    }

    try {
      if (redisWrapper.isEnabled()) {
        await redisWrapper.setex(`otp:${phone}`, 300, finalOtp); // Store OTP for 5 minutes
        //console.log(`📩 OTP sent to ${phone}: ${finalOtp}`);
      } else {
        // //console.log(
        //   `📴 Redis disabled - OTP would be: ${finalOtp} (for development)`
        // );
        // In production, you might want to handle this differently
        // For now, we'll continue but log that Redis is disabled
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
    } catch (redisError) {
      //console.error("Redis error:", redisError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to store OTP",
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
