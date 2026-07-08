import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) => {
    callback(null, "uploads/");
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    callback(null, uniqueName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error("Only JPG, PNG, and WEBP images are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export default upload;