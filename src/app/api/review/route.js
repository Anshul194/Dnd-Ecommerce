import { NextResponse } from "next/server";
import { getSubdomain, getDbConnection } from "../../lib/tenantDb";
import ReviewService from "../../lib/services/reviewService";
import { ReviewSchema } from "../../lib/models/Review.js";
import { ProductModel } from "../../lib/models/Product.js";
import { withUserAuth } from "../../middleware/commonAuth.js";
import fs from "fs/promises"; // Import fs for file operations
import path from "path"; // Import path for handling file paths

// Helper to parse FormData in Next.js
async function parseFormData(req) {
  try {
    const formData = await req.formData();
    const fields = {};
    const files = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const match = key.match(/(\w+)\[(\d+)\]/);
        if (match) {
          const [, fieldName, index] = match;
          files[fieldName] = files[fieldName] || [];
          files[fieldName][parseInt(index)] = value;
        } else {
          files[key] = files[key] ? [...files[key], value] : [value];
        }
      } else {
        fields[key] = value;
      }
    }

    if (files.images && Array.isArray(files.images)) {
      files.images = files.images.filter((file) => file instanceof File);
    }

    return { fields, files };
  } catch (error) {
    throw new Error(`Failed to parse form data: ${error.message}`);
  }
}

export const POST = withUserAuth(async function (req) {
  try {
    const subdomain = getSubdomain(req);
    console.log("Subdomain:", subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error("No database connection established");
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    console.log("Connection name in route:", conn.name);
    const Review = conn.models.Review || conn.model("Review", ReviewSchema);
    const Product =
      conn.models.Product || conn.model("Product", ProductModel.schema);
    console.log("Models registered:", {
      Review: Review.modelName,
      Product: Product.modelName,
    });
    const reviewService = new ReviewService(conn);

    const userId = req.user._id; // Extract userId from authenticated user

    const { fields, files } = await parseFormData(req);
    const body = { ...fields, userId }; // Add userId to the review data

    // Validate required fields
    if (!body.productId || !body.rating) {
      return NextResponse.json(
        {
          success: false,
          message: "productId and rating are required",
        },
        { status: 400 }
      );
    }

    // Validate productId exists
    const productExists = await Product.exists({ _id: body.productId });
    if (!productExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid productId: Product does not exist",
        },
        { status: 404 }
      );
    }

    // Handle multiple image uploads
    if (files.images && files.images.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      // Ensure the upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      const imagePaths = [];
      for (const [index, file] of files.images.entries()) {
        const fileName = `review-${Date.now()}-${index}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, fileBuffer); // Save the file
        imagePaths.push(`/uploads/${fileName}`); // Store the relative path
      }
      body.images = imagePaths;
      console.log("Images uploaded:", imagePaths);
    }

    const newReview = await reviewService.createReview(body);

    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        data: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Route POST review error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 401 }
    );
  }
});

export async function GET(req) {
  try {
    const subdomain = getSubdomain(req);
    console.log("Subdomain:", subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error("No database connection established");
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    console.log("Connection name in route:", conn.name);
    const Review = conn.models.Review || conn.model("Review", ReviewSchema);
    console.log("Models registered:", { Review: Review.modelName });
    const reviewService = new ReviewService(conn);

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "productId is required",
        },
        { status: 400 }
      );
    }

    const reviews = await reviewService.getReviewsByProductId(productId, conn);

    return NextResponse.json({
      success: true,
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Route GET reviews error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
