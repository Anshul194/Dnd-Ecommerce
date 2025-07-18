import { NextResponse } from 'next/server';
import dbConnect from '../../connection/dbConnect';
import Product from '../../lib/models/Product';
import ProductRepository from '../../lib/repository/productRepository';
import ProductService from '../../lib/services/productService';
import ProductController from '../../lib/controllers/productController';


// Initialize all layers
await dbConnect();
const productRepo = new ProductRepository(Product);
const productService = new ProductService(productRepo);
const productController = new ProductController(productService);

// GET /api/product
export async function GET() {
  try {
    const products = await productController.getAll();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/product
export async function POST(req) {
  try {
    const body = await req.json();
    const product = await productController.create(body);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}