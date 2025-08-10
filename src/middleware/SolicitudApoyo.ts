import { NextFunction, Request, Response } from "express";
import { param, body, validationResult} from "express-validator";
import { SolicitudApoyo } from "../models/SolicitudApoyo";


export const validateIdSolicitudApoyo = async (req: Request, res: Response, next: NextFunction) =>{
    await param('IdSolicitud')
    .custom(value => value > 0).withMessage('El ID no puede ser menor a 0')
    .isInt({ min: 1 }).withMessage('El ID de la solicitud de apoyo debe ser un número entero positivo')
    .run(req);

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()});
        return;
    }

    next();
};

export const validateDescripcionSolicitudApoyoYaExiste = async (req: Request, res:Response, next: NextFunction) =>{
    await body('Descripcion')
    .custom(async (value) =>{
        const solicitudExistente = await SolicitudApoyo.findOne({
            where: { Descripcion: value }
        });
        if(solicitudExistente){
            throw new Error('Esta solicitud de apoyo ya está registrada');
        }
        return true;
    })
    .run(req);

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()});
        return;
    }

    next()
};

export const validateSolicitudApoyoBody = async (req: Request, res: Response, next: NextFunction) => {
    await body('TipoAyuda')
    .notEmpty().withMessage('El tipo de ayuda no puede estar vacío')
    .isIn(['Psicologica', 'Emocional', 'Economica', 'Otra']).withMessage('El tipo de ayuda debe ser uno de los siguientes: Psicologica, Emocional, Economica, Otra')
    .run(req);

    await body('Descripcion')
    .notEmpty().withMessage('La descripcion de la solicitud de apoyo no puede estar vacia')
    .isLength({ max: 500 }).withMessage('La descripcion de la solicitud de apoyo no puede tener mas de 500 caracteres')
    .run(req);

    await body('ContactoEmergencia')
    .notEmpty().withMessage('El contacto de emergencia no puede estar vacío')
    .isLength({ max: 100 }).withMessage('El contacto de emergencia no puede tener más de 100 caracteres')
    .run(req);

    await body('Estado')
    .notEmpty().withMessage('El estado de la solicitud no puede estar vacia')
    .isIn(['Pendiente', 'En proceso', 'Atendido', 'Finalizado']).withMessage('El estado de la solicitud debe ser uno de los siguientes: Pendiente, En proceso, Atendido, Finalizado')
    .run(req);

    await body('IdUsuario')
    .notEmpty().withMessage('El campo de "ID" No debe estar vacio')
    .isInt().withMessage('El campo de "ID" debe ser un numero entero')
    .run(req);

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()})
        return;
    }

    next();
} 
