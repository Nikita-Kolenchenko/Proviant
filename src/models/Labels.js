import { request } from "express";
import mongoose from "mongoose";

const labelsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      minlength: [2, "Slug має містити не менше 2 символів."],
      maxlength: [30, "Slug має містити не більше 30 символів."],
      unique: true,
    },
  },
  { timestamps: true },
);

const Labels = mongoose.model("Labels", labelsSchema);

export default Labels;
