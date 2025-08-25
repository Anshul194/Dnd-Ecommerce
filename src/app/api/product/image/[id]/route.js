import { NextResponse } from "next/server";
import { getSubdomain, getDbConnection } from "../../../../lib/tenantDb.js";
import ProductRepository from "../../../../lib/repository/productRepository.js";
import ProductService from "../../../../lib/services/productService.js";
import ProductController from "../../../../lib/controllers/productController.js";
import ProductModel from "../../../../lib/models/Product.js";
import mongoose from "mongoose";

// DELETE /api/product/image/:id
export async function DELETE(req, { params }) {
  try {
    const imageId = params.id; // Image _id from the route
    const subdomain = getSubdomain(req);
    console.log('Subdomain:', subdomain);
    console.log('Attempting to delete image with ID:', imageId);

    // Validate imageId format
    if (!imageId || !mongoose.isValidObjectId(imageId)) {
      console.log('Invalid image ID format:', imageId);
      return NextResponse.json(
        { success: false, message: "Invalid image ID format" },
        { status: 400 }
      );
    }

    const conn = await getDbConnection(subdomain);
    if (!conn) {
      console.log('Database connection failed for subdomain:', subdomain);
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }

    console.log('Database connection established:', conn.name);

    const Product = conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);

    // Convert imageId to ObjectId for MongoDB query
    const objectId = new mongoose.Types.ObjectId(imageId);
    console.log('Converted imageId to ObjectId:', objectId);

    // Log all collections in the database for debugging
    const collections = await conn.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Find the product containing the image with the specified _id
    const product = await Product.findOne({
      $or: [
        { "images._id": objectId },
        { "descriptionImages._id": objectId }
      ]
    });

    if (!product) {
      // Fallback: Try finding the product with a specific ID for debugging
      const testProduct = await Product.findById("68a85fe70dc0730f73f1f8b3");
      if (testProduct) {
        console.log('Test product found:', testProduct._id, 'Images:', testProduct.images, 'DescriptionImages:', testProduct.descriptionImages);
      } else {
        console.log('Test product with ID 68a85fe70dc0730f73f1f8b3 not found');
      }
      console.log('No product found with image ID:', imageId);
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    console.log('Found product with ID:', product._id, 'Images:', product.images, 'DescriptionImages:', product.descriptionImages);

    let updated = false;

    // Check and remove from images array
    let images = product.images || [];
    const newImages = images.filter(img => img._id.toString() !== imageId);
    if (newImages.length < images.length) {
      updated = true;
      product.images = newImages;
      console.log('Image removed from images array. New images:', newImages);
    } else {
      // If not found in images, check and remove from descriptionImages
      let descriptionImages = product.descriptionImages || [];
      const newDescriptionImages = descriptionImages.filter(img => img._id.toString() !== imageId);
      if (newDescriptionImages.length < descriptionImages.length) {
        updated = true;
        product.descriptionImages = newDescriptionImages;
        console.log('Image removed from descriptionImages array. New descriptionImages:', newDescriptionImages);
      }
    }

    if (!updated) {
      console.log('Image ID not found in images or descriptionImages:', imageId);
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    // Update the product with the modified arrays
    const updateResult = await productController.update(product._id, product, conn);
    console.log('Update result:', updateResult);

    let fullProduct = null;
    if (updateResult && updateResult.success) {
      const getResult = await productController.getById(product._id, conn);
      if (getResult && getResult.success) {
        fullProduct = getResult.data;
        console.log('Updated product:', fullProduct);
      } else {
        console.log('Failed to fetch updated product:', getResult);
      }
    } else {
      console.log('Update failed:', updateResult);
    }

    return NextResponse.json({
      success: updateResult.success,
      message: updateResult.message || "Image deleted successfully",
      product: fullProduct
    }, {
      status: updateResult.success ? 200 : 400,
    });

  } catch (error) {
    console.error('DELETE image error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}