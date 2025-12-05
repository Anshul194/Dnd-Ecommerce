import { NextResponse } from "next/server";
import dbConnect from "@/app/connection/dbConnect";
import { fetchMetaMetrics } from "@/app/lib/services/metaService";
import { getMetaSettings, isMetaTokenExpired } from "@/app/lib/repository/metaRepository";

/**
 * GET: Fetch Meta metrics for configured account
 * Query params:
 *  - tenant: Tenant identifier (default: 'default')
 *  - since: Start date YYYY-MM-DD (default: 7 days ago)
 *  - until: End date YYYY-MM-DD (default: today)
 */
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const tenant = searchParams.get("tenant") || "bharat";

        // Default date range: last 7 days
        const until = searchParams.get("until") ||
            new Date().toISOString().split("T")[0];

        const since = searchParams.get("since") ||
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        // Get Meta settings from database
        const settingsResult = await getMetaSettings(tenant);

        if (!settingsResult.success) {
            return NextResponse.json(
                { error: "Meta integration not configured" },
                { status: 404 }
            );
        }

        const { metaIntegration } = settingsResult;
        const { adAccountId, pixelId, accessToken, isConnected } = settingsResult.data;

        if (!isConnected || !accessToken) {
            return NextResponse.json(
                { error: "Meta integration is not connected" },
                { status: 400 }
            );
        }

        // Check if token is expired
        const tokenExpired = await isMetaTokenExpired(tenant);
        if (tokenExpired) {
            return NextResponse.json(
                {
                    error: "Access token has expired. Please reconnect your Meta account.",
                    code: "TOKEN_EXPIRED",
                },
                { status: 401 }
            );
        }

        // Fetch metrics
        const metricsResult = await fetchMetaMetrics(
            adAccountId,
            pixelId,
            accessToken,
            since,
            until
        );

        if (!metricsResult.success) {
            return NextResponse.json(
                { error: "Failed to fetch metrics: " + metricsResult.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                dateRange: { since, until },
                metrics: metricsResult.data,
            },
        });
    } catch (error) {
        console.error("Error in GET /api/meta/metrics:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
