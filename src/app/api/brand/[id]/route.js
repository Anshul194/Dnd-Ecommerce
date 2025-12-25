import { NextResponse } from "next/server";
import { getSubdomain, getDbConnection } from "../../../lib/tenantDb";
import BrandService from "../../../lib/services/brandService";
import { BrandSchema } from "../../../lib/models/Brand.js";
import { saveFile } from "@/app/config/fileUpload";

// Helper to parse FormData in Next.js
async function parseFormData(req) {
  try {
    const formData = await req.formData();
    const fields = {};
    const files = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      } else {
        fields[key] = value;
      }
    }

    return { fields, files };
  } catch (error) {
    throw new Error(`Failed to parse form data: ${error.message}`);
  }
}

export async function GET(req, context) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams?.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid brandId: undefined" },
        { status: 400 }
      );
    }
    
    const subdomain = getSubdomain(req);
    //console.log("Subdomain:", subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //console.error("No database connection established");
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    //console.log("Connection name in route:", conn.name);
    const Brand = conn.models.Brand || conn.model("Brand", BrandSchema);
    //console.log("Models registered:", { Brand: Brand.modelName });
    const brandService = new BrandService(conn);

    const brand = await brandService.getBrandById(id);

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          message: "Brand not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand fetched successfully",
      data: brand,
    });
  } catch (error) {
    //console.error("Route GET brand by ID error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams?.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid brandId: undefined" },
        { status: 400 }
      );
    }
    
    const subdomain = getSubdomain(req);
    //console.log("Subdomain:", subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //console.error("No database connection established");
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    //console.log("Connection name in route:", conn.name);
    const Brand = conn.models.Brand || conn.model("Brand", BrandSchema);
    //console.log("Models registered:", { Brand: Brand.modelName });
    const brandService = new BrandService(conn);

    const { fields, files } = await parseFormData(req);
    const body = { ...fields };

    // Handle image upload
    if (files.image) {
      const image = await saveFile(files.image);
      body.image = image;
    }

    // Convert string booleans to actual booleans
    if (body.isFeatured) {
      body.isFeatured = body.isFeatured === "true" || body.isFeatured === true;
    }
    if (body.status) {
      body.status = body.status === "true" || body.status === true;
    }

    const updatedBrand = await brandService.updateBrand(id, body);

    if (!updatedBrand) {
      return NextResponse.json(
        {
          success: false,
          message: "Brand not found or could not be updated",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    //console.error("Route PUT brand error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams?.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid brandId: undefined" },
        { status: 400 }
      );
    }
    
    const subdomain = getSubdomain(req);
    //console.log("Subdomain:", subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //console.error("No database connection established");
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    //console.log("Connection name in route:", conn.name);
    const Brand = conn.models.Brand || conn.model("Brand", BrandSchema);
    //console.log("Models registered:", { Brand: Brand.modelName });
    const brandService = new BrandService(conn);

    const deleted = await brandService.deleteBrand(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Brand not found or could not be deleted",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    //console.error("Route DELETE brand error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
