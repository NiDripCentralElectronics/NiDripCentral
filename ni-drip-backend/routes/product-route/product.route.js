/**
 * @fileoverview Express routes for Product Management
 * @module routes/productRoutes
 * @description Provides endpoints for:
 * - Product Creation (Admin Only)
 * - Fetch All Products
 * - Fetch Product By Id
 * - Update Product By Id (Admin Only)
 * - Delete Product By Id (Admin Only)
 */

const express = require("express");
const router = express.Router();
const productController = require("../../controllers/product-controller/product.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");
const cloudinaryUtility = require("../../utilities/cloudinary-utilitity/cloudinary.utility");

/**
 * @desc Create a new product with image upload
 */
router.post(
  "/add-product",
  encryptedAuthMiddleware,
  cloudinaryUtility.upload, // Handles productImage field
  productController.addProduct,
);

/**
 * @desc Retrieve all products (Public access for Users)
 */
router.get("/get-all-products", productController.getAllProducts);

/**
 * @desc  Retrieve a single product's details
 */
router.get("/get-product-by-id/:productId", productController.getProductById);

/**
 * @desc Update product
 */
router.patch(
  "/update-product/:productId",
  encryptedAuthMiddleware,
  cloudinaryUtility.upload,
  productController.updateProduct,
);

/**
 * @desc Remove product
 */
router.delete(
  "/delete-product/:productId",
  encryptedAuthMiddleware,
  productController.deleteProduct,
);

/**
 * @desc Rate a product
 */
router.post(
  "/rate-product/:productId",
  encryptedAuthMiddleware,
  productController.rateProduct,
);

module.exports = router;
