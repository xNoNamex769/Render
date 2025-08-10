import type { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { RelUsuarioFeedback } from '../models/RelUsuarioFeedback';

export const validateRelUsuarioFeedbackYaExiste = async (req: Request, res: Response, next: NextFunction) => {
    const { IdUsuario, IdFeedback } = req.body;

    const relExistente = await RelUsuarioFeedback.findOne({
        where: { IdUsuario, IdFeedback }
    });

    if(relExistente) {
        throw new Error ('Esta relación entre Usuario y Feedback ya existe');
    }
    next();
};

export const validateRelUsuarioFeedbackBody = async (req: Request, res: Response, next: NextFunction) => {
    await body('IdUsuario')
        .notEmpty().withMessage('El IdUsuario no puede estar vacío')
        .isInt({ min: 1 }).withMessage('IdUsuario debe ser un número entero positivo')
        .run(req);

    await body('IdFeedback')
        .notEmpty().withMessage('El IdFeedback no puede estar vacío')
        .isInt({ min: 1 }).withMessage('IdFeedback debe ser un número entero positivo')
        .run(req);

    await body('FechaRelUsuaFeed')
        .optional()
        .isISO8601().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)')
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        
    }

    next();
};