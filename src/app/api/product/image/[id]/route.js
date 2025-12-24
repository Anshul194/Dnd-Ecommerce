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
    // Normalize and sanitize incoming id from route params
    let imageId = params.id; // Image _id from the route
    if (typeof imageId !== "string") imageId = String(imageId || "");
    try {
      imageId = decodeURIComponent(imageId).trim();
    } catch (e) {
      imageId = (imageId || "").trim();
    }
    const subdomain = getSubdomain(req);
    //consolle.log('Subdomain:', subdomain);
    //consolle.log('Attempting to delete image with ID:', imageId);

    // Validate imageId format; allow a cleaned hex-only fallback
    if (!imageId || !mongoose.isValidObjectId(imageId)) {
      const hex = (imageId || "").replace(/[^0-9a-fA-F]/g, "");
      if (!(hex.length === 24 && mongoose.isValidObjectId(hex))) {
        console.log("Invalid image ID format:", imageId, "-> hex:", hex);
        return NextResponse.json(
          { success: false, message: "Invalid image ID format" },
          { status: 400 }
        );
      }
      imageId = hex;
    }

    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //consolle.log('Database connection failed for subdomain:', subdomain);
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }

    //consolle.log('Database connection established:', conn.name);

    const Product = conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);

    // Convert imageId to ObjectId for MongoDB query
    const objectId = new mongoose.Types.ObjectId(imageId);
    //consolle.log('Converted imageId to ObjectId:', objectId);

    // Log all collections in the database for debugging
    const collections = await conn.db.listCollections().toArray();
    //consolle.log('Available collections:', collections.map(c => c.name));

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
        //consolle.log('Test product found:', testProduct._id, 'Images:', testProduct.images, 'DescriptionImages:', testProduct.descriptionImages);
      } else {
        //consolle.log('Test product with ID 68a85fe70dc0730f73f1f8b3 not found');
      }
      //consolle.log('No product found with image ID:', imageId);
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    //consolle.log('Found product with ID:', product._id, 'Images:', product.images, 'DescriptionImages:', product.descriptionImages);

    let updated = false;

    // Check and remove from images array
    let images = product.images || [];
    const newImages = images.filter(img => img._id.toString() !== imageId);
    if (newImages.length < images.length) {
      updated = true;
      product.images = newImages;
      //consolle.log('Image removed from images array. New images:', newImages);
    } else {
      // If not found in images, check and remove from descriptionImages
      let descriptionImages = product.descriptionImages || [];
      const newDescriptionImages = descriptionImages.filter(img => img._id.toString() !== imageId);
      if (newDescriptionImages.length < descriptionImages.length) {
        updated = true;
        product.descriptionImages = newDescriptionImages;
        //consolle.log('Image removed from descriptionImages array. New descriptionImages:', newDescriptionImages);
      }
    }

    if (!updated) {
      //consolle.log('Image ID not found in images or descriptionImages:', imageId);
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    // Update the product with the modified arrays
    const updateResult = await productController.update(product._id, product, conn);
    //consolle.log('Update result:', updateResult);

    let fullProduct = null;
    if (updateResult && updateResult.success) {
      const getResult = await productController.getById(product._id, conn);
      if (getResult && getResult.success) {
        fullProduct = getResult.data;
        //consolle.log('Updated product:', fullProduct);
      } else {
        //consolle.log('Failed to fetch updated product:', getResult);
      }
    } else {
      //consolle.log('Update failed:', updateResult);
    }

    return NextResponse.json({
      success: updateResult.success,
      message: updateResult.message || "Image deleted successfully",
      product: fullProduct
    }, {
      status: updateResult.success ? 200 : 400,
    });

  } catch (error) {
    //consolle.error('DELETE image error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}