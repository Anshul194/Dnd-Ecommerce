import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSubdomain, getDbConnection } from "../../lib/tenantDb.js";
import { withUserAuth } from "../../middleware/commonAuth.js";
import { OrderSchema } from "../../lib/models/Order.js";
import { ProductSchema } from "../../lib/models/Product.js";
import { VariantSchema } from "../../lib/models/Variant.js";
import ticketSchema from "../../lib/models/Ticket.js";
import userSchema from "../../lib/models/User.js";
import { categorySchema } from "../../lib/models/Category.js";
import RoleSchema from "../../lib/models/role.js";

// GET /api/analytics - return various counts for dashboard analytics
export const GET = withUserAuth(async function (request) {
  try {
    if (!request.user?._id) {
      return NextResponse.json(
        { success: false, message: "User authentication required" },
        { status: 401 }
      );
    }

    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }

    // Register models on the tenant connection (reuse existing if present)
    const User = conn.models.User || conn.model("User", userSchema);
    const Role = conn.models.Role || conn.model("Role", RoleSchema);
    const Order = conn.models.Order || conn.model("Order", OrderSchema);
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    const Variant = conn.models.Variant || conn.model("Variant", VariantSchema);
    const Ticket = conn.models.Ticket || conn.model("Ticket", ticketSchema);
    const Category =
      conn.models.Category || conn.model("Category", categorySchema);

    // Ensure requester is admin
    const requestingUser = await User.findById(request.user._id)
      .select("role")
      .exec();
    if (!requestingUser || !requestingUser.role) {
      return NextResponse.json(
        { success: false, message: "User or role not found" },
        { status: 403 }
      );
    }
    const role = await Role.findById(requestingUser.role).select("name").exec();
    if (!role || role.name !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Prepare status lists (based on schemas)
    const orderStatuses = [
      "pending",
      "paid",
      "shipped",
      "completed",
      "cancelled",
    ];
    const ticketStatuses = ["open", "in_progress", "resolved", "closed"];

    // Run counts in parallel
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalVariants,
      totalOrders,
      pendingOrders,
      ordersByStatusArr,
      ticketsByStatusArr,
      recentOrders,
      recentTickets,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ deletedAt: null }),
      Category.countDocuments({ deletedAt: null }),
      Variant.countDocuments({ deletedAt: null }),
      Order.countDocuments({}),
      Order.countDocuments({ status: "pending" }),
      // orders by status
      Promise.all(
        orderStatuses.map((s) => Order.countDocuments({ status: s }))
      ),
      // tickets by status
      Promise.all(
        ticketStatuses.map((s) => Ticket.countDocuments({ status: s }))
      ),
      // recent orders (most recent 10)
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select("user items total status createdAt placedAt")
        .populate({ path: "user", select: "name email phone" })
        .lean(),
      // recent tickets (most recent 10)
      Ticket.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("subject status priority customer orderId createdAt")
        .populate({ path: "customer", select: "name email phone" })
        .lean(),
    ]);

    const ordersByStatus = {};
    orderStatuses.forEach((s, i) => {
      ordersByStatus[s] = ordersByStatusArr[i] || 0;
    });

    const ticketsByStatus = {};
    ticketStatuses.forEach((s, i) => {
      ticketsByStatus[s] = ticketsByStatusArr[i] || 0;
    });

    const data = {
      totalUsers: totalUsers,
      totalProducts: totalProducts,
      totalCategories: totalCategories,
      totalVariants: totalVariants,
      totalOrders: totalOrders,
      totalPendingOrders: pendingOrders,
      ordersByStatus,
      ticketsByStatus,
      totalPendingTickets: ticketsByStatus["open"] || 0,
      recentOrders: recentOrders || [],
      recentTickets: recentTickets || [],
    };

    return NextResponse.json(
      { success: true, message: "Analytics fetched", data },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Analytics route error:",
      error && error.stack ? error.stack : error
    );
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
});
