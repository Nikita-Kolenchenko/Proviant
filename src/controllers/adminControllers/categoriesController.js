import Categories from "../../models/Categories.js";
import Product from "../../models/Products.js";
import logger from "../../services/logger/logger.js";
import { matchedData } from "express-validator";
import fs from "fs";
import path from "path";

// -- getAdminLogs
export const getAdminLogs = async (req, res, next) => {
  try {
    const logPath = path.resolve("logs", "admin-actions.log");

    if (!fs.existsSync(logPath)) {
      return res.status(200).json([]); // Возвращаем пустой массив, если логов нет
    }

    // Читаем файл и разбиваем на массив по строкам
    const fileContent = fs.readFileSync(logPath, "utf-8");
    const lines = fileContent
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const formattedLogs = [];

    // Группируем по 3 строки, так как у нас в логе: Действие, Админ, Товар
    for (let i = 0; i < lines.length; i += 3) {
      if (lines[i]) {
        formattedLogs.push({
          action: lines[i] || "",
          admin: lines[i + 1] || "",
          target: lines[i + 2] || "",
        });
      }
    }

    // Отдаем массив объектов (свежие логи будут вверху)
    res.status(200).json(formattedLogs.reverse());
  } catch (error) {
    next(error);
  }
};

// -- oneCategories
export const oneCategories = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { admin } = req;

    // Check if there are products associated with the category
    const product = await Categories.findOne({ slug });
    if (!product) {
      const error = new Error("Категорію не знайдено.");
      error.status = 404;

      return next(error);
    }

    // Записываем понятный лог
    logger.info(
      `Действие: УДАЛЕНИЕ_ТОВАРА\nАдмин: ${admin.username} (ID: ${admin.id})\nТовар: ${product.slug} (ID: ${product.id})`,
    );
    console.log(`name: ${admin.username}, id: ${admin.id}`);

    res.status(200).send({ data: product });
  } catch (error) {
    next(error);
  }
};

// -- allCategories
export const allCategories = async (req, res, next) => {
  try {
    const categories = await Categories.find();
    if (categories.length === 0) {
      const error = new Error("Категорії не знайдені.");
      error.status = 404;
      return next(error);
    }

    res.status(200).send({
      data: categories.map((c) => ({ slug: c.slug, status: c.status })),
    });
  } catch (error) {
    next(error);
  }
};

// -- createCategories
export const createCategories = async (req, res, next) => {
  try {
    const { name, slug, status } = req.body;

    const statusBoolean = status ? "inactive" : "active";

    // Create a new category
    const createCategory = await Categories.create({
      name,
      slug,
      status: statusBoolean,
    });

    res.sendStatus(200);
  } catch (error) {
    if (error.code === 11000) {
      const customError = new Error(`Значення для поля вже існує.`);
      customError.status = 409;
      customError.data = { field: Object.keys(error.keyValue)[0] };

      return next(customError);
    }
    next(error);
  }
};

// -- updateCategories
export const updateCategories = async (req, res, next) => {
  try {
    const updates = matchedData(req);
    if (Object.keys(updates).length === 0) {
      const error = new Error("Вкажіть дані для оновлення.");
      error.status = 400;
      return next(error);
    }

    const categorySlug = req.params.slug;
    const currentCategory = await Categories.findOne({ slug: categorySlug });

    if (!currentCategory) {
      const error = new Error("Категорію не знайдено.");
      error.status = 404;
      return next(error);
    }

    const duplicateFields = Object.keys(updates).filter((key) => {
      return String(currentCategory[key]) === String(updates[key]);
    });

    if (duplicateFields.length === Object.keys(updates).length) {
      const fieldsList = duplicateFields.join(", ");
      const error = new Error(
        `Надіслані дані збігаються з поточними. Оновлення не потрібне.`,
      );
      error.data = duplicateFields;
      error.status = 400;
      return next(error);
    }

    const updateData = await Categories.findOneAndUpdate(
      { slug: categorySlug },
      { $set: updates },
      { returnDocument: "after", runValidators: true },
    );

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// -- deleteCategories
export const deleteCategories = async (req, res, next) => {
  try {
    const { deleteProducts } = req.body;
    if (typeof deleteProducts !== "boolean") {
      const error = new Error("Помилка.");
      error.status = 400;
      return next(error);
    }
    const categorySlug = req.params.slug;

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
    } else {
      await Product.updateMany(
        { categorySlug: categorySlug },
        {
          $set: { status: "inactive", categorySlug: null },
        },
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// -- restoreCategories
export const restoreCategories = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (typeof status !== "boolean") {
      const error = new Error("Помилка.");
      error.status = 400;
      return next(error);
    }

    // Determine the status string based on the boolean value
    const statusString = status ? "active" : "inactive";
    const { slug } = req.params;

    // Restore the category
    const restoredCategory = await Categories.findOneAndUpdate(
      { slug, status: "deleted" },
      { $set: { deleteTimes: null, status: statusString } },
      { returnDocument: "after", runValidators: true },
    );

    if (!restoredCategory) {
      const error = new Error("Категорії не існує, або її не можна відновити.");
      error.status = 400;
      return next(error);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
