import express from "express";

// Middleware
import { adminLimiter } from "../middleware/limiters/admin.limiter.js";
import { checkRoleMiddleware } from "../middleware/check.role.middleware.js";

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
} from "../controllers/admin.controllers/categories.controller.js";

import {
  oneProducts,
  allProducts,
  createProducts,
  updateProducts,
  deleteProducts,
  restoreProducts,
} from "../controllers/admin.controllers/products.controller.js";

import { getAdminLogs } from "../controllers/admin.controllers/logs.controller.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// middleware
router.use(adminLimiter);
router.use(checkRoleMiddleware("admin"));

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
