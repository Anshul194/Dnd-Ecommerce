import { NextResponse } from "next/server";
import { getSubdomain, getDbConnection } from "../../../lib/tenantDb.js";
import ProductRepository from "../../../lib/repository/productRepository.js";
import ProductService from "../../../lib/services/productService.js";
import ProductController from "../../../lib/controllers/productController.js";
import ProductModel from "../../../lib/models/Product.js";

// GET /api/product/:id
export async function GET(req, { params }) {
  try {
    const id = params.id;
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    const Product =
      conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);
    console.log('Fetching product with ID:', params);
    const response = await productController.getById(id, conn);
    return NextResponse.json(response, {
      status: response.success ? 200 : 404,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/product/:id
export async function PATCH(req, { params }) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    const Product =
      conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);
    const body = await req.json();
    const response = await productController.update(params.id, body, conn);
    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/product/:id
export async function PUT(req, { params }) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    const Product =
      conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);

    const contentType = req.headers.get('content-type') || '';
    let body;
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        // Match keys like ingredients[0].image, benefits[0].image, precautions[0].image, etc.
        const arrObjMatch = key.match(/([\w]+)\[(\d+)\](?:\.([\w]+))?/);
        if (arrObjMatch) {
          const arrKey = arrObjMatch[1];
          const arrIdx = arrObjMatch[2];
          const objKey = arrObjMatch[3];
          // Handle file upload for image fields
          if ((arrKey === 'ingredients' || arrKey === 'benefits' || arrKey === 'precautions') && objKey === 'image' && value instanceof File) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            const url = await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant');
            body[arrKey][arrIdx][objKey] = url;
          } else if (objKey) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            body[arrKey][arrIdx][objKey] = value;
          } else if (arrKey === 'images' || arrKey === 'descriptionImages') {
            if (value instanceof File) {
              const url = await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant');
              if (!body[arrKey]) body[arrKey] = [];
              body[arrKey][arrIdx] = url;
            }
          } else {
            if (!body[arrKey]) body[arrKey] = [];
            body[arrKey][arrIdx] = value;
          }
        } else {
          if (key === 'thumbnail' && value instanceof File) {
            body.thumbnail = await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant');
          } else if (key === 'images' && value instanceof File) {
            if (!body.images) body.images = [];
            body.images.push(await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant'));
          } else if (key === 'descriptionImages' && value instanceof File) {
            if (!body.descriptionImages) body.descriptionImages = [];
            body.descriptionImages.push(await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant'));
          } else {
            body[key] = value;
          }
        }
      }
      if (body.images) body.images = body.images.filter(Boolean);
      if (body.descriptionImages) body.descriptionImages = body.descriptionImages.filter(Boolean);
    } else {
      body = await req.json();
    }

    // Fix: Wrap string arrays in objects for embedded fields
    const arrayObjectFields = ["howToUseSteps", "ingredients", "benefits", "precautions"];
    for (const field of arrayObjectFields) {
      if (Array.isArray(body[field]) && body[field].every(v => typeof v === "string")) {
        body[field] = body[field].map(description => ({ description }));
      }
    }

    const response = await productController.update(params.id, body, conn);
    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/product/:id
export async function DELETE(req, { params }) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    const Product =
      conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);
    const response = await productController.delete(params.id, conn);
    return NextResponse.json(response, {
      status: response.success ? 200 : 404,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
