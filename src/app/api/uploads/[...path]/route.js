import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

/**
 * API route to serve uploaded files
 * This is needed because Next.js standalone mode doesn't serve runtime-uploaded files
 * from the public folder automatically
 */
export async function GET(request, { params }) {
  try {
    const { path: filePath } = await params;
    
    if (!filePath || filePath.length === 0) {
      return NextResponse.json({ error: "File path required" }, { status: 400 });
    }

    // Join the path segments
    const relativePath = Array.isArray(filePath) ? filePath.join("/") : filePath;
    
    // Security: Prevent directory traversal
    if (relativePath.includes("..") || relativePath.startsWith("/")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), "public", relativePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      // Try with uppercase Uploads for backward compatibility
      const altPath = relativePath.replace(/^uploads\//i, "Uploads/");
      const altFullPath = path.join(process.cwd(), "public", altPath);
      
      if (existsSync(altFullPath)) {
        console.log(`[Uploads API] Serving file from alternate path: ${altFullPath}`);
        const fileBuffer = await readFile(altFullPath);
        const ext = path.extname(altFullPath).toLowerCase();
        
        // Determine content type
        const contentType = getContentType(ext);
        
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*", // Allow cross-origin requests
            "Access-Control-Allow-Methods": "GET",
          },
        });
      }
      
      console.error(`[Uploads API] File not found: ${fullPath} or ${altFullPath}`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    console.log(`[Uploads API] Serving file: ${fullPath}`);
    const fileBuffer = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    
    // Determine content type
    const contentType = getContentType(ext);
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*", // Allow cross-origin requests
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    console.error("[Uploads API] Error serving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getContentType(ext) {
  const contentTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
  };
  
  return contentTypes[ext] || "application/octet-stream";
}

