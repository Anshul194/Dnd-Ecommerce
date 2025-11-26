import { NextResponse } from "next/server";
import mongoose from "mongoose";
import * as XLSX from "xlsx";
import { getSubdomain, getDbConnection } from "../../lib/tenantDb.js";
import { withUserAuth } from "../../middleware/commonAuth.js";
import { OrderSchema } from "../../lib/models/Order.js";
import ticketSchema from "../../lib/models/Ticket.js";
import userSchema from "../../lib/models/User.js";
import { ReviewSchema } from "../../lib/models/Review.js";
import RoleSchema from "../../lib/models/role.js";

export const GET = withUserAuth(async function (request) {
    try {
        const subdomain = getSubdomain(request);
        const conn = await getDbConnection(subdomain);

        if (!conn) {
            return NextResponse.json(
                { success: false, message: "DB not found" },
                { status: 404 }
            );
        }

        // Models
        const User = conn.models.User || conn.model("User", userSchema);
        const Order = conn.models.Order || conn.model("Order", OrderSchema);
        const Ticket = conn.models.Ticket || conn.model("Ticket", ticketSchema);
        const Review = conn.models.Review || conn.model("Review", ReviewSchema);
        const Role = conn.models.Role || conn.model("Role", RoleSchema);

        // Check admin access
        const requestingUser = await User.findById(request.user._id).select("role");
        const role = await Role.findById(requestingUser?.role).select("name");

        // Allow admin or superadmin
        if (!role || (role.name !== "admin" && role.name !== "superadmin")) {
            // If the user is requesting their OWN data, it might be okay, but for now let's restrict to admin for "complete user list"
            // If userId is provided and matches request.user._id, maybe allow?
            // The prompt implies an admin feature "extract particular use whole detail or complete user list".
            // Let's stick to admin for now.
            return NextResponse.json(
                { success: false, message: "Admin access required" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get("userId");

        let userQuery = { isDeleted: { $ne: true } };
        if (targetUserId) {
            userQuery._id = targetUserId;
        }

        // Fetch Users
        const users = await User.find(userQuery).lean();

        if (!users.length) {
            return NextResponse.json(
                { success: false, message: "No users found" },
                { status: 404 }
            );
        }

        const userIds = users.map(u => u._id);

        // Fetch Related Data
        const [orders, tickets, reviews] = await Promise.all([
            Order.find({ user: { $in: userIds } }).lean(),
            Ticket.find({ customer: { $in: userIds }, isDeleted: { $ne: true } }).lean(),
            Review.find({ userId: { $in: userIds } }).lean()
        ]);

        // Prepare Data for Excel
        // Sheet 1: Users
        const usersData = users.map(u => ({
            "User ID": u._id.toString(),
            "Name": u.name || "",
            "Email": u.email || "",
            "Phone": u.phone || "",
            "Role ID": u.role ? u.role.toString() : "",
            "Is Verified": u.isVerified ? "Yes" : "No",
            "Is Active": u.isActive ? "Yes" : "No",
            "Created At": u.createdAt ? new Date(u.createdAt).toISOString() : "",
        }));

        // Sheet 2: Orders
        const ordersData = orders.map(o => ({
            "Order ID": o._id.toString(),
            "User ID": o.user ? o.user.toString() : "",
            "Total Amount": o.total,
            "Status": o.status,
            "Payment Mode": o.paymentMode,
            "Payment ID": o.paymentId,
            "Placed At": o.placedAt ? new Date(o.placedAt).toISOString() : "",
            "Items Count": o.items ? o.items.length : 0,
            "Shipping Name": o.shippingAddress?.fullName || "",
            "Shipping City": o.shippingAddress?.city || "",
            "Shipping State": o.shippingAddress?.state || "",
        }));

        // Sheet 3: Tickets
        const ticketsData = tickets.map(t => ({
            "Ticket ID": t._id.toString(),
            "User ID": t.customer ? t.customer.toString() : "",
            "Subject": t.subject,
            "Description": t.description,
            "Status": t.status,
            "Priority": t.priority,
            "Created At": t.createdAt ? new Date(t.createdAt).toISOString() : "",
        }));

        // Sheet 4: Reviews
        const reviewsData = reviews.map(r => ({
            "Review ID": r._id.toString(),
            "User ID": r.userId ? r.userId.toString() : "",
            "Product ID": r.productId ? r.productId.toString() : "",
            "Rating": r.rating,
            "Comment": r.comment,
            "Created At": r.createdAt ? new Date(r.createdAt).toISOString() : "",
        }));

        // Create Workbook
        const wb = XLSX.utils.book_new();

        const wsUsers = XLSX.utils.json_to_sheet(usersData);
        XLSX.utils.book_append_sheet(wb, wsUsers, "Users");

        const wsOrders = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(wb, wsOrders, "Orders");

        const wsTickets = XLSX.utils.json_to_sheet(ticketsData);
        XLSX.utils.book_append_sheet(wb, wsTickets, "Tickets");

        const wsReviews = XLSX.utils.json_to_sheet(reviewsData);
        XLSX.utils.book_append_sheet(wb, wsReviews, "Reviews");

        // Generate Buffer
        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        // Return Response
        return new NextResponse(buf, {
            status: 200,
            headers: {
                "Content-Disposition": `attachment; filename="user_data_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Server error" },
            { status: 500 }
        );
    }
});
