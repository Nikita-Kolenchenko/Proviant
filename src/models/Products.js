import { request } from "express";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [2, "Назва має містити не менше 2 символів."],
      maxlength: [25, "Назва має містити не більше 25 символів."],
      trim: true,
      required: true,
      unique: true,
    },
    price: { type: Number, required: true },
    newPrice: { type: Number, default: null },
    purchasePrice: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0, required: true }, // Количество товара на складе
    sku: {
      type: String,
      match: [
        /^.{15}$/,
        "SKU має містити рівно 15 символів формату 'XXX-XXX-XXX-XXX'.",
      ],
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      minlength: [2, "Slug має містити не менше 2 символів."],
      maxlength: [30, "Slug має містити не більше 30 символів."],
      required: true,
      unique: true,
    },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true, unique: true },
    categorySlug: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
    deleteTimes: {
      type: Date,
      default: null,
      expires: 0,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
