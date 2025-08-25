import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../lib/tenantDb';
import ProductRepository from '../../lib/repository/productRepository';
import ProductService from '../../lib/services/productService';
import ProductController from '../../lib/controllers/productController';
import ProductModel from '../../lib/models/Product';
import { saveFile, validateImageFile } from '../../config/fileUpload';

// GET /api/product
export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const query = Object.fromEntries(searchParams.entries());
  console.log('Route received query:', query);

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

    return NextResponse.json({ success: true, products: productsResult });
  } catch (error) {
    console.error('GET error:', error);
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

    const contentType = req.headers.get('content-type') || '';
    let body = {};
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      
      // Initialize thumbnail object to ensure it exists
      body.thumbnail = { url: '', alt: '' };
      
      for (const [key, value] of formData.entries()) {
        console.log(`Processing form field: ${key}=${value instanceof File ? `File(${value.name})` : value}`);
        
        // Handle thumbnail fields specifically
        if (key === 'thumbnail.file' || (key === 'thumbnail' && value instanceof File)) {
          if (value instanceof File) {
            try {
              validateImageFile(value);
              const url = await saveFile(value, 'Uploads/Product');
              body.thumbnail.url = url;
              console.log(`Thumbnail URL set: ${url}`);
            } catch (error) {
              console.error(`Error saving thumbnail file (${value.name}):`, error.message);
              body.thumbnail.url = '';
            }
          }
          continue; // Skip further processing for this field
        }
        
        if (key === 'thumbnail.alt') {
          body.thumbnail.alt = value;
          continue;
        }
        
        // Handle nested object patterns like thumbnail[file], thumbnail[alt]
        const thumbnailMatch = key.match(/^thumbnail\[(\w+)\]$/);
        if (thumbnailMatch) {
          const prop = thumbnailMatch[1]; // 'file' or 'alt'
          if (prop === 'file' && value instanceof File) {
            try {
              validateImageFile(value);
              const url = await saveFile(value, 'Uploads/Product');
              body.thumbnail.url = url;
              console.log(`Thumbnail URL set via bracket notation: ${url}`);
            } catch (error) {
              console.error(`Error saving thumbnail file (${value.name}):`, error.message);
              body.thumbnail.url = '';
            }
          } else if (prop === 'alt') {
            body.thumbnail.alt = value;
          }
          continue;
        }

        // Handle array patterns for other fields
        const arrObjMatch = key.match(/([\w]+)\[(\d+)\](?:\[([\w]+)\])?/);
        const arrDotMatch = key.match(/([\w]+)\[(\d+)\]\.(\w+)/);
        const objObjMatch = key.match(/([\w]+)\.(\w+)/);

        if (arrDotMatch || arrObjMatch) {
          const match = arrDotMatch || arrObjMatch;
          const arrKey = match[1]; // e.g., "images"
          const arrIdx = parseInt(match[2]); // e.g., 0
          const objKey = match[3]; // e.g., "file", "alt"
          
          if (["images", "descriptionImages"].includes(arrKey)) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = { url: '', alt: '' };
            if ((objKey === 'file' || objKey === 'url') && value instanceof File) {
              try {
                validateImageFile(value);
                const url = await saveFile(value, 'Uploads/Product');
                body[arrKey][arrIdx].url = url;
              } catch (error) {
                console.error(`Error saving file for ${arrKey}[${arrIdx}][${objKey}] (${value.name}):`, error.message);
                body[arrKey][arrIdx].url = '';
              }
            } else if (objKey) {
              body[arrKey][arrIdx][objKey] = value;
            }
          } else if (["howToUseSteps", "ingredients", "benefits", "precautions"].includes(arrKey)) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            if (objKey === 'image' && value instanceof File) {
              try {
                validateImageFile(value);
                const url = await saveFile(value, 'Uploads/Product');
                body[arrKey][arrIdx].image = url;
              } catch (error) {
                console.error(`Error saving file for ${arrKey}[${arrIdx}][image] (${value.name}):`, error.message);
                body[arrKey][arrIdx].image = null;
              }
            } else if (objKey) {
              body[arrKey][arrIdx][objKey] = value;
            }
          } else if (arrKey === "attributeSet") {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            body[arrKey][arrIdx][objKey] = value;
          } else if (["searchKeywords", "highlights", "frequentlyPurchased"].includes(arrKey)) {
            if (!body[arrKey]) body[arrKey] = [];
            body[arrKey][arrIdx] = value;
          }
        } else if (objObjMatch) {
          const objKey = objObjMatch[1]; // e.g., "thumbnail"
          const prop = objObjMatch[2]; // e.g., "file", "alt"
          
          // Skip thumbnail here since we handled it above
          if (objKey === 'thumbnail') {
            continue;
          } else {
            body[key] = value;
          }
        } else if (key === 'images' && value instanceof File) {
          try {
            validateImageFile(value);
            if (!body.images) body.images = [];
            const url = await saveFile(value, 'Uploads/Product');
            body.images.push({ url, alt: '' });
          } catch (error) {
            console.error(`Error saving images file (${value.name}):`, error.message);
          }
        } else if (key === 'descriptionImages' && value instanceof File) {
          try {
            validateImageFile(value);
            if (!body.descriptionImages) body.descriptionImages = [];
            const url = await saveFile(value, 'Uploads/Product');
            body.descriptionImages.push({ url, alt: '' });
          } catch (error) {
            console.error(`Error saving descriptionImages file (${value.name}):`, error.message);
          }
        } else {
          body[key] = value;
        }
      }

      // Normalize array fields
      const arrayObjectFields = ["howToUseSteps", "ingredients", "benefits", "precautions"];
      for (const field of arrayObjectFields) {
        if (Array.isArray(body[field])) {
          body[field] = body[field].filter(item => item && typeof item === 'object').map(item => ({
            title: item.title || '',
            description: item.description || '',
            image: item.image || undefined,
            alt: item.alt || undefined,
            name: item.name || undefined,
            quantity: item.quantity || undefined
          }));
        } else {
          body[field] = [];
        }
      }

      // Normalize images and descriptionImages
      if (body.images) {
        body.images = body.images.filter(img => img && img.url).map(img => ({
          url: img.url || '',
          alt: img.alt || ''
        }));
      }
      if (body.descriptionImages) {
        body.descriptionImages = body.descriptionImages.filter(img => img && img.url).map(img => ({
          url: img.url || '',
          alt: img.alt || ''
        }));
      }
      
      // Handle thumbnail - only keep if URL exists
      if (body.thumbnail && body.thumbnail.url) {
        body.thumbnail = { 
          url: body.thumbnail.url, 
          alt: body.thumbnail.alt || '' 
        };
        console.log(`Final thumbnail object:`, body.thumbnail);
      } else {
        // Remove thumbnail if no valid URL
        delete body.thumbnail;
        console.log('Thumbnail removed - no valid URL found');
      }

      // Clean up any remaining thumbnail form fields
      delete body['thumbnail[alt]'];
      delete body['thumbnail[file]'];
      delete body['thumbnail.alt'];
      delete body['thumbnail.file'];
      
    } else {
      body = await req.json();
    }

    console.log('Final parsed product body:', JSON.stringify(body, null, 2));
    const product = await productController.create(body, conn);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}