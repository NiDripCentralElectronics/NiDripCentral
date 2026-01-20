/**
 * @fileoverview Cloudinary utility for handling image uploads only.
 * Supports:
 * - Image uploads (JPG, PNG, JPEG, WEBP)
 * - Multer memory storage
 * - Folder-based organization for NiDrip platform
 */

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");

// ---------------------------------------------------------------------------
// CLOUDINARY CONFIGURATION
// ---------------------------------------------------------------------------

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing Cloudinary environment variables.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------------------------------------------------------------------
// ALLOWED IMAGE TYPES
// ---------------------------------------------------------------------------

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

// ---------------------------------------------------------------------------
// MULTER FILE FILTER
// ---------------------------------------------------------------------------

const fileFilter = (req, file, cb) => {
  if (!file) return cb(new Error("No file provided."), false);

  if (allowedImageTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error("Invalid file type. Allowed: JPG, PNG, WEBP."), false);
};

// ---------------------------------------------------------------------------
// MULTER MEMORY STORAGE
// ---------------------------------------------------------------------------

const storage = multer.memoryStorage();

// ---------------------------------------------------------------------------
// MULTI-FIELD UPLOAD CONFIGURATION
// ---------------------------------------------------------------------------

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "productImage", maxCount: 5 },
]);

// ---------------------------------------------------------------------------
// FOLDER ROUTING
// ---------------------------------------------------------------------------

const getFolderForUploadType = (type) => {
  const base = "NiDrip";

  switch (type) {
    case "profilePicture":
      return `${base}/profilePictures`;
    case "productImage":
      return `${base}/productImage`;
    default:
      throw new Error(`Unsupported upload type: ${type}`);
  }
};

// ---------------------------------------------------------------------------
// IMAGE UPLOAD TO CLOUDINARY
// ---------------------------------------------------------------------------

/**
 * Uploads image to Cloudinary.
 *
 * @param {object} file - Multer file object
 * @param {string} type - Upload context
 * @param {string} [existingPublicId]
 * @returns {Promise<{url: string, publicId: string}>}
 */
exports.uploadToCloudinary = async (file, type, existingPublicId = null) => {
  if (!file) throw new Error("No file provided for upload.");

  const folder = getFolderForUploadType(type);

  try {
    let publicId = existingPublicId;

    if (!publicId) {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e6);
      const ext = path.extname(file.originalname).replace(".", "") || "jpg";

      publicId = `${folder}/${timestamp}-${random}.${ext}`;
    }

    const fileBuffer = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64",
    )}`;

    const result = await cloudinary.uploader.upload(fileBuffer, {
      public_id: publicId,
      resource_type: "image",
      overwrite: true,
      invalidate: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

// ---------------------------------------------------------------------------
// DELETE IMAGE FROM CLOUDINARY
// ---------------------------------------------------------------------------

exports.deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    const url = new URL(fileUrl);

    // Remove protocol, domain, /image/upload/ and version folder
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Find where 'upload' is, then take everything after it + version
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1) return;

    // From version folder onward
    const afterUpload = pathParts.slice(uploadIndex + 1);

    // Remove version folder (v123456...) if exists
    let startIndex = 0;
    if (afterUpload[0]?.startsWith("v") && !afterUpload[0].includes(".")) {
      startIndex = 1;
    }

    // Now join the rest
    let publicId = afterUpload.slice(startIndex).join("/");

    // Remove extension(s) — remove everything after last dot
    if (publicId.includes(".")) {
      publicId = publicId.substring(0, publicId.lastIndexOf("."));
    }    

    console.log("Attempting to delete public_id:", publicId);

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    console.log("Deleted:", publicId);
  } catch (err) {
    console.error("Cloudinary Deletion Error:", err.message);
  }
};
