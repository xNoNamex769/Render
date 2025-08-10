import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ConsultaIA } from '../models/ConsultaIA'; 

// Valida el ID de la Consulta IA
export const validateIdConsultaIA = async (req: Request, res: Response, next: NextFunction) => {
  await param('IdConsultaIA')
    .isInt({ min: 1 }).withMessage('IdConsultaIA debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};

// Valida si la Consulta IA ya existe por la pregunta
export const validateConsultaIAYaExiste = async (req: Request, res: Response, next: NextFunction) => {
  await body('Pregunta')
    .custom(async (value) => {
      const consultaExistente = await ConsultaIA.findOne({
        where: { Pregunta: value },
      });
      if (consultaExistente) {
        throw new Error('Ya existe una consulta IA con esa pregunta');
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

// Validar el cuerpo de la Consulta IA
export const validateConsultaIABody = async (req: Request, res: Response, next: NextFunction) => {
  await body('Pregunta')
    .notEmpty().withMessage('La pregunta no puede estar vacía')
    .isString().withMessage('La pregunta debe ser un texto')
    .run(req);

  await body('Respuesta')
    .notEmpty().withMessage('La respuesta no puede estar vacía')
    .isString().withMessage('La respuesta debe ser un texto')
    .run(req);

  await body('Fecha')
    .notEmpty().withMessage('La fecha no puede estar vacía')
    .isISO8601().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)')
    .run(req);

  await body('Descripcion')
    .notEmpty().withMessage('La descripción no puede estar vacía')
    .isString().withMessage('La descripción debe ser un texto')
    .isLength({ max: 255 }).withMessage('La descripción no puede tener más de 255 caracteres')
    .run(req);

  await body('IdUsuario')
    .notEmpty().withMessage('El IdUsuario no puede estar vacío')
    .isInt({ min: 1 }).withMessage('El IdUsuario debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};
