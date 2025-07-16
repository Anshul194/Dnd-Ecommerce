import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function saveFile(file, uploadDir = "uploads") {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create upload directory if it doesn't exist
  const uploadPath = path.join(process.cwd(), "public", uploadDir);
  try {
    await mkdir(uploadPath, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Generate unique filename
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExtension = path.extname(file.name);
  const filename = `profile-${uniqueSuffix}${fileExtension}`;
  const filepath = path.join(uploadPath, filename);

  // Save file
  await writeFile(filepath, buffer);

  // Return the public URL path
  return `/${uploadDir}/${filename}`;
}

export async function deleteFile(fileUrl) {
  try {
    if (!fileUrl) return;

    // Extract filename from URL
    const filename = path.basename(fileUrl);
    const filepath = path.join(process.cwd(), "public", fileUrl);

    // Delete file
    await unlink(filepath);
    console.log("Deleted old file:", filename);
  } catch (error) {
    console.error("Error deleting file:", error.message);
    // Don't throw error - just log it
  }
}

export function validateImageFile(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/svg+xml",
  ];
  const maxSize = 10 * 1024 * 1024; // 5MB

  console.log("Validating file:", typeof file, file.name, file.size, file.type);
  // If file is a string (e.g., from a URL or path), try to convert it to a File-like object
  if (typeof file === "string") {
    throw new Error(
      "File must be a File or Blob object, not a string. If you want to upload from a URL or path, fetch the file and convert it to a File or Buffer first."
    );
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
    );
  }

  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.");
  }

  return true;
}
