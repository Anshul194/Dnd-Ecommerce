import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../lib/tenantDb';
import ProductRepository from '../../lib/repository/productRepository';
import ProductService from '../../lib/services/productService';
import ProductController from '../../lib/controllers/productController';
import ProductModel from '../../lib/models/Product';
import { saveFile } from '../../config/fileUpload';

// GET /api/product
export async function GET(req) {
  // Extract query parameters from req.nextUrl.searchParams
  const searchParams = req.nextUrl.searchParams;
  const query = Object.fromEntries(searchParams.entries());
  console.log('Route received query:', query); // Log the parsed query

  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const Product = conn.models.Product || conn.model('Product', ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);
    const products = await productController.getAll(query, conn);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/product
export async function POST(req) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const Product = conn.models.Product || conn.model('Product', ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);

    // Handle FormData for images and descriptionImages like variant API
    const contentType = req.headers.get('content-type') || '';
    let body;
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {};
      // Helper to build arrays/objects from bracketed keys (like variant API)
      function setDeep(obj, path, value) {
        let curr = obj;
        for (let i = 0; i < path.length - 1; i++) {
          if (curr[path[i]] === undefined) {
            curr[path[i]] = isNaN(Number(path[i + 1])) ? {} : [];
          }
          curr = curr[path[i]];
        }
        curr[path[path.length - 1]] = value;
      }
      for (const [key, value] of formData.entries()) {
        // Match keys like images[0], descriptionImages[1], howToUseSteps[0].title, etc.
        const arrObjMatch = key.match(/([\w]+)\[(\d+)\](?:\.([\w]+))?/);
        if (arrObjMatch) {
          const arrKey = arrObjMatch[1];
          const arrIdx = arrObjMatch[2];
          const objKey = arrObjMatch[3];
          if (arrKey === 'images' || arrKey === 'descriptionImages') {
            // File upload for images/descriptionImages
            if (value instanceof File) {
              const url = await saveFile(value, 'uploads/Variant');
              if (!body[arrKey]) body[arrKey] = [];
              body[arrKey][arrIdx] = url;
            }
          } else if (objKey) {
            // howToUseSteps[0].title, attributeSet[0].attributeId, etc.
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            body[arrKey][arrIdx][objKey] = value;
          } else {
            // highlights[0], frequentlyPurchased[0], etc.
            if (!body[arrKey]) body[arrKey] = [];
            body[arrKey][arrIdx] = value;
          }
        } else {
          // Single file fields
          if (key === 'thumbnail' && value instanceof File) {
            body.thumbnail = await saveFile(value, 'uploads/Variant');
          } else if (key === 'images' && value instanceof File) {
            if (!body.images) body.images = [];
            body.images.push(await saveFile(value, 'uploads/Variant'));
          } else if (key === 'descriptionImages' && value instanceof File) {
            if (!body.descriptionImages) body.descriptionImages = [];
            body.descriptionImages.push(await saveFile(value, 'uploads/Variant'));
          } else {
            body[key] = value;
          }
        }
      }
      // Ensure arrays are not sparse
      if (body.images) body.images = body.images.filter(Boolean);
      if (body.descriptionImages) body.descriptionImages = body.descriptionImages.filter(Boolean);
    } else {
      body = await req.json();
    }

    const product = await productController.create(body,conn);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/product?id=PRODUCT_ID
export async function PUT(req) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const Product = conn.models.Product || conn.model('Product', ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const contentType = req.headers.get('content-type') || '';
    let data;
    let images = [];
    let thumbnail = '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      data = {};
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          const url = await saveFile(value, 'uploads/Variant');
          if (key === 'thumbnail') {
            thumbnail = url;
          } else if (key === 'images') {
            images.push(url);
          }
        } else {
          data[key] = value;
        }
      }
      data.images = images;
      data.thumbnail = thumbnail;
    } else {
      data = await req.json();
    }

    const updatedProduct = await productController.update(id, data);
    return NextResponse.json({ success: true, updatedProduct });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/product?id=PRODUCT_ID
export async function DELETE(req) {
  try {
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }
    const Product = conn.models.Product || conn.model('Product', ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await productController.delete(id);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}