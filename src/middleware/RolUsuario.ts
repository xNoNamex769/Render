import type{ Request, Response, NextFunction } from 'express';
import { param, validationResult, body } from 'express-validator';
import { RolUsuario } from '../models/RolUsuario';

export const validateIdRolusuario =  async (req: Request, res: Response, next: NextFunction) => {
    await param('id').isInt().withMessage('Id no valido')
    .custom(value => value > 0)
    .withMessage('Id no Valido')
    .run(req)

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array()})
        return 
    }
    next()
}

export const validateIdRolUsuarioYaExiste = async (req: Request, res: Response, next: NextFunction) => {
    await body('NombreRol').custom(async (value)=>{
        const rolUsuarioExistente = await RolUsuario.findOne({
            where: { NombreRol: value}
        });
        if(rolUsuarioExistente){
            throw new Error('Este rol ya se encuentra registrado')
        }    
        return true;
    })
    .run(req);
    next()
};

export const validateRolUsuarioBody = async (req: Request, res: Response, next: NextFunction) => {
    await body('NombreRol').notEmpty().withMessage('El nombre del rol no puede estar en blanco')
    .isIn(['Administrador', 'Aprendiz', 'Instructor']).withMessage('El tipo de Rol debe ser Administrador, Aprendiz, Instructor')
    .run(req);

    await body('IdUsuario').notEmpty()
    .withMessage('El Id del Usuario no puede estar en blanco')
    .isInt({min: 1}).withMessage('El campo Id Usuario debe ser un número entero')
    .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        res.status(400).json({ errors: errors.array() })
    }
    next()
}