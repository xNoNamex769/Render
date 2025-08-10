import { Request, Response, NextFunction } from "express";
import { param, validationResult, body } from "express-validator";
import { PrestamoElementos } from "../models/PrestamoElementos";

// Valida el ID del alquiler
export const validateIdAlquiler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("IdAlquiler")
    .isInt()
    .withMessage("Id no válido")
    .custom((value) => value > 0)
    .withMessage("Id no válido")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};
// Valida el parámetro IdUsuario en la ruta
export const validateIdUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("IdUsuario")
    .isInt()
    .withMessage("IdUsuario debe ser un número entero")
    .custom((value) => value > 0)
    .withMessage("IdUsuario debe ser mayor que 0")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};

// Valida si el nombre del elemento de alquiler ya existe
export const validateIdAlquilerYaExiste = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("NombreElemento")
    .custom(async (value) => {
      const alquilerExistente = await PrestamoElementos.findOne({
        where: { NombreElemento: value },
      });
      if (alquilerExistente) {
        throw new Error("Este Elemento ya está registrado");
      }
      return true;
    })
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};

// Valida el cuerpo del alquiler
export const validateAlquilerBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("NombreElemento")
    .notEmpty()
    .withMessage("El nombre del elemento no puede estar en blanco")
    .isLength({ max: 100 })
    .withMessage("El nombre del alquiler no puede tener más de 100 caracteres")
    .run(req);

  await body("FechaSolicitud")
    .notEmpty()
    .withMessage("La fecha de solicitud no puede estar en blanco")
    .isISO8601()
    .withMessage(
      "La fecha de solicitud debe tener un formato válido (YYYY-MM-DD)"
    )
    .run(req);

  await body("FechaDeDevolucion")
    .optional()
    .isISO8601()
    .withMessage(
      "La fecha de devolución debe tener un formato válido (YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS)"
    )
    .toDate()
    .run(req);

  await body("RegistradoPor")
    .notEmpty()
    .withMessage('El campo "Registrado por" no puede estar en blanco')
    .isLength({ max: 100 })
    .withMessage(
      'El campo "Registrado por" no puede tener más de 100 caracteres'
    )
    .run(req);

  await body("Observaciones")
    .notEmpty()
    .withMessage('El campo "Observaciones" no puede estar en blanco')
    .isLength({ max: 255 })
    .withMessage(
      'El campo "Observaciones" no puede tener más de 255 caracteres'
    )
    .run(req);

  await body("IdUsuario")
    .notEmpty()
    .withMessage('El campo "ID de Usuario" no puede estar en blanco')
    .isInt()
    .withMessage('El campo "ID de Usuario" debe ser un número entero')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};
