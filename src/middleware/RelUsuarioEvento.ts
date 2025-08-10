import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { RelUsuarioEvento } from "../models/RelUsuarioEvento";


export const validateIdRelUsuarioEvento = async (req: Request, res: Response, next: NextFunction) => {
  await param('IdUsuario')
    .isInt({ min: 1 }).withMessage('ID no válido')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};

export const validateRelUsuarioEventoYaExiste = async (req: Request, res: Response, next: NextFunction) => {
  await body('IdUsuario')
    .isInt({ min: 1 }).withMessage('IdUsuario debe ser un número entero positivo')
    .run(req);

  await body('IdEvento')
    .isInt({ min: 1 }).withMessage('IdEvento debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return;
  }

  const { IdUsuario, IdEvento } = req.body;

  const yaExiste = await RelUsuarioEvento.findOne({
    where: { IdUsuario, IdEvento },
  });

  if (yaExiste) {
     res.status(400).json({ errors: [{ msg: 'La relación ya existe' }] });
     return;
  }

  next();
};


export const validateRelUsuarioEventoBody = async (req: Request, res: Response, next: NextFunction) => {
  await body('IdUsuario')
    .notEmpty().withMessage('El campo IdUsuario es obligatorio')
    .isInt({ min: 1 }).withMessage('IdUsuario debe ser un número entero positivo')
    .run(req);

  await body('IdEvento')
    .notEmpty().withMessage('El campo IdEvento es obligatorio')
    .isInt({ min: 1 }).withMessage('IdEvento debe ser un número entero positivo')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return;
  }

  next();
};
