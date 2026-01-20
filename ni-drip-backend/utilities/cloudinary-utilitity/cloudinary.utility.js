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
}).fields([{ name: "profilePicture", maxCount: 1 }]);

// ---------------------------------------------------------------------------
// FOLDER ROUTING
// ---------------------------------------------------------------------------

const getFolderForUploadType = (type) => {
  const base = "NiDrip";

  switch (type) {
    case "profilePicture":
      return `${base}/profilePictures`;
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
  try {
    if (!fileUrl) return;

    const url = new URL(fileUrl);
    const parts = url.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) return;

    let publicId = parts.slice(uploadIndex + 2).join("/");
    publicId = publicId.substring(0, publicId.lastIndexOf("."));

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (err) {
    console.error("Cloudinary Deletion Error:", err);
  }
};
