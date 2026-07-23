import mongoose from "mongoose";

const categoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [2, "Назва має містити не менше 2 символів."],
      maxlength: [10, "Назва має містити не більше 10 символів."],
      unique: true,
    },
    slug: {
      type: String,
      minlength: [2, "Slug має містити не менше 2 символів."],
      maxlength: [30, "Slug має містити не більше 30 символів."],
      unique: true,
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

const Categories = mongoose.model("Categories", categoriesSchema);

export default Categories;
