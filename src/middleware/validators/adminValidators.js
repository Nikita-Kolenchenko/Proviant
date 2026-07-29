import { body, validationResult } from "express-validator";

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Помилка валідації даних",
      errors: errors.array(),
    });
  }
  next();
};

// Categories validation
export const validateCategory = [
  body("name")
    .notEmpty()
    .withMessage("Вкажіть назву категорії.")
    .isLength({ min: 2, max: 10 })
    .withMessage("Назва має бути від 2 до 10 символів"),
  body("slug")
    .notEmpty()
    .withMessage("Вкажіть slug категорії.")
    .isLength({ max: 30 })
    .withMessage("Slug не повинен перевищувати 30 символів"),
  body("status")
    .notEmpty()
    .withMessage("Вкажіть статус категорії.")
    .isBoolean()
    .withMessage("Статус повинен бути логічного типу (true або false)."),
  validateResult,
];

// Category update validation
export const updateCategoryValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage("Назва має бути від 2 до 10 символів"),

  body("slug")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Slug не повинен перевищувати 30 символів"),
  validateResult,
];

// Products validation
export const validateProduct = [
  body("name").notEmpty().withMessage("Вкажіть назву продукту."),
  body("price").isInt().withMessage("Ціна повинна бути числом."),
  body("purchasePrice")
    .isInt()
    .withMessage("Закупівельна ціна повинна бути числом."),
  body("stockQuantity")
    .isInt({ min: 0 })
    .withMessage("Кількість на складі повинна бути цілим числом."),
  body("sku").notEmpty().withMessage("Вкажіть SKU продукту."),
  body("slug").notEmpty().withMessage("Вкажіть slug продукту."),
  body("description").notEmpty().withMessage("Вкажіть опис продукту."),
  body("imageUrl").notEmpty().withMessage("Вкажіть URL зображення продукту."),
  body("categorySlug")
    .notEmpty()
    .withMessage("Вкажіть slug категорії продукту."),
  body("status")
    .notEmpty()
    .withMessage("Вкажіть статус продукту.")
    .isBoolean()
    .withMessage("Статус повинен бути логічного типу (true або false)."),
  validateResult,
];

// Product update validation
export const updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 25 })
    .withMessage("Назва має бути від 2 до 25 символів"),

  body("price")
    .optional()
    .trim()
    .isInt()
    .withMessage("Ціна повинна бути числом.")
    .toInt(),

  body("purchasePrice")
    .optional()
    .trim()
    .isInt()
    .withMessage("Закупівельна ціна повинна бути числом.")
    .toInt(),

  body("stockQuantity")
    .optional()
    .trim()
    .isInt({ min: 0 })
    .withMessage("Кількість на складі повинна бути цілим числом.")
    .toInt(),

  body("sku")
    .optional()
    .trim()
    .matches(/^SKU-[A-Za-z0-9]{3}-[A-Za-z0-9]{3}-[A-Za-z0-9]{3}$/)
    .withMessage("SKU повинен бути у форматі XXX-XXX-XXX-XXX."),

  body("slug").optional().trim(),

  body("description").optional().trim(),

  body("imageUrl").optional().trim(),

  body("categorySlug").optional().trim(),

  body("status")
    .optional()
    .isBoolean()
    .withMessage("Статус повинен бути логічного типу (true або false)."),
  validateResult,
];
