import  type { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { Usuario } from "../models/Usuario";


export const validateUsuarioId = async (req: Request, res: Response, next : NextFunction) => {
    await param("id").isInt().withMessage("El ID deben ser numeros.")
    .custom(value => value > 0).withMessage("El ID no puede ser menor a 0.")
    .run(req)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(500).json({error: errors.array()})
        return
    }
    next()
}

// Para campos Unique 
export const validateUsuarioNoExiste = async (req: Request, res: Response, next : NextFunction) =>{ 
    await body("IdentificacionUsuario").custom(async (valor) => {
        const usuarioExiste = await Usuario.findOne({
            where : {IdentificacionUsuario: valor}
        })
        if (usuarioExiste) {
            throw new Error("El numero de identificacion ya esta registrado.")
        }
        return true
    })
    .run(req)

    next()
}

export const validateUsuarioBody = async (req : Request, res: Response, next : NextFunction) => {
    await body("IdentificacionUsuario")
    .notEmpty().withMessage("Identificacion no puedes estar vacio.")
    .isLength({ max : 50}).withMessage("El tamano maximo es de 50 caracteres.")
    .run(req)

    await body("Nombre").notEmpty().withMessage("El nombre no puede estar vacio.")
    .isLength({max : 100}).withMessage("El tamano maximo es de 100 caracteres.")
    .run(req)

    await body("Apellido").notEmpty().withMessage("El apellido no puede estar vacio.")
    .isLength({max : 100}).withMessage("El tamano maximo es de 100 caracteres.")
    .run(req)

    await body("Correo").notEmpty().withMessage("El correo no puede estar vacio.")
    .isLength({max : 255}).withMessage("Demasiados caracteres en Correo.")
    .custom( async (valor) => {
        const correoExiste = await Usuario.findOne({
            where : {Correo : valor}
        })
        if (correoExiste) {
            throw new Error ("El correo electronico ya esta registrado")
        }
        return true
    })
    .run(req)

    //Telefono en el Front debe pasarse como string para evitar errores con el API
    await body("Telefono").isLength({max: 20}).withMessage("Demasiados caracteres en Telefono")
    .run(req)

    await body("Contrasena").notEmpty().withMessage("La contrasena no puede estar vacia.")
    .isLength({max : 255}).withMessage("Contrasena demasiado larga.")
    .run(req)
    

    //Fecha registro: Pendiente para saber si se borra de la base de datos.
    const errors = validationResult(req)
    if (!errors.isEmpty) {
        res.status(500).json({error: errors.array()})
        return
    }
        next()
    }