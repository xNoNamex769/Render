import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Ruta donde se guardarán los archivos
const uploadDir = path.join(__dirname, "../../uploads/usuarios");

// Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + ext;
    cb(null, name);
  },
});

// Filtrar solo imágenes
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("❌ Solo se permiten archivos de imagen"));
  }
};

// Exportar middleware para múltiples campos
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Configurar multer para campos específicos de archivos
export const uploadFields = upload.fields([
  { name: "imagenPerfil", maxCount: 1 },
  { name: "imagenUbicacion", maxCount: 1 },
]);
