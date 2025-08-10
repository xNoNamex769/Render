import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

export const validateGestionId = async (req: Request, res: Response, next: NextFunction) => {
    await param("id")
        .isInt().withMessage("El ID debe ser un número entero.")
        .custom(value => value > 0).withMessage("El ID debe ser mayor a 0.")
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return 
    }
    next();
};

export const validateGestionEventoBody = async (req: Request, res: Response, next: NextFunction) => {
    await body("Aprobar")
        .isIn(["Aprobado", "Pendiente"])
        .withMessage("El campo Aprobar debe ser 'Aprobado' o 'Pendiente'.")
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return
    }
    next();
};