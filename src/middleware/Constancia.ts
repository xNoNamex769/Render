import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { Constancia } from "../models/Constancia"; // Asegúrate de importar el modelo Constancia

// Validación para el cuerpo de la constancia (crear o actualizar)
export const validateConstanciaBody = (req: Request, res: Response, next: NextFunction) => {
  // Validar la cantidad de horas certificadas
  body('ConstanciaHorasCert')
    .isInt({ min: 1 }).withMessage('Las horas certificadas deben ser un número entero mayor a 0')
    .run(req);

  // Validar el estado de la constancia
  body('ConstanciaEstado')
    .notEmpty().withMessage('El estado de la constancia no puede estar vacío')
    .isIn(['Aprobado', 'Rechazado', 'Pendiente']).withMessage('El estado debe ser uno de los siguientes: Aprobado, Rechazado, Pendiente')
    .run(req);

  // Validar la fecha de la constancia
  body('ConstanciaFecha')
    .notEmpty().withMessage('La fecha de la constancia no puede estar vacía')
    .isISO8601().withMessage('La fecha debe tener un formato válido (YYYY-MM-DDTHH:MM:SS)')
    .run(req);

  // Validar el ID de usuario (debe ser un número entero)
  body('IdUsuario')
    .notEmpty().withMessage('El campo "ID de Usuario" no puede estar vacío')
    .isInt().withMessage('El campo "ID de Usuario" debe ser un número entero')
    .run(req);

  // Validación de errores
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next(); // Si no hay errores, continuamos
};

// Validación para verificar si la constancia ya existe
export const validateIdConstanciaYaExiste = (req: Request, res: Response, next: NextFunction) => {
  // Verificar si la constancia ya existe en la base de datos
  body('ConstanciaId')
    .custom(async (value) => {
      if (value) {
        const constanciaExistente = await Constancia.findOne({
          where: { ConstanciaId: value },
        });
        if (constanciaExistente) {
          throw new Error('La constancia ya existe con este ID');
        }
      }
      return true;
    })
    .run(req);

  // Validación de errores
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next(); // Si no hay errores, continuamos
};

// Validación para el ID de la constancia (por ejemplo, en la URL)
export const validateIdConstancia = (req: Request, res: Response, next: NextFunction) => {
  // Validar que el ID de constancia en la URL sea un número entero
  param('ConstanciaId')
    .isInt().withMessage('ID no válido')
    .custom((value) => value > 0).withMessage('El ID debe ser mayor a 0')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next(); // Si no hay errores, continuamos
};
