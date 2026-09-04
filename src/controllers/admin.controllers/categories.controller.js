import Categories from "#models/Categories.js";
import Product from "#models/Products.js";
import logger from "#services/logger/logger.js";
import { matchedData } from "express-validator";
import { createError } from "../../middleware/error.middleware.js";

// oneCategories
export const oneCategories = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find categories
    const product = await Categories.findOne({ slug: req.params });
    if (!product) {
      return next(createError(404, "Категорію не знайдено."));
    }

    res.status(200).send({ data: product });
  } catch (error) {
    next(error);
  }
};

// allCategories
export const allCategories = async (req, res, next) => {
  try {
    const categories = await Categories.find();
    if (categories.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).send({
      data: categories.map((c) => ({ slug: c.slug, status: c.status })),
    });
  } catch (error) {
    next(error);
  }
};

// createCategories
export const createCategories = async (req, res, next) => {
  try {
    const category = matchedData(req);
    const { admin } = req;

    // Create a new category
    const createCategory = await Categories.create(category);

    // Log the action
    logger.info(
      `Подія: СОТВОРЕННЯ_КАТЕГОРІЇ\nАдміністратор: ${admin.username} (ID: ${admin.id})\nКатегорія: ${createCategory.slug} (ID: ${createCategory.id})`,
    );

    res.sendStatus(201);
  } catch (error) {
    if (error.code === 11000) {
      return next(
        createError(409, "Користувач з таким email вже зареєстрований."),
      );
    }
    next(error);
  }
};

// updateCategories
export const updateCategories = async (req, res, next) => {
  try {
    const updates = matchedData(req);
    if (Object.keys(updates).length === 0)
      return next(createError(400, "Вкажіть дані для оновлення."));

    // Find categoties
    const currentCategory = await Categories.findOne({ slug: req.params.slug });
    if (!currentCategory) {
      return next(createError(404, "Категорію не знайдено.")); // Check category
    }

    // Сhecking for identical elements
    const duplicateFields = Object.keys(updates).filter((key) => {
      return String(currentCategory[key]) === String(updates[key]);
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

    // Update categories
    const updateData = await Categories.findOneAndUpdate(
      { _id: currentCategory._id },
      { $set: updates },
      { returnDocument: "after", runValidators: true },
    );

    // Log the action
    logger.info(
      `Подія: ОНОВЛЕННЯ_КАТЕГОРІЇ\nАдміністратор: ${req.admin.username} (ID: ${req.admin.id})\nКатегорія: ${updateData.slug} (ID: ${updateData.id})`,
    );

    res.status(200).json({ message: "Зміни збережено." });
  } catch (error) {
    console.error("Update category: " + error);
    next(error);
  }
};

// deleteCategories
export const deleteCategories = async (req, res, next) => {
  try {
    const categorySlug = req.params.slug;
    const { deleteProducts } = req.body;

    // Delete category
    const deletedCategory = await Categories.findOneAndUpdate(
      { slug: categorySlug, status: { $ne: "deleted" } },
      {
        $set: {
          deleteTimes: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: "deleted",
        },
      },
      { returnDocument: "after", runValidators: true },
    );

    if (!deletedCategory) {
      const error = new Error("Категорію не знайдено, або вона вже видалена.");
      error.status = 404;
      return next(error);
    }

    // Update associated products based on deleteProducts flag
    if (deleteProducts) {
      await Product.updateMany(
        { categorySlug: categorySlug },
        {
          $set: {
            deleteTimes: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: "deleted",
            categorySlug: null,
          },
        },
      );
      // Log the action
      logger.info(
        `Подія: ВИДАЛЕННЯ_КАТЕГОРІЇ(з видаленням продуктів)\nАдміністратор: ${req.dmin.username} (ID: ${req.admin.id})\nКатегорія: ${deletedCategory.slug} (ID: ${deletedCategory.id})`,
      );
    } else {
      await Product.updateMany(
        { categorySlug: categorySlug },
        {
          $set: { status: "inactive", categorySlug: null },
        },
      );
      // Log the action
      logger.info(
        `Подія: ВИДАЛЕННЯ_КАТЕГОРІЇ(без видалення продуктів)\nАдміністратор: ${req.admin.username} (ID: ${req.admin.id})\nКатегорія: ${deletedCategory.slug} (ID: ${deletedCategory.id})`,
      );
    }

    res.status(200).json({
      message: `Категорію ${deletedCategory.slug} видалено`,
      clue: "її можна відновити протягом двох тижнів.",
    });
  } catch (error) {
    console.error("Delete category" + error);
    next(error);
  }
};

// restoreCategories
export const restoreCategories = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { slug } = req.params;

    // Restore the category
    const restoredCategory = await Categories.findOneAndUpdate(
      { slug, status: "deleted" },
      { $set: { deleteTimes: null, status: status ? "active" : "inactive" } },
      { returnDocument: "after", runValidators: true },
    );

    if (!restoredCategory) {
      return next(
        createError(400, "Категорії не існує, або її не можна відновити."),
      );
    }

    // Log the action
    logger.info(
      `Подія: ВІДНОВЛЕННЯ_КАТЕГОРІЇ(без видалення продуктів)\nАдміністратор: ${req.admin.username} (ID: ${req.admin.id})\nКатегорія: ${restoredCategory.slug} (ID: ${restoredCategory.id})`,
    );

    res
      .status(200)
      .json({ message: `Категорію ${restoredCategory.slug} відновлено.` });
  } catch (error) {
    console.error("Restore castegory" + error);
    next(error);
  }
};
