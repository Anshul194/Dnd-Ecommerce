import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request, { params }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { success: false, message: "Invoice ID required" },
            { status: 400 }
        );
    }

    try {
        const invoicesDir = path.join(process.cwd(), "public", "uploads", "invoices");

        // Sanitize id to prevent directory traversal & ensure .html extension
        // The ID might come in as "order-123" or just "123". 
        // The rewrite passes "order-123" if the URL was /uploads/invoices/order-123.html
        const safeId = path.basename(id).replace('.html', '');
        const filePath = path.join(invoicesDir, `${safeId}.html`);

        await fs.access(filePath);
        const fileBuffer = await fs.readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "text/html",
            },
        });
    } catch (error) {
        // console.error("Error serving invoice:", error);
        return NextResponse.json(
            { success: false, message: "Invoice not found" },
            { status: 404 }
        );
    }
}
