import { Request, Response, NextFunction } from "express";
import { param, body, validationResult } from 'express-validator';
import { Evento } from "../models/Evento";

// ✅ Valida que el IdEvento sea un número entero positivo
export const validateIdEvento = async (req: Request, res: Response, next: NextFunction) => {
  await param('IdEvento')
    .isInt({ min: 1 }).withMessage('IdEvento debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return
  }

  next();
};

// ✅ Verifica si ya existe un evento con el mismo nombre
export const validateNombreEventoUnico = async (req: Request, res: Response, next: NextFunction) => {
  await body('NombreEvento')
    .notEmpty().withMessage('El nombre del evento no puede estar vacío')
    .custom(async (value) => {
      const eventoExistente = await Evento.findOne({ where: { NombreEvento: value } });
      if (eventoExistente) {
        throw new Error('Este evento ya está registrado');
      }
      return true;
    })
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return
  }

  next();
};


export const validateEventoBody = async (req: Request, res: Response, next: NextFunction) => {
  await body('NombreEvento')
    .notEmpty().withMessage('El nombre del evento es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre del evento no debe superar los 100 caracteres')
    .run(req);

  await body('FechaInicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria')
    .isISO8601().withMessage('Formato inválido para FechaInicio (YYYY-MM-DD)')
    .run(req);

  await body('FechaFin')
    .notEmpty().withMessage('La fecha de fin es obligatoria')
    .isISO8601().withMessage('Formato inválido para FechaFin (YYYY-MM-DD)')
    .run(req);

  await body('HoraInicio')
    .notEmpty().withMessage('La hora de inicio es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Formato inválido para HoraInicio (HH:MM:SS)')
    .run(req);

  await body('HoraFin')
    .notEmpty().withMessage('La hora de fin es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Formato inválido para HoraFin (HH:MM:SS)')
    .run(req);

  await body('UbicacionEvento')
    .notEmpty().withMessage('La ubicación del evento es obligatoria')
    .isLength({ max: 200 }).withMessage('La ubicación no debe superar los 200 caracteres')
    .run(req);

  await body('IdPlanificarE')
    .notEmpty().withMessage('El ID de planificación es obligatorio')
    .isInt({ min: 1 }).withMessage('IdPlanificarE debe ser un número entero positivo')
    .run(req);

  await body('DescripcionEvento')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no debe superar los 500 caracteres')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return
  }

  next();
};
