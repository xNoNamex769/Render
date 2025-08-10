import { Request, Response, NextFunction } from "express";
import { param, validationResult, body } from 'express-validator';
import { Asistencia } from "../models/Asistencia"; 
// Valida el ID de la asistencia
export const validateIdAsistencia = async (req: Request, res: Response, next: NextFunction) => {
  await param('AsiId')
    .isInt().withMessage('ID no válido')
    .custom(value => value > 0).withMessage('ID no válido')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; 
  }

  next(); 
};

// Valida si el QR de entrada de la asistencia ya existe
export const validateIdAsistenciaYaExiste = async (req: Request, res: Response, next: NextFunction) => {
  await body('QREntrada')
  .optional()
    .custom(async (value) => {
      const asistenciaExistente = await Asistencia.findOne({
        where: { QREntrada: value },
      });
      if (asistenciaExistente) {
        throw new Error('Este QR de entrada ya está registrado');
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

// Valida el cuerpo de la asistencia
export const validateAsistenciaBody = async (req: Request, res: Response, next: NextFunction) => {
  await body('AsiFecha')
    .notEmpty().withMessage('La fecha de la asistencia no puede estar en blanco')
    .isISO8601().withMessage('La fecha debe tener un formato válido (YYYY-MM-DDTHH:MM:SS)')
    .run(req);

  await body('AsiHorasAsistidas')
    .optional()
    .isInt({ min: 0 }).withMessage('Las horas asistidas deben ser un número entero mayor o igual a 0')
    .run(req);

  await body('QREntrada')
    .notEmpty().withMessage('El campo QR de entrada no puede estar vacío')
    .isLength({ max: 100 }).withMessage('El QR de entrada no puede tener más de 100 caracteres')
    .run(req);

  await body('QRSalida')
    .notEmpty().withMessage('El campo QR de salida no puede estar vacío')
    .isLength({ max: 100 }).withMessage('El QR de salida no puede tener más de 100 caracteres')
    .run(req);

  await body('IdUsuario')
    .notEmpty().withMessage('no se puede registrar una asistencia si no esta asosciada a un idUsuario')
    .isInt().withMessage('El campo "ID de Usuario" debe ser un número entero')
    .run(req);

  await body('IdActividad')
    .notEmpty().withMessage('no se puede agregar la asistencia si no esta referenciada a dicha actividad')
    .isInt().withMessage('El campo "ID de Actividad" debe ser un número entero')
    .run(req);
await body('tipo')
  .optional()
  .isIn(['entrada', 'salida'])
  .withMessage('El tipo debe ser "entrada" o "salida"')
  .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; 
  }

  next(); 
};
