import { Request, Response, NextFunction } from "express";
import { param, validationResult, body } from 'express-validator';
import { PlanificacionEvento } from "../models/PlanificacionEvento";


export const validateIdPlanificarEvento = async (req: Request, res: Response, next: NextFunction) => {
  await param('IdPlanificarE')
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


export const validateIdPlanificarEventoYaExiste = async (req: Request, res: Response, next: NextFunction) => {
  await body('NombreEvento')
    .custom(async (value) => {
      const eventoExistente = await PlanificacionEvento.findOne({
        where: { NombreEvento: value },
      });
      if (eventoExistente) {
        throw new Error('Este evento ya está registrado');
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


export const validatePlanificarEventoBody = async (req: Request, res: Response, next: NextFunction) => {
  await body('NombreEvento')
    .notEmpty().withMessage('El nombre del evento no puede estar en blanco')
    .isLength({ max: 100 }).withMessage('El nombre del evento no puede tener más de 100 caracteres')
    .run(req);

  await body('FechaEvento')
    .notEmpty().withMessage('La fecha del evento no puede estar en blanco')
    .isISO8601().withMessage('La fecha del evento debe tener un formato válido (YYYY-MM-DD)')
    .run(req);

  await body('LugarDeEvento')
    .notEmpty().withMessage('El lugar del evento no puede estar en blanco')
    .isLength({ max: 255 }).withMessage('El lugar del evento no puede tener más de 255 caracteres')
    .run(req);

  await body('Recursos')
    .notEmpty().withMessage('Los recursos no pueden estar en blanco')
    .isLength({ max: 255 }).withMessage('Los recursos no pueden tener más de 255 caracteres')
    .run(req);

  await body('IdGestionE')
    .notEmpty().withMessage('El ID de gestión del evento no puede estar en blanco')
    .isInt({ min: 1 }).withMessage('El ID de gestión del evento debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};
