import { v2 as cloudinary } from "cloudinary";

function ensureCloudinaryConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload image buffer to Cloudinary under folder 'coupon/{type}'
 * Types: 'reviews' | 'users' | 'admins'
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  type: "reviews" | "users" | "admins" = "reviews"
): Promise<{ secure_url: string; public_id: string }> {
  ensureCloudinaryConfigured();

  const folder = `coupon/${type}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
}

/**
 * Extract Cloudinary public_id from a secure_url
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;
    let path = pathname.slice(uploadIndex + "/upload/".length);
    path = path.replace(/^v\d+\//, "");
    const lastDot = path.lastIndexOf(".");
    if (lastDot !== -1) path = path.slice(0, lastDot);
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

/**
 * Delete an image from Cloudinary by public_id or secure_url
 */
export async function deleteFromCloudinary(urlOrPublicId: string): Promise<boolean> {
  try {
    ensureCloudinaryConfigured();
    const publicId = urlOrPublicId.startsWith("http")
      ? extractPublicIdFromUrl(urlOrPublicId)
      : urlOrPublicId;

    if (!publicId) return false;

    const res = await cloudinary.uploader.destroy(publicId);
    return res?.result === "ok";
  } catch (err) {
    console.error("Failed to delete from Cloudinary:", err);
    return false;
  }
}
