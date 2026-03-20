import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Extract the Cloudinary public ID from a URL
 * e.g., https://res.cloudinary.com/cloud/image/upload/v12345/folder/image.jpg -> folder/image
 */
export function extractPublicId(url: string | null | undefined): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;

  // 1. Handle standard format with version: /v12345/folder/image.jpg
  const versionMatch = url.match(/\/v\d+\/(.+?)\.[a-zA-Z0-9]+$/);
  if (versionMatch && versionMatch[1]) {
    return versionMatch[1];
  }

  // 2. Handle format without version: /upload/folder/image.jpg
  const uploadMatch = url.match(/\/upload\/(.+?)\.[a-zA-Z0-9]+$/);
  if (uploadMatch && uploadMatch[1]) {
    return uploadMatch[1];
  }

  return null;
}

/**
 * Delete an image from Cloudinary by its public ID.
 * Returns true if successful, false otherwise.
 */
export async function deleteImageByPublicId(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary] Deleted ${publicId}:`, result);
    return result.result === "ok";
  } catch (error) {
    console.error("[Cloudinary] Error deleting image:", error);
    return false;
  }
}

/**
 * Delete an image from Cloudinary by its URL.
 */
export async function deleteImageByUrl(url: string | null | undefined): Promise<boolean> {
  const publicId = extractPublicId(url);
  if (!publicId) return false;
  return deleteImageByPublicId(publicId);
}

/**
 * Upload a server-side Buffer (or File converted to buffer) to Cloudinary
 * Useful for authenticated admin-side uploads
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string = "clinic"
): Promise<{ url: string; publicId: string } | null> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("[Cloudinary] Upload stream error:", error);
            return resolve(null); // fail gracefully without throwing 500
          }
          if (result) {
            resolve({ url: result.secure_url, publicId: result.public_id });
          } else {
            resolve(null);
          }
        }
      )
      .end(buffer);
  });
}
