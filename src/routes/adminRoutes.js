import express from "express";
import { apiLimiter } from "../middleware/rateLimiter/adminRateLimiter.js";
import { checkRole } from "../middleware/checkRole.js";
import {
  validateCategory,
  updateCategoryValidation,
  validateProduct,
  updateProductValidation,
} from "../middleware/validators/adminValidators.js";
import {
  oneCategories,
  allCategories,
  createCategories,
  updateCategories,
  deleteCategories,
  restoreCategories,
  getAdminLogs,
} from "../controllers/adminControllers/categoriesController.js";
import {
  oneProducts,
  allProducts,
  createProducts,
  updateProducts,
  deleteProducts,
  restoreProducts,
} from "../controllers/adminControllers/productsController.js";

const router = express.Router();

router.use(apiLimiter);

router.get("/admin-logs", checkRole("admin"), getAdminLogs);

// Categories
router.get("/categories/:slug", checkRole("admin"), oneCategories);
router.get("/categories", checkRole("admin"), allCategories);
router.post(
  "/categories",
  checkRole("admin"),
  validateCategory,
  createCategories,
);
router.patch(
  "/categories/:slug",
  checkRole("admin"),
  updateCategoryValidation,
  updateCategories,
);
router.delete("/categories/:slug", checkRole("admin"), deleteCategories);
router.post("/categories/:slug/restore", checkRole("admin"), restoreCategories);

// Products
router.get("/products/:slug", checkRole("admin"), oneProducts);
router.get("/products", checkRole("admin"), allProducts);
router.post("/products", checkRole("admin"), validateProduct, createProducts);
router.patch(
  "/products/:slug",
  checkRole("admin"),
  updateProductValidation,
  updateProducts,
);
router.delete("/products/:slug", checkRole("admin"), deleteProducts);
router.post("/products/:slug/restore", checkRole("admin"), restoreProducts);

export default router;
