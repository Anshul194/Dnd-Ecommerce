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
    const Product = conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);
    console.log('Fetching product with ID:', id);
    const response = await productController.getById(id, conn);

    return NextResponse.json(
      {
        success: response.success,
        message: response.message,
        product: response.data
      },
      { status: response.success ? 200 : 404 }
    );
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
        const arrObjMatch = key.match(/([\w]+)\[(\d+)\](?:\.([\w]+))?/);
        if (arrObjMatch) {
          const arrKey = arrObjMatch[1];
          const arrIdx = arrObjMatch[2];
          const objKey = arrObjMatch[3];
          // --- Handle images and descriptionImages as objects ---
          if ((arrKey === 'images' || arrKey === 'descriptionImages') && objKey) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            if (objKey === 'file' && value instanceof File) {
              const url = await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant');
              body[arrKey][arrIdx].url = url;
            } else if (objKey === 'url') {
              body[arrKey][arrIdx].url = value;
            } else if (objKey === 'alt') {
              body[arrKey][arrIdx].alt = value;
            }
          // --- Handle nested image fields for ingredients, benefits, precautions ---
          } else if ((arrKey === 'ingredients' || arrKey === 'benefits' || arrKey === 'precautions') && objKey === 'image' && value instanceof File) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            const url = await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant');
            body[arrKey][arrIdx][objKey] = url;
          } else if (objKey) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            body[arrKey][arrIdx][objKey] = value;
          } else {
            if (!body[arrKey]) body[arrKey] = [];
            body[arrKey][arrIdx] = value;
          }
        } else {
          if (key === 'thumbnail' && value instanceof File) {
            body.thumbnail = await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant');
          } else if (key === 'images' && value instanceof File) {
            if (!body.images) body.images = [];
            body.images.push({ url: await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant'), alt: '' });
          } else if (key === 'descriptionImages' && value instanceof File) {
            if (!body.descriptionImages) body.descriptionImages = [];
            body.descriptionImages.push({ url: await (await import('../../../config/fileUpload')).saveFile(value, 'uploads/Variant'), alt: '' });
          } else {
            body[key] = value;
          }
        }
      }
      // Ensure all images/descriptionImages are objects with url/alt
      if (body.images) {
        body.images = body.images.filter(Boolean).map(img => ({ url: img.url || '', alt: img.alt || '' }));
      }
      if (body.descriptionImages) {
        body.descriptionImages = body.descriptionImages.filter(Boolean).map(img => ({ url: img.url || '', alt: img.alt || '' }));
      }
      if (body.thumbnail && typeof body.thumbnail === 'string') {
        body.thumbnail = { url: body.thumbnail, alt: '' };
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

    const updateResult = await productController.update(params.id, body, conn);
    let fullProduct = null;
    if (updateResult && updateResult.success) {
      const getResult = await productController.getById(params.id, conn);
      if (getResult && getResult.success) {
        fullProduct = getResult.data;
        // Normalize images
        if (Array.isArray(fullProduct.images)) {
          fullProduct.images = fullProduct.images.map(img => {
            if (typeof img === 'string') {
              return { url: img, alt: '' };
            } else if (img && typeof img === 'object') {
              return { url: img.url || img.file || '', alt: img.alt || '' };
            } else {
              return { url: '', alt: '' };
            }
          });
        }
        // Normalize descriptionImages
        if (Array.isArray(fullProduct.descriptionImages)) {
          fullProduct.descriptionImages = fullProduct.descriptionImages.map(img => {
            if (typeof img === 'string') {
              return { url: img, alt: '' };
            } else if (img && typeof img === 'object') {
              return { url: img.url || img.file || '', alt: img.alt || '' };
            } else {
              return { url: '', alt: '' };
            }
          });
        }
        // Normalize thumbnail
        if (fullProduct.thumbnail && typeof fullProduct.thumbnail === 'string') {
          fullProduct.thumbnail = { url: fullProduct.thumbnail, alt: '' };
        } else if (fullProduct.thumbnail && typeof fullProduct.thumbnail === 'object') {
          fullProduct.thumbnail = { url: fullProduct.thumbnail.url || '', alt: fullProduct.thumbnail.alt || '' };
        }
        // Normalize nested image fields for ingredients, benefits, precautions
        const nestedImageFields = ['ingredients', 'benefits', 'precautions'];
        for (const field of nestedImageFields) {
          if (Array.isArray(fullProduct[field])) {
            fullProduct[field] = fullProduct[field].map(item => {
              if (!item) return item;
              if (typeof item.image === 'string') {
                item.image = { url: item.image, alt: item.alt || '' };
              } else if (item.image && typeof item.image === 'object') {
                item.image = { url: item.image.url || '', alt: item.image.alt || item.alt || '' };
              }
              return item;
            });
          }
        }
      }
    }
    return NextResponse.json({ success: true, product: fullProduct }, {
      status: updateResult.success ? 200 : 400,
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
