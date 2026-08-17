import express from "express";

// Middleware
import { adminRateLimiter } from "../middleware/rateLimiter/adminRateLimiter.js";
import { checkRole } from "../middleware/checkRole.js";

// Validators
import {
  validateCategory,
  updateCategoryValidation,
  deleteCategoryValidation,
  restoreCategoryValidation,
  validateProduct,
  updateProductValidation,
  restoreProductValidation,
} from "../middleware/validators/adminValidators.js";

// Controllers
import {
  oneCategories,
  allCategories,
  createCategories,
  updateCategories,
  deleteCategories,
  restoreCategories,
} from "../controllers/adminControllers/categoriesController.js";

import {
  oneProducts,
  allProducts,
  createProducts,
  updateProducts,
  deleteProducts,
  restoreProducts,
} from "../controllers/adminControllers/productsController.js";

import { getAdminLogs } from "../controllers/adminControllers/logsController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// middleware
router.use(adminRateLimiter);
router.use(checkRole("admin"));

// -- Categories --
router.get("/categories", allCategories);
router.get("/categories/:slug", oneCategories);
router.post("/categories", validateCategory, createCategories);
router.patch("/categories/:slug", updateCategoryValidation, updateCategories);
router.delete("/categories/:slug", deleteCategoryValidation, deleteCategories);
router.post(
  "/categories/:slug/restore",
  restoreCategoryValidation,
  restoreCategories,
);

// -- Products --
router.get("/products", allProducts);
router.get("/products/:slug", oneProducts);
router.post(
  "/products",
  upload.single("image"),
  validateProduct,
  createProducts,
);
router.patch("/products/:slug", updateProductValidation, updateProducts);
router.delete("/products/:slug", deleteProducts);
router.post(
  "/products/:slug/restore",
  restoreCategoryValidation,
  restoreProducts,
);

// -- Logs --
router.get("/logs", getAdminLogs);

export default router;
