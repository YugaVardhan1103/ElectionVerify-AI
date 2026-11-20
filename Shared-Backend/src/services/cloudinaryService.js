import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/environment.js";

// Configure Cloudinary SDK instance
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Validates image buffer magic bytes / file signatures to prevent MIME spoofing.
 *
 * Supported types:
 * - JPEG/JPG: FF D8 FF
 * - PNG: 89 50 4E 47 0D 0A 1A 0A
 * - WEBP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
 *
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {boolean}
 */
export function isValidImageSignature(buffer, mimetype) {
  if (!buffer || buffer.length < 12) return false;

  const normalizedMime = (mimetype || "").toLowerCase().trim();

  // JPEG / JPG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return normalizedMime === "image/jpeg" || normalizedMime === "image/jpg";
  }

  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return normalizedMime === "image/png";
  }

  // WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return normalizedMime === "image/webp";
  }

  return false;
}

/**
 * Upload an in-memory image buffer to Cloudinary.
 *
 * @param {Buffer} buffer
 * @param {object} [options={}]
 * @returns {Promise<object>} Cloudinary upload result
 */
export function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "electionverify/evidence",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete an image asset from Cloudinary by its public ID.
 *
 * @param {string} publicId
 * @returns {Promise<object>}
 */
export async function deleteFromCloudinary(publicId) {
  if (!publicId) return null;
  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return res;
  } catch (err) {
    console.warn(
      `[Cloudinary Cleanup Warning] Failed to delete image ${publicId}:`,
      err.message
    );
    return null;
  }
}

export { cloudinary };
