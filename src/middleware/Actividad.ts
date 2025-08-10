import { Request, Response, NextFunction } from "express";
import { param, validationResult, body } from 'express-validator';
import { Actividad } from "../models/Actividad";

// Valida el ID de la actividad
export const validateIdActividad = async (req: Request, res: Response, next: NextFunction) => {
  await param('IdActividad')
    .isInt().withMessage('Id no válido')
    .custom(value => value > 0).withMessage('Id no válido')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};


export const validateIdActividadYaExiste = async (req: Request, res: Response, next: NextFunction) => {
  await body('NombreActi')
    .custom(async (value) => {
      const actividadExistente = await Actividad.findOne({
        where: { NombreActi: value },
      });
      if (actividadExistente) {
        throw new Error('Esta actividad Ya está registrada');
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

// Valida el cuerpo de la actividad
export const validateActividadBody = async (req: Request, res: Response, next: NextFunction) => {
  await body('NombreActi')
    .notEmpty().withMessage('El nombre de la actividad no puede estar en blanco')
    .isLength({ max: 100 }).withMessage('El nombre de la actividad no puede tener más de 100 caracteres')
    .run(req);

  await body('FechaInicio')
    .notEmpty().withMessage('La fecha de inicio no puede estar en blanco')
    .isISO8601().withMessage('La fecha de inicio debe tener un formato válido (YYYY-MM-DD)')
    .run(req);

  await body('FechaFin')
    .notEmpty().withMessage('La fecha de fin no puede estar en blanco')
    .isISO8601().withMessage('La fecha de fin debe tener un formato válido (YYYY-MM-DD)')
    .run(req);

  await body('HoraFin')
    .notEmpty().withMessage('La hora de fin no puede estar en blanco')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('La hora de fin debe tener un formato válido (HH:MM:SS)')
    .run(req);

  await body('HoraInicio')
    .notEmpty().withMessage('La hora de inicio no puede estar en blanco')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('La hora de inicio debe tener un formato válido (HH:MM:SS)')
    .run(req);

  await body('TipoLudica')
    .notEmpty().withMessage('El tipo de lúdica no puede estar en blanco')
    .isString().withMessage('El tipo de lúdica debe ser un texto')
    .isLength({ max: 50 }).withMessage('El tipo de lúdica no puede tener más de 50 caracteres')
    .run(req);

  await body('IdEvento')
    .notEmpty().withMessage('El ID del evento no puede estar en blanco')
    .isInt({ min: 1 }).withMessage('El ID del evento debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};
