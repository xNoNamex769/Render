// middleware/ValidarTipoQR.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateTipoQR = async (req: Request, res: Response, next: NextFunction) => {
  await body("tipo")
    .exists().withMessage("El campo 'tipo' es obligatorio")
    .isIn(["entrada", "salida"]).withMessage("El tipo debe ser 'entrada' o 'salida'")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
   res.status(400).json({ errors: errors.array() });
   return;
  }

  next();
};
