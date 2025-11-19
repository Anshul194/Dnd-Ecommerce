// import { NextResponse } from "next/server";
// import { getSubdomain, getDbConnection } from "../../../../lib/tenantDb.js";
import { NextResponse } from "next/server";
import { getSubdomain, getDbConnection } from "../../../../lib/tenantDb.js";
import VariantRepository from "../../../../lib/repository/variantRepository.js";
import {
  getVariantById,
  updateVariant,
} from "../../../../lib/controllers/variantController.js";
import { variantSchema } from "../../../../lib/models/Variant.js";
import mongoose from "mongoose";
import VariantService from "@/app/lib/services/VariantService.js";

// DELETE /api/variant/image/:id
// DELETE /api/variant/image/:id?index=0&type=images&variantId=xxxx
export async function DELETE(req, { params }) {
  try {
    const url = new URL(req.url, "http://localhost");
    const index = parseInt(url.searchParams.get("index"), 10);
    const type = url.searchParams.get("type"); // should be 'images' only
    const variantId = url.searchParams.get("variantId");
    const subdomain = getSubdomain(req);
    // console.log("Subdomain:", subdomain);
    // console.log(
    //   "Attempting to delete variant image at index:",
    //   index,
    //   "from:",
    //   type,
    //   "variantId:",
    //   variantId
    // );

    if (isNaN(index) || index < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid index" },
        { status: 400 }
      );
    }
    if (type !== "images") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid type. Must be 'images'",
        },
        { status: 400 }
      );
    }
    if (!variantId || !mongoose.isValidObjectId(variantId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing variantId" },
        { status: 400 }
      );
    }

    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }

    const Variant =
      conn?.models?.Variant || conn.model("Variant", variantSchema);
    const variantRepo = new VariantRepository(Variant);
    const variantService = new VariantService(variantRepo);

    const variant = await Variant.findById(variantId);
    if (!variant) {
      return NextResponse.json(
        { success: false, message: "Variant not found" },
        { status: 404 }
      );
    }

    if (!Array.isArray(variant.images)) {
      return NextResponse.json(
        { success: false, message: `No images array found` },
        { status: 400 }
      );
    }

    if (index >= variant.images.length) {
      return NextResponse.json(
        { success: false, message: "Index out of bounds" },
        { status: 400 }
      );
    }

    // Remove the image at the specified index
    const removed = variant.images.splice(index, 1);
    if (!removed.length) {
      return NextResponse.json(
        { success: false, message: "No image at given index" },
        { status: 404 }
      );
    }

    // Update the variant
    const updateResult = await updateVariant(variant._id, variant, conn);
    let fullVariant = null;
    if (updateResult && updateResult.success) {
      const getResult = await getVariantById(variant._id, conn);
      if (getResult && getResult.success) {
        fullVariant = getResult.data;
      }
    }

    return NextResponse.json(
      {
        success: updateResult.success,
        message: updateResult.message || "Image deleted successfully",
        variant: fullVariant,
      },
      {
        status: updateResult.success ? 200 : 400,
      }
    );
  } catch (error) {
    // console.error("DELETE variant image error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
