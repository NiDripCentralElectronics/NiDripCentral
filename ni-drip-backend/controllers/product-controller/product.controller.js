/**
 * @file Product controller
 * @description Controller module for managing the NIDRIP product catalog.
 * Supports:
 * - Product creation with Cloudinary image integration.
 * - Global product retrieval with admin details.
 * - Detailed view of single products.
 * - Patch updates for metadata, stock, and status.
 * - Secure deletion with asset cleanup.
 * @module controllers/productController
 */

const Product = require("../../models/product-model/product.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utilitity/cloudinary.utility");

/**
 * Add a new product to the catalog
 * POST /api/product/add-product
 * Private access (SUPERADMIN only)
 */
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, status } = req.body;

    if (!req.files?.productImage || req.files.productImage.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    // Upload ALL images
    const imageUploadPromises = req.files.productImage.map((file) =>
      uploadToCloudinary(file, "productImage"),
    );

    const uploadedImages = await Promise.all(imageUploadPromises);

    const imageUrls = uploadedImages.map((img) => img.url);

    const product = new Product({
      title,
      description,
      price,
      category: Array.isArray(category) ? category : [category],
      stock,
      status: status || "ACTIVE",
      productImages: imageUrls,
      addedBy: req.user.id,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get all products with SuperAdmin details
 * GET /api/product/get-all-products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("addedBy", "userName email")
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      allProducts: products,
    });
  } catch (error) {
    console.error("❌ Fetch Products Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Get single product by ID
 * GET /api/product/get-product-by-id/:productId
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate(
      "addedBy",
      "userName",
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Fetch Product ID Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Update product metadata, status, or image
 * PATCH /api/product/update-product/:productId
 * Private access (SUPERADMIN only)
 */
exports.updateProduct = async (req, res) => {
  try {
    if (req.user?.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can update products.",
      });
    }

    const { productId } = req.params;
    let product = await Product.findByIdAndUpdate(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    let updates = { ...req.body };

    // Handle Category formatting if sent as string
    if (updates.category && !Array.isArray(updates.category)) {
      updates.category = [updates.category];
    }

    // Handle Image Replacement
    if (req.files?.productImage?.length > 0) {
      // Delete old images
      if (product.productImages?.length) {
        await Promise.all(
          product.productImages.map((img) => deleteFromCloudinary(img)),
        );
      }

      const uploadPromises = req.files.productImage.map((file) =>
        uploadToCloudinary(file, "productImage"),
      );

      const uploadedImages = await Promise.all(uploadPromises);
      updates.productImages = uploadedImages.map((img) => img.url);
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Update Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Delete product and cleanup Cloudinary assets
 * DELETE /api/product/delete-product/:productId
 * Private access (SUPERADMIN only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    if (req.user?.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action.",
      });
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (product.productImages?.length > 0) {
      const deletePromises = product.productImages.map((url) =>
        deleteFromCloudinary(url).catch((err) => {
          console.error(`Failed to delete Cloudinary image ${url}:`, err);
        }),
      );

      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(req.params.productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during product deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
