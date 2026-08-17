import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_KEY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Proviant",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        quality: "auto",
      },
    ],
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Файл має бути зображенням!"), false);
    }
  },
});
