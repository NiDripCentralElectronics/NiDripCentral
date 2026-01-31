/**
 * @fileoverview Product controller – manages catalog CRUD
 * @module controllers/productController
 * @description Handles creation, listing, details, updates, and deletion
 *              with Cloudinary image support.
 */

const Product = require("../../models/product-model/product.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utilitity/cloudinary.utility");

/**
 * Create new product (with images)
 * @body {string} title
 * @body {string} description
 * @body {number} price
 * @body {string|string[]} category
 * @body {number} stock
 * @body {string} [status="ACTIVE"]
 * @files {productImage[]} – up to 5 images
 * @access Private (SuperAdmin)
 */
exports.addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      stock,
      status,
      specifications,
    } = req.body;

    if (!req.files?.productImage?.length) {
      return res.status(400).json({
        success: false,
        message: "At least one product image required",
      });
    }

    const uploadedImages = await Promise.all(
      req.files.productImage.map((file) =>
        uploadToCloudinary(file, "productImage"),
      ),
    );

    const imageUrls = uploadedImages.map((img) => img.url);

    const product = new Product({
      title,
      description,
      price: Number(price),
      category: Array.isArray(category) ? category : [category],
      stock: Number(stock),
      status: status || "ACTIVE",
      productImages: imageUrls,
      addedBy: req.user.id,
      specifications: specifications ? JSON.parse(specifications) : [],
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      newProduct: product,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get all products
 * @access Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("addedBy", "userName email")
      .populate({
        path: "reviews.user",
        select: "id profilePicture userName email",
      })
      .populate({
        path: "ratings.user",
        select: "id profilePicture userName email",
      })
      .sort({ createdAt: -1 });

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      allProducts: products,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get single product details
 * @param {string} productId
 * @access Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate("addedBy", "userName email")
      .populate("reviews.user", "profilePicture userName email"); // Deep populate user in reviews

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update product (metadata, images, stock, status)
 * @param {string} productId
 * @body {string} [title]
 * @body {string} [description]
 * @body {number} [price]
 * @body {string|string[]} [category]
 * @body {number} [stock]
 * @body {string} [status]
 * @files {productImage[]} – replace all images if provided
 * @access Private (SuperAdmin)
 */
exports.updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Prepare update object with only provided fields
    const updates = {};
    const updateableFields = [
      "title",
      "description",
      "price",
      "category",
      "stock",
      "specifications",
    ];

    // Add only the fields that are provided in the request body AND have a valid value
    updateableFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        // Handle category field - convert to array if it's not already
        if (field === "category") {
          if (Array.isArray(req.body[field]) && req.body[field].length > 0) {
            updates.category = req.body[field];
          } else if (
            typeof req.body[field] === "string" &&
            req.body[field].trim() !== ""
          ) {
            updates.category = [req.body[field]];
          }
        }
        // Handle specifications field
        else if (field === "specifications") {
          if (Array.isArray(req.body[field]) && req.body[field].length > 0) {
            updates.specifications = req.body[field];
          } else if (
            typeof req.body[field] === "string" &&
            req.body[field].trim() !== ""
          ) {
            // Try to parse if it's a JSON string
            try {
              const parsed = JSON.parse(req.body[field]);
              if (Array.isArray(parsed) && parsed.length > 0) {
                updates.specifications = parsed;
              }
            } catch (e) {
              // If not valid JSON, check if it's a non-empty string
              if (req.body[field].trim() !== "") {
                updates.specifications = req.body[field];
              }
            }
          }
        }
        // Handle other fields with validation
        else if (field === "price" || field === "stock") {
          // For numeric fields, only update if it's a valid number
          const value = parseFloat(req.body[field]);
          if (!isNaN(value) && value >= 0) {
            updates[field] = value;
          }
        }
        // Handle string fields (title, description)
        else if (
          typeof req.body[field] === "string" &&
          req.body[field].trim() !== ""
        ) {
          updates[field] = req.body[field];
        }
        // For other types, just update as-is
        else if (req.body[field] !== null) {
          updates[field] = req.body[field];
        }
      }
    });

    // Handle product images separately
    if (req.files?.productImage?.length) {
      // Delete old images
      if (product.productImages?.length) {
        await Promise.all(
          product.productImages.map((url) => deleteFromCloudinary(url)),
        );
      }

      // Upload new images
      const uploaded = await Promise.all(
        req.files.productImage.map((file) =>
          uploadToCloudinary(file, "productImage"),
        ),
      );

      updates.productImages = uploaded.map((img) => img.url);
    }

    // If no updates are provided, return error
    if (Object.keys(updates).length === 0 && !req.files?.productImage?.length) {
      return res.status(400).json({
        success: false,
        message: "No updates provided",
      });
    }

    // Update only the provided fields
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      updates,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Delete product and clean up images
 * @param {string} productId
 * @access Private (SuperAdmin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.productImages?.length) {
      await Promise.all(
        product.productImages.map((url) =>
          deleteFromCloudinary(url).catch((err) =>
            console.error("Image delete failed:", err),
          ),
        ),
      );
    }

    await Product.findByIdAndDelete(req.params.productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
