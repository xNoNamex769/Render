// src/middlewares/uploadConfig.ts
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Guardar los archivos en memoria
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("❌ Solo se permiten archivos de imagen"));
  }
};

export const upload = multer({
  storage,  // ⚡ en memoria
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
});
