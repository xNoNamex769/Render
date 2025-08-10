import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Ruta donde se guardarán los archivos
const uploadDir = path.join(__dirname, "../../uploads");

// Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });  // recursive para crear todas las carpetas necesarias
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (_req: Request, _file: Express.Multer.File, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req: Request, file: Express.Multer.File, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + ext;
    cb(null, name); // Nombre único
  },
});

// Filtro de tipo de archivo (solo imágenes)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("❌ Solo se permiten archivos de imagen"));
  }
};

// Exportación del middleware ya configurado
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});
