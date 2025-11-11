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
    const Product =
      conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);
    console.log("Fetching product with ID:", id);
    const response = await productController.getById(id, conn);

    return NextResponse.json(
      {
        success: response.success,
        message: response.message,
        product: response.data,
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
    const id = params.id;
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
    const Product =
      conn.models.Product || conn.model("Product", ProductModel.schema);
    const productRepo = new ProductRepository(Product);
    const productService = new ProductService(productRepo);
    const productController = new ProductController(productService);

    // First, get the existing product to preserve current images
    const existingProductResult = await productController.getById(id, conn);
    if (!existingProductResult.success) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    const existingProduct = existingProductResult.data;

    const contentType = req.headers.get("content-type") || "";
    let body = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      // Initialize arrays as empty to only include what's sent in the request
      body.images = existingProduct.images || [];
      body.descriptionImages = existingProduct.descriptionImages || [];
      body.thumbnail = existingProduct.thumbnail || null;
      body.ingredients = existingProduct.ingredients || [];
      body.benefits = existingProduct.benefits || [];
      body.precautions = existingProduct.precautions || [];
      body.howToUseSteps = existingProduct.howToUseSteps || [];

      for (const [key, value] of formData.entries()) {
        console.log(
          `Processing PUT field: ${key}=${
            value instanceof File ? `File(${value.name})` : value
          }`
        );

        // Handle thumbnail fields specifically
        if (
          key === "thumbnail.file" ||
          (key === "thumbnail" && value instanceof File)
        ) {
          if (value instanceof File) {
            try {
              const url = await saveFile(value, "uploads/Product");
              body.thumbnail = { url, alt: body.thumbnail?.alt || "" };
              console.log(`Thumbnail updated: ${url}`);
            } catch (error) {
              console.error(`Error saving thumbnail file:`, error.message);
            }
          }
          continue;
        }

        if (key === "thumbnail.alt") {
          if (body.thumbnail) {
            body.thumbnail.alt = value;
          } else {
            body.thumbnail = { url: "", alt: value };
          }
          continue;
        }

        // Handle thumbnail[file], thumbnail[alt] patterns
        const thumbnailMatch = key.match(/^thumbnail\[(\w+)\]$/);
        if (thumbnailMatch) {
          const prop = thumbnailMatch[1];
          if (prop === "file" && value instanceof File) {
            try {
              const url = await saveFile(value, "uploads/Product");
              body.thumbnail = { url, alt: body.thumbnail?.alt || "" };
              console.log(`Thumbnail updated via bracket: ${url}`);
            } catch (error) {
              console.error(`Error saving thumbnail file:`, error.message);
            }
          } else if (prop === "alt") {
            if (body.thumbnail) {
              body.thumbnail.alt = value;
            } else {
              body.thumbnail = { url: "", alt: value };
            }
          }
          continue;
        }

        // Handle array patterns for images
        const arrObjMatch = key.match(/([\w]+)\[(\d+)\](?:\.([\w]+|file))?/);
        const objObjMatch = key.match(/([\w]+)\.(\w+)/);

        if (arrObjMatch) {
          const arrKey = arrObjMatch[1];
          const arrIdx = parseInt(arrObjMatch[2]);
          const objKey = arrObjMatch[3];

          if (["images", "descriptionImages"].includes(arrKey)) {
            // Ensure the array index exists
            if (!body[arrKey][arrIdx])
              body[arrKey][arrIdx] = { url: "", alt: "" };

            if (objKey === "file" && value instanceof File) {
              try {
                const url = await saveFile(value, "uploads/Product");
                body[arrKey][arrIdx].url = url;
                console.log(`${arrKey}[${arrIdx}] file updated: ${url}`);
              } catch (error) {
                console.error(`Error saving ${arrKey} file:`, error.message);
              }
            } else if (objKey === "alt") {
              body[arrKey][arrIdx].alt = value;
            } else if (objKey === "url" && typeof value === "string") {
              body[arrKey][arrIdx].url = value;
            }
          } else if (
            [
              "howToUseSteps",
              "ingredients",
              "benefits",
              "precautions",
            ].includes(arrKey)
          ) {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};

            if (objKey === "image" && value instanceof File) {
              try {
                const url = await saveFile(value, "Uploads/Product");
                body[arrKey][arrIdx].image = url;
                console.log(`${arrKey}[${arrIdx}] image updated: ${url}`);
              } catch (error) {
                console.error(`Error saving ${arrKey} image:`, error.message);
              }
            } else if (objKey && objKey !== "image") {
              body[arrKey][arrIdx][objKey] = value;
            }
          } else if (arrKey === "attributeSet") {
            if (!body[arrKey]) body[arrKey] = [];
            if (!body[arrKey][arrIdx]) body[arrKey][arrIdx] = {};
            if (objKey) {
              body[arrKey][arrIdx][objKey] = value;
            } else {
              body[arrKey][arrIdx] = { attributeId: value };
            }
          } else if (
            ["searchKeywords", "highlights", "frequentlyPurchased"].includes(
              arrKey
            )
          ) {
            if (!body[arrKey]) body[arrKey] = [];
            body[arrKey][arrIdx] = value;
          }
        } else if (objObjMatch) {
          const objKey = objObjMatch[1];
          const prop = objObjMatch[2];

          if (objKey === "thumbnail") {
            // Already handled above
            continue;
          } else {
            body[key] = value;
          }
        } else if (key === "images" && value instanceof File) {
          try {
            const url = await saveFile(value, "uploads/Product");
            body.images.push({ url, alt: "" });
            console.log(`New image added: ${url}`);
          } catch (error) {
            console.error(`Error saving images file:`, error.message);
          }
        } else if (key === "descriptionImages" && value instanceof File) {
          try {
            const url = await saveFile(value, "Uploads/Product");
            body.descriptionImages.push({ url, alt: "" });
            console.log(`New description image added: ${url}`);
          } catch (error) {
            console.error(
              `Error saving descriptionImages file:`,
              error.message
            );
          }
        } else if (
          (key === "storyVideoUrl" || key === "storyVideo") &&
          value instanceof File
        ) {
          // Accept videos (mp4, mov, etc.) and gifs for storyVideoUrl
          try {
            const mime = value.type || "";
            if (mime.startsWith("video/") || mime === "image/gif") {
              const url = await saveFile(value, "uploads/Product");
              body.storyVideoUrl = url;
              console.log(`storyVideoUrl updated: ${url}`);
            } else {
              console.error(
                `Invalid story video type for PUT: ${mime} (${value.name})`
              );
            }
          } catch (error) {
            console.error("Error saving storyVideoUrl in PUT:", error.message);
          }
        } else if (/^storyVideoUrl\[(\w+)\]$/.test(key)) {
          const prop = key.match(/^storyVideoUrl\[(\w+)\]$/)[1];
          if (prop === "file" && value instanceof File) {
            try {
              const mime = value.type || "";
              if (mime.startsWith("video/") || mime === "image/gif") {
                const url = await saveFile(value, "uploads/Product");
                body.storyVideoUrl = url;
                console.log(`storyVideoUrl updated via bracket: ${url}`);
              } else {
                console.error(
                  `Invalid story video type for PUT bracket: ${mime} (${value.name})`
                );
              }
            } catch (error) {
              console.error(
                "Error saving storyVideoUrl (bracket) in PUT:",
                error.message
              );
            }
          } else if (prop === "url") {
            body.storyVideoUrl = value;
          }
        } else {
          body[key] = value;
        }
      }

      // Clean up arrays - remove entries with no valid url
      if (body.images) {
        body.images = body.images.filter((img) => img && img.url);
      }
      if (body.descriptionImages) {
        body.descriptionImages = body.descriptionImages.filter(
          (img) => img && img.url
        );
      }

      // Only remove thumbnail if explicitly set to empty
      if (body.thumbnail && !body.thumbnail.url && !body.thumbnail.alt) {
        delete body.thumbnail;
      }
    } else {
      body = await req.json();

      // For JSON updates, preserve existing images if not provided
      if (body.thumbnail === undefined) {
        body.thumbnail = existingProduct.thumbnail;
      }
      if (body.images === undefined) {
        body.images = existingProduct.images;
      }
      if (body.descriptionImages === undefined) {
        body.descriptionImages = existingProduct.descriptionImages;
      }
      if (body.storyVideoUrl === undefined) {
        body.storyVideoUrl = existingProduct.storyVideoUrl;
      }

      // Preserve nested images
      const nestedFields = [
        "ingredients",
        "benefits",
        "precautions",
        "howToUseSteps",
      ];
      nestedFields.forEach((field) => {
        if (body[field] === undefined) {
          body[field] = existingProduct[field];
        } else if (
          Array.isArray(body[field]) &&
          Array.isArray(existingProduct[field])
        ) {
          body[field] = body[field].map((item, index) => {
            const existingItem = existingProduct[field][index];
            if (existingItem && item && !item.image && existingItem.image) {
              return { ...item, image: existingItem.image };
            }
            return item;
          });
        }
      });
    }

    console.log("Final PUT body:", JSON.stringify(body, null, 2));
    const updateResult = await productController.update(id, body, conn);

    let fullProduct = null;
    if (updateResult && updateResult.success) {
      const getResult = await productController.getById(id, conn);
      if (getResult && getResult.success) {
        fullProduct = getResult.data;
      }
    }

    return NextResponse.json(
      {
        success: updateResult.success,
        message: updateResult.message,
        product: fullProduct,
      },
      {
        status: updateResult.success ? 200 : 400,
      }
    );
  } catch (error) {
    console.error("PUT error:", error);
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
    const Product =
      conn.models.Product || conn.model("Product", ProductModel.schema);
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
