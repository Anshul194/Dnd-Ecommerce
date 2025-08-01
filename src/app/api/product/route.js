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
    const productsResult = await productController.getAll(query, conn);
    // Defensive: productsResult may be { success, message, data }
    if (productsResult && productsResult.data && Array.isArray(productsResult.data)) {
      for (const product of productsResult.data) {
        // Normalize images
        if (Array.isArray(product.images)) {
          product.images = product.images.map(img => {
            if (typeof img === 'string') {
              return { url: img, alt: '' };
            } else if (img && typeof img === 'object' && !img.url && Object.keys(img).every(k => !isNaN(Number(k)))) {
              // Char-indexed object, convert to string then wrap
              const url = Object.values(img).filter(v => typeof v === 'string').join('');
              return { url, alt: '' };
            } else {
              return img;
            }
          });
        }
        // Normalize descriptionImages
        if (Array.isArray(product.descriptionImages)) {
          product.descriptionImages = product.descriptionImages.map(img => {
            if (typeof img === 'string') {
              return { url: img, alt: '' };
            } else if (img && typeof img === 'object' && !img.url && Object.keys(img).every(k => !isNaN(Number(k)))) {
              const url = Object.values(img).filter(v => typeof v === 'string').join('');
              return { url, alt: '' };
            } else {
              return img;
            }
          });
        }
        // Normalize thumbnail if it's a string or char-indexed object
        if (product.thumbnail && typeof product.thumbnail === 'string') {
          product.thumbnail = { url: product.thumbnail, alt: '' };
        } else if (product.thumbnail && typeof product.thumbnail === 'object' && !product.thumbnail.url && Object.keys(product.thumbnail).every(k => !isNaN(Number(k)))) {
          const url = Object.values(product.thumbnail).filter(v => typeof v === 'string').join('');
          product.thumbnail = { url, alt: '' };
        }
      }
    }
    return NextResponse.json({ success: true, products: productsResult });
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

    // Handle FormData for new model structure (images, thumbnail, descriptionImages as objects)
    const contentType = req.headers.get('content-type') || '';
    let body;
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {};
          for (const [key, value] of formData.entries()) {
            // Support .file keys for images, descriptionImages, thumbnail
            const arrObjMatch = key.match(/([\w]+)\[(\d+)\](?:\.([\w]+|file))?/);
            const objObjMatch = key.match(/([\w]+)\.(\w+)/); // thumbnail.url, thumbnail.alt, thumbnail.file
            if (arrObjMatch) {
              const arrKey = arrObjMatch[1];
              const arrIdx = arrObjMatch[2];
              const objKey = arrObjMatch[3];
              // Handle .file for images/descriptionImages
              if ((arrKey === 'images' || arrKey === 'descriptionImages') && objKey === 'file' && value instanceof File) {
                if (!body[arrKey]) body[arrKey] = [];
                if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = { url: '', alt: '' };
                const url = await saveFile(value, 'uploads/Variant');
                body[arrKey][arrIdx].url = url;
              } else if ((arrKey === 'images' || arrKey === 'descriptionImages') && objKey) {
                if (!body[arrKey]) body[arrKey] = [];
                if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = { url: '', alt: '' };
                body[arrKey][arrIdx][objKey] = value;
              } else if (["attributeSet", "ingredients", "benefits", "precautions", "howToUseSteps"].includes(arrKey) && objKey) {
                if (!body[arrKey]) body[arrKey] = [];
                if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
                if (["image", "url"].includes(objKey) && value instanceof File) {
                  const url = await saveFile(value, 'uploads/Variant');
                  body[arrKey][arrIdx][objKey] = url;
                } else {
                  body[arrKey][arrIdx][objKey] = value;
                }
              } else if ((arrKey === 'ingredients' || arrKey === 'benefits' || arrKey === 'precautions') && objKey === 'image' && value instanceof File) {
                if (!body[arrKey]) body[arrKey] = [];
                if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
                const url = await saveFile(value, 'uploads/Variant');
                body[arrKey][arrIdx][objKey] = url;
              } else if (["attributeSet"].includes(arrKey) && !objKey) {
                if (!body[arrKey]) body[arrKey] = [];
                body[arrKey][arrIdx] = { attributeId: value };
              } else {
                if (!body[arrKey]) body[arrKey] = [];
                body[arrKey][arrIdx] = value;
              }
            } else if (objObjMatch) {
              const objKey = objObjMatch[1];
              const prop = objObjMatch[2];
              // Handle thumbnail.file
              if (objKey === 'thumbnail' && prop === 'file' && value instanceof File) {
                if (!body.thumbnail) body.thumbnail = { url: '', alt: '' };
                body.thumbnail.url = await saveFile(value, 'uploads/Variant');
              } else if ((objKey === 'thumbnail') && prop) {
                if (!body.thumbnail) body.thumbnail = { url: '', alt: '' };
                body.thumbnail[prop] = value;
              } else {
                body[key] = value;
              }
            } else {
              body[key] = value;
            }
      }
      if (body.images) {
        body.images = body.images.filter(Boolean).map(img => ({ url: img.url || '', alt: img.alt || '' }));
      }
      if (body.descriptionImages) {
        body.descriptionImages = body.descriptionImages.filter(Boolean).map(img => ({ url: img.url || '', alt: img.alt || '' }));
      }
      if (body.thumbnail) {
        body.thumbnail = { url: body.thumbnail.url || '', alt: body.thumbnail.alt || '' };
      }
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

    console.log('Parsed product body:', JSON.stringify(body, null, 2));
    const product = await productController.create(body,conn);
    return NextResponse.json({ success: true, product}, { status: 201 });
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
    let body;
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        // images[0].url, images[0].alt, thumbnail.url, thumbnail.alt, descriptionImages[0].url, descriptionImages[0].alt
        const arrObjMatch = key.match(/([\w]+)\[(\d+)\](?:\.([\w]+))?/);
        const objObjMatch = key.match(/([\w]+)\.(\w+)/); // thumbnail.url, thumbnail.alt
        if (arrObjMatch) {
          const arrKey = arrObjMatch[1];
          const arrIdx = arrObjMatch[2];
          const objKey = arrObjMatch[3];
          if ((arrKey === 'images' || arrKey === 'descriptionImages') && objKey === 'url' && value instanceof File) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            const url = await saveFile(value, 'uploads/Variant');
            body[arrKey][arrIdx][objKey] = url;
          } else if ((arrKey === 'images' || arrKey === 'descriptionImages') && objKey) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            body[arrKey][arrIdx][objKey] = value;
          } else if ((arrKey === 'ingredients' || arrKey === 'benefits' || arrKey === 'precautions') && objKey === 'image' && value instanceof File) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            const url = await saveFile(value, 'uploads/Variant');
            body[arrKey][arrIdx][objKey] = url;
          } else if ((arrKey === 'ingredients' || arrKey === 'benefits' || arrKey === 'precautions') && objKey) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            body[arrKey][arrIdx][objKey] = value;
          } else {
            if (!body[arrKey]) body[arrKey] = [];
            body[arrKey][arrIdx] = value;
          }
        } else if (objObjMatch) {
          const objKey = objObjMatch[1];
          const prop = objObjMatch[2];
          if ((objKey === 'thumbnail') && prop === 'url' && value instanceof File) {
            if (!body.thumbnail) body.thumbnail = {};
            body.thumbnail.url = await saveFile(value, 'uploads/Variant');
          } else if ((objKey === 'thumbnail') && prop) {
            if (!body.thumbnail) body.thumbnail = {};
            body.thumbnail[prop] = value;
          } else {
            body[key] = value;
          }
        } else {
          body[key] = value;
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

    const updatedProduct = await productController.update(id, body, conn);
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