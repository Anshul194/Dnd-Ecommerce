import { NextResponse } from "next/server";
import { getSubdomain, getDbConnection } from "../../../lib/tenantDb.js";
import ProductRepository from "../../../lib/repository/productRepository.js";
import ProductService from "../../../lib/services/productService.js";
import ProductController from "../../../lib/controllers/productController.js";
import ProductModel from "../../../lib/models/Product.js";
import { saveFile } from "../../../config/fileUpload";

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
    const Product = conn.models.Product || conn.model("Product", ProductModel.schema);
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
    const id = params.id; // Ensure params.id is accessed correctly
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

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

    const contentType = req.headers.get('content-type') || '';
    let body = {};
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        // Support .file keys and direct file uploads (e.g., images[0])
        const arrObjMatch = key.match(/([\w]+)\[(\d+)\](?:\.([\w]+|file))?/);
        const objObjMatch = key.match(/([\w]+)\.(\w+)/); // thumbnail.url, thumbnail.alt, thumbnail.file
        if (arrObjMatch) {
          const arrKey = arrObjMatch[1];
          const arrIdx = parseInt(arrObjMatch[2]);
          const objKey = arrObjMatch[3];
          // Handle .file for images/descriptionImages
          if ((arrKey === 'images' || arrKey === 'descriptionImages') && objKey === 'file' && value instanceof File) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = { url: '', alt: '' };
            const url = await saveFile(value, 'Uploads/Product');
            body[arrKey][arrIdx].url = url;
          } else if ((arrKey === 'images' || arrKey === 'descriptionImages') && objKey) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = { url: '', alt: '' };
            body[arrKey][arrIdx][objKey] = value;
          } else if (["attributeSet", "ingredients", "benefits", "precautions", "howToUseSteps"].includes(arrKey) && objKey) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            if (["image", "url"].includes(objKey) && value instanceof File) {
              const url = await saveFile(value, 'Uploads/Product');
              body[arrKey][arrIdx][objKey] = url;
            } else {
              body[arrKey][arrIdx][objKey] = value;
            }
          } else if ((arrKey === 'ingredients' || arrKey === 'benefits' || arrKey === 'precautions') && objKey === 'image' && value instanceof File) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            const url = await saveFile(value, 'Uploads/Product');
            body[arrKey][arrIdx][objKey] = url;
          } else if (["attributeSet"].includes(arrKey) && !objKey) {
            if (!body[arrKey]) body[arrKey] = [];
            body[arrKey][arrIdx] = { attributeId: value };
          } else if ((arrKey === 'images' || arrKey === 'descriptionImages') && !objKey && value instanceof File) {
            // Handle direct file uploads like images[0]
            if (!body[arrKey]) body[arrKey] = [];
            const url = await saveFile(value, 'Uploads/Product');
            body[arrKey][arrIdx] = { url, alt: '' };
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
            body.thumbnail.url = await saveFile(value, 'Uploads/Product');
          } else if ((objKey === 'thumbnail') && prop) {
            if (!body.thumbnail) body.thumbnail = { url: '', alt: '' };
            body.thumbnail[prop] = value;
          } else {
            body[key] = value;
          }
        } else if (key === 'thumbnail' && value instanceof File) {
          const url = await saveFile(value, 'Uploads/Product');
          body.thumbnail = { url, alt: body.thumbnail?.alt || '' };
        } else if (key === 'images' && value instanceof File) {
          if (!body.images) body.images = [];
          const url = await saveFile(value, 'Uploads/Product');
          body.images.push({ url, alt: '' });
        } else if (key === 'descriptionImages' && value instanceof File) {
          if (!body.descriptionImages) body.descriptionImages = [];
          const url = await saveFile(value, 'Uploads/Product');
          body.descriptionImages.push({ url, alt: '' });
        } else {
          body[key] = value;
        }
      }
      // Normalize images and descriptionImages to always have url and alt
      if (body.images) {
        body.images = body.images.filter(Boolean).map(img => ({ url: img.url || '', alt: img.alt || '' }));
      }
      if (body.descriptionImages) {
        body.descriptionImages = body.descriptionImages.filter(Boolean).map(img => ({ url: img.url || '', alt: img.alt || '' }));
      }
      if (body.thumbnail) {
        body.thumbnail = { url: body.thumbnail.url || '', alt: body.thumbnail.alt || '' };
      }

      // Ensure all image fields have URLs, not File objects
      async function processImageField(fieldArr, uploadPath) {
        if (!Array.isArray(fieldArr)) return fieldArr;
        for (let i = 0; i < fieldArr.length; i++) {
          if (fieldArr[i] && typeof fieldArr[i].url === 'object' && fieldArr[i].url instanceof File) {
            fieldArr[i].url = await saveFile(fieldArr[i].url, uploadPath);
          }
        }
        return fieldArr;
      }
      async function processSingleImageField(obj, uploadPath) {
        if (obj && typeof obj.url === 'object' && obj.url instanceof File) {
          obj.url = await saveFile(obj.url, uploadPath);
        }
        return obj;
      }
      // Images
      if (body.images) {
        body.images = await processImageField(body.images, 'Uploads/Product');
      }
      // DescriptionImages
      if (body.descriptionImages) {
        body.descriptionImages = await processImageField(body.descriptionImages, 'Uploads/Product');
      }
      // Thumbnail
      if (body.thumbnail) {
        body.thumbnail = await processSingleImageField(body.thumbnail, 'Uploads/Product');
      }
      // Nested image fields (ingredients, benefits, precautions)
      const nestedImageFields = ['ingredients', 'benefits', 'precautions'];
      for (const field of nestedImageFields) {
        if (Array.isArray(body[field])) {
          for (let i = 0; i < body[field].length; i++) {
            if (body[field][i] && typeof body[field][i].image === 'object' && body[field][i].image instanceof File) {
              body[field][i].image = await saveFile(body[field][i].image, 'Uploads/Product');
            }
          }
        }
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
    const updateResult = await productController.update(id, body, conn);
    let fullProduct = null;
    if (updateResult && updateResult.success) {
      const getResult = await productController.getById(id, conn);
      if (getResult && getResult.success) {
        fullProduct = getResult.data;
        // Normalize images
        if (Array.isArray(fullProduct.images)) {
          fullProduct.images = fullProduct.images.map(img => {
            if (typeof img === 'string') {
              return { url: img, alt: '' };
            } else if (img && typeof img === 'object') {
              return { url: img.url || '', alt: img.alt || '' };
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
              return { url: img.url || '', alt: img.alt || '' };
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
              // If image is a string, convert to { url, alt }
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
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/product/:id
export async function DELETE(req, { params }) {
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
    const response = await productController.delete(id, conn);
    return NextResponse.json(response, {
      status: response.success ? 200 : 404,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}