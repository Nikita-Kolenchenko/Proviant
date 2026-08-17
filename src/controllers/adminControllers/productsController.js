import Categories from "#models/Categories.js";
import Product from "#models/Products.js";
import logger from "#services/logger/logger.js";
import { matchedData } from "express-validator";
import { createError } from "../../middleware/errorMiddleware.js";

// oneProducts
export const oneProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find product by slug
    const slugProduct = await Product.findOne({ slug: slug });
    if (!slugProduct) {
      const error = new Error("Продукт не знайдено.");
      error.status = 404;

      return next(error);
    }

    res.status(200).send({ data: slugProduct });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// allProducts
export const allProducts = async (req, res, next) => {
  try {
    const Products = await Product.find();
    if (Products.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).send({
      data: Products.map((p) => ({ slug: p.slug, status: p.status })),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// createProducts
export const createProducts = async (req, res, next) => {
  try {
    const product = matchedData(req);

    // Create new product
    const createProduct = await Product.create({
      ...product,
      imageUrl: req.file.path,
    });

    // Log the action
    logger.info(
      `Подія: СТВОРЕННЯ_ТОВАРА\nАдміністратор: ${req.admin.username} (ID: ${req.admin.id})\nТовар: ${createProduct.slug} (ID: ${createProduct.id})`,
    );

    res.status(201).json({ message: "Успішно!" });
  } catch (error) {
    if (error.code === 11000) {
      const customError = new Error(`Значення для поля вже існує.`);
      customError.status = 409;
      customError.data = { field: Object.keys(error.keyValue)[0] };

      return next(customError);
    }
    console.error(error);
    next(error);
  }
};

// updateProducts
export const updateProducts = async (req, res, next) => {
  try {
    const updates = matchedData(req);
    if (Object.keys(updates).length === 0)
      return next(createError(400, "Вкажіть дані для оновлення."));

    // Find product
    const currentProduct = await Product.findOne({ slug: req.params.slug });
    if (!currentProduct) return next(createError(404, "Продукт не знайдено.")); // Check product

    // Сhecking for identical elements
    const duplicateFields = Object.keys(updates).filter((key) => {
      return String(currentProduct[key]) === String(updates[key]);
    });
    if (duplicateFields.length !== 0) {
      return next(
        createError(
          400,
          "Надіслані дані збігаються з поточними.",
          duplicateFields,
        ),
      );
    }

    await Product.findOneAndUpdate(
      { _id: currentProduct._id },
      { $set: updates },
      { returnDocument: "after", runValidators: true },
    );

    // Log the action
    logger.info(
      `Подія: ОНОВЛЕННЯ_ТОВАРА\nАдміністратор: ${req.admin.username} (ID: ${req.admin.id})\nТовар: ${currentProduct.slug} (ID: ${currentProduct.id})`,
    );

    res.status(200).json({ message: "Зміни збережено." });
  } catch (error) {
    console.error("Update product: " + error);
    next(error);
  }
};

// deleteProducts
export const deleteProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Change product
    const deletedProduct = await Product.findOneAndUpdate(
      { slug, status: { $ne: "deleted" } },
      {
        $set: {
          deleteTimes: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: "deleted",
        },
      },
      { returnDocument: "after", runValidators: true },
    );
    if (!deletedProduct) return next(createError(400, "Продукт не знайдено."));

    // Log the action
    logger.info(
      `Подія: ВИДАЛЕННЯ_ТОВАРА\nАдміністратор: ${req.admin.username} (ID: ${req.admin.id})\nТовар: ${deletedProduct.slug} (ID: ${deletedProduct.id})`,
    );

    res.status(200).json({
      message: `Товар ${deleteProduct.slug} видалено`,
      clue: "його можна відновити протягом двох тижнів.",
    });
  } catch (error) {
    console.error("Delete product: " + error);
    next(error);
  }
};

// restoreProducts
export const restoreProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    // Change product
    const restoredProduct = await Product.findOneAndUpdate(
      { slug, status: "deleted" },
      { $set: { deleteTimes: null, status: status ? "active" : "inactive" } },
      { returnDocument: "after", runValidators: true },
    );
    if (!restoredProduct) {
      return next(
        createError(400, "Продукту не існує, або його не можна відновити."),
      );
    }

    // Log the action
    logger.info(
      `Подія: ВІДНОВЛЕННЯ_ТОВАРА\nАдміністратор: ${req.admin.username} (ID: ${req.admin.id})\nТовар: ${restoredProduct.slug} (ID: ${restoredProduct.id})`,
    );

    res
      .status(200)
      .json({ message: `Товар ${restoreProduct.slug} відновлено.` });
  } catch (error) {
    console.error("Restore product: " + error);
    next(error);
  }
};
