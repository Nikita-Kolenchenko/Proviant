import Categories from "#models/Categories.js";
import Product from "#models/Products.js";
import logger from "#services/logger/logger.js";
import { matchedData } from "express-validator";

// -- oneProducts
export const oneProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

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

// -- allProducts
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

// -- createProducts
export const createProducts = async (req, res, next) => {
  try {
    const {
      name,
      price,
      purchasePrice,
      stockQuantity,
      sku,
      slug,
      description,
      imageUrl,
      categorySlug,
      status,
    } = req.body;

    // Check status
    const statusBoolean = status ? "inactive" : "active";
    const { admin } = req;

    // Check if category exists
    const categoryExists = await Categories.findOne({ slug: categorySlug });
    if (!categoryExists || categoryExists.status === "deleted") {
      const error = new Error(
        "Такої категорії не існує, або вона була видалена.",
      );
      error.status = 400;

      return next(error);
    }

    // Create new product
    const createProduct = await Product.create({
      name,
      price,
      purchasePrice,
      stockQuantity,
      sku,
      slug,
      description,
      imageUrl,
      categorySlug,
      status: statusBoolean,
    });

    // Log the action
    logger.info(
      `Подія: СТВОРЕННЯ_ТОВАРА\nАдміністратор: ${admin.username} (ID: ${admin.id})\nТовар: ${createProduct.slug} (ID: ${createProduct.id})`,
    );

    res.sendStatus(200);
  } catch (error) {
    // Handle duplicate key error (e.g., unique fields)
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

// -- updateProducts
export const updateProducts = async (req, res, next) => {
  try {
    const updates = matchedData(req);
    if (Object.keys(updates).length === 0) {
      const error = new Error("Вкажіть дані для оновлення.");
      error.status = 400;
      return next(error);
    }

    const productSlug = req.params.slug;
    const { admin } = req;

    const currentProduct = await Product.findOne({ slug: productSlug });
    if (!currentProduct) {
      const error = new Error("Продукт не знайдено.");
      error.status = 404;
      return next(error);
    }

    const hasChanges = Object.keys(updates).some((key) => {
      return String(currentProduct[key]) !== String(updates[key]);
    });

    if (!hasChanges) {
      const error = new Error(
        "Надіслані дані збігаються з поточними. Оновлення не потрібне.",
      );
      error.status = 400;
      return next(error);
    }

    await Product.findOneAndUpdate(
      { slug: productSlug },
      { $set: updates },
      { returnDocument: "after", runValidators: true },
    );

    // Log the action
    logger.info(
      `Подія: ОНОВЛЕННЯ_ТОВАРА\nАдміністратор: ${admin.username} (ID: ${admin.id})\nТовар: ${currentProduct.slug} (ID: ${currentProduct.id})`,
    );

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// -- deleteProducts
export const deleteProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }
    const { admin } = req;

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
    if (!deletedProduct) {
      const error = new Error("Продукт не знайдено.");
      error.status = 404;

      return next(error);
    }

    // Log the action
    logger.info(
      `Подія: ВИДАЛЕННЯ_ТОВАРА\nАдміністратор: ${admin.username} (ID: ${admin.id})\nТовар: ${deletedProduct.slug} (ID: ${deletedProduct.id})`,
    );

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// -- restoreProducts
export const restoreProducts = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (typeof status !== "boolean") {
      const error = new Error("Помилка.");
      error.status = 400;
      return next(error);
    }

    const statusString = status ? "active" : "inactive";
    const { admin } = req;

    const { slug } = req.params;
    const restoredProduct = await Product.findOneAndUpdate(
      { slug, status: "deleted" },
      { $set: { deleteTimes: null, status: statusString } },
      { returnDocument: "after", runValidators: true },
    );

    if (!restoredProduct) {
      const error = new Error(
        "Продукту не існує, або його не можна відновити.",
      );
      error.status = 400;
      return next(error);
    }

    // Log the action
    logger.info(
      `Подія: ВІДНОВЛЕННЯ_ТОВАРА\nАдміністратор: ${admin.username} (ID: ${admin.id})\nТовар: ${restoredProduct.slug} (ID: ${restoredProduct.id})`,
    );

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
