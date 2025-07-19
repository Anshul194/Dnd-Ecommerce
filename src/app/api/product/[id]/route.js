import { NextResponse } from 'next/server';
import ProductService from '../../../lib/services/productService.js';
import ProductRepository from '../../../lib/repository/productRepository.js';
import Product from '../../../lib/models/Product.js'; // ✅ Add this
import ProductController from '../../../lib/controllers/productController.js';

const productService = new ProductService(new ProductRepository(Product));

// GET /api/product/:id
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const product = await productService.getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/product/:id
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const controller = new ProductController(
      new ProductService(new ProductRepository(Product))
    );

    const response = await controller.update(id, body);

    return NextResponse.json(response, {
      status: response.success ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/product/:id
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}