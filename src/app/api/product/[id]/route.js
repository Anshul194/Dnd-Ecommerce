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

    const formData = await req.formData();
    const body = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
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
