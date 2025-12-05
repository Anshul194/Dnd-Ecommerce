import { NextResponse } from "next/server";
import {
    getAdAccounts,
    getPixels,
} from "@/app/lib/services/metaService";

/**
 * GET: List available ad accounts and pixels for a given access token
 * Query params:
 *  - accessToken: Meta access token (required)
 *  - type: 'accounts' | 'pixels' | 'both' (default: 'both')
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const accessToken = searchParams.get("accessToken");
        const type = searchParams.get("type") || "both";

        if (!accessToken) {
            return NextResponse.json(
                { error: "accessToken is required" },
                { status: 400 }
            );
        }

        const response = {
            success: true,
            data: {},
        };

        // Fetch ad accounts
        if (type === "accounts" || type === "both") {
            const accountsResult = await getAdAccounts(accessToken);

            if (!accountsResult.success) {
                return NextResponse.json(
                    { error: "Failed to fetch ad accounts: " + accountsResult.error },
                    { status: 400 }
                );
            }

            response.data.adAccounts = accountsResult.accounts;
        }

        // Fetch pixels
        if (type === "pixels" || type === "both") {
            const pixelsResult = await getPixels(accessToken);

            if (!pixelsResult.success) {
                return NextResponse.json(
                    { error: "Failed to fetch pixels: " + pixelsResult.error },
                    { status: 400 }
                );
            }

            response.data.pixels = pixelsResult.pixels;
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in GET /api/meta/list:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
