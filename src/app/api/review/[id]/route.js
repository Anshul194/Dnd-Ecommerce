import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../../lib/tenantDb';
import ReviewService from '../../../lib/services/reviewService';
import { ReviewSchema } from '../../../lib/models/Review.js';
import { ProductModel } from '../../../lib/models/Product.js'; // Import Product model
import { withUserAuth } from '../../../middleware/commonAuth.js'; // Use existing middleware

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
      files.images = files.images.filter(file => file instanceof File);
    }

    return { fields, files };
  } catch (error) {
    throw new Error(`Failed to parse form data: ${error.message}`);
  }
}

export const PUT = withUserAuth(async function (req, { params }) {
  try {
    const { id } = params;
    const subdomain = getSubdomain(req);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    const Review = conn.models.Review || conn.model('Review', ReviewSchema);
    const Product = conn.models.Product || conn.model('Product', ProductModel.schema);
    console.log('Models registered:', { Review: Review.modelName, Product: Product.modelName });
    const reviewService = new ReviewService(conn);

    const userId = req.user._id; // Extract userId from authenticated user

    const { fields, files } = await parseFormData(req);
    const body = { ...fields };

    // Fetch the existing review to validate ownership and productId
    const existingReview = await reviewService.getReviewById(id);
    if (!existingReview) {
      return NextResponse.json({
        success: false,
        message: 'Review not found',
      }, { status: 404 });
    }

    // Validate ownership
    if (existingReview.userId.toString() !== userId.toString()) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: You can only update your own reviews',
      }, { status: 403 });
    }

    // Validate that the productId exists
    const productExists = await Product.exists({ _id: existingReview.productId });
    if (!productExists) {
      return NextResponse.json({
        success: false,
        message: 'Invalid productId: Product does not exist',
      }, { status: 404 });
    }

    // Handle multiple image uploads or updates
    if (files.images && files.images.length > 0) {
      const newImagePaths = files.images.map((file, index) => `/uploads/review-${Date.now()}-${index}-${file.name}`);
      body.images = body.images ? [...body.images, ...newImagePaths] : newImagePaths;
      console.log('Images updated:', newImagePaths);
      // Example for local storage (uncomment and implement as needed):
      /*
      import fs from 'fs/promises';
      import path from 'path';
      for (const [index, file] of files.images.entries()) {
        const filePath = path.join(process.cwd(), 'public/uploads', newImagePaths[index].split('/uploads/')[1]);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, fileBuffer);
      }
      */
    }

    const updatedReview = await reviewService.updateReview(id, body);

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Route PUT review error:', error.message);
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 401 }); // 401 for authentication errors
  }
});

export const DELETE = withUserAuth(async function (req, { params }) {
  try {
    const { id } = params;
    const subdomain = getSubdomain(req);
    console.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.error('No database connection established');
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    console.log('Connection name in route:', conn.name);
    const Review = conn.models.Review || conn.model('Review', ReviewSchema);
    const Product = conn.models.Product || conn.model('Product', ProductModel.schema);
    console.log('Models registered:', { Review: Review.modelName, Product: Product.modelName });
    const reviewService = new ReviewService(conn);

    const userId = req.user._id; // Extract userId from authenticated user

    // Fetch the existing review to validate ownership and productId
    const existingReview = await reviewService.getReviewById(id);
    if (!existingReview) {
      return NextResponse.json({
        success: false,
        message: 'Review not found',
      }, { status: 404 });
    }

    // Validate ownership
    if (existingReview.userId.toString() !== userId.toString()) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: You can only delete your own reviews',
      }, { status: 403 });
    }

    // Validate that the productId exists
    const productExists = await Product.exists({ _id: existingReview.productId });
    if (!productExists) {
      return NextResponse.json({
        success: false,
        message: 'Invalid productId: Product does not exist',
      }, { status: 404 });
    }

    const deleted = await reviewService.deleteReview(id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Review not found or could not be deleted',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Route DELETE review error:', error.message);
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 401 }); // 401 for authentication errors
  }
});