import { NextResponse } from 'next/server';
import ProductService from '../../../lib/services/productService.js';
import ProductRepository from '../../../lib/repository/productRepository.js';
import Product from '../../../lib/models/Product.js';
import ProductController from '../../../lib/controllers/productController.js';

const controller = new ProductController(
  new ProductService(new ProductRepository(Product))
);

// GET /api/product/:id
export async function GET(req, { params }) {
  try {
    const response = await controller.getById(params.id);
    return NextResponse.json(response, {
      status: response.success ? 200 : 404,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/product/:id
export async function PATCH(req, context) {
  const params = await context.params;
  try {
    const body = await req.json();
    const response = await controller.update(params.id, body);
    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/product/:id
export async function PUT(req, context) {
  const params = await context.params;
  try {
    const body = await req.json();
    const response = await controller.update(params.id, body);
    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/product/:id
export async function DELETE(req, context) {
  const params = await context.params;
  try {
    const response = await controller.delete(params.id);
    return NextResponse.json(response, {
      status: response.success ? 200 : 404,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}