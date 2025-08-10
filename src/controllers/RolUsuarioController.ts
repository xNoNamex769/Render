import { Request, Response } from "express";
import { RolUsuario } from "../models/RolUsuario";

export class RolusuarioController{
    static getAll = async (req: Request, res: Response) =>{
        try{
            console.log(`Desde get api/RolUsuarios`)
            const rolusuario = await RolUsuario.findAll({
                order: [
                    ['createdAt', 'ASC'], // Ordenar por la fecha de creación
                ]
            })
            res.json(rolusuario) // Responder a los roles que tiene cada usuario 
        }catch(error){
            //console.error(error); 
            res.status(500).json({error: 'Hubo un error'})
        }
    };

    static getRolUsuarioId = async (req: Request, res: Response) =>{
        try{
            const {id} = req.params
            const rolusuario = await RolUsuario.findByPk(id)
            if(!rolusuario) {
                const error = new Error('RolUsuario no encontrado')
                res.status(404).json({error:error.message})
                return;
            }
            res.json(rolusuario)
        }
        catch (error){
        res.status(500).json({error: 'hubo un error'})
        }
    }

    static CrearRolUsuario= async (req: Request, res:Response)=>{
        try {
            const Rolusuario = new RolUsuario(req.body)
            await Rolusuario.save()
            res.status(201).json('RolUsuario creado exitosamente')
        }
        catch (error){
            //console.error('Error al crear RolUsuario:', error); 
            res.status(500).json({ error: 'hubo error' });  
        }
    };
    

    static ActualizarUsuario= async (req: Request, res:Response)=>{
        try{
            const {id} = req.params
            const rolusuario = await RolUsuario.findByPk(id)
            if(!rolusuario) {
                const error = new Error('RolUsuario no encontrado')
                res.status(404).json({error:error.message})
                return;
            }
            await rolusuario.update(req.body)
            res.json('RolUsuario actualizado exitosamente')
        }catch (error){
            res.status(500).json({error: 'hubo un error'})
        }
    };

    static EliminarRolUsuario= async (req: Request, res:Response)=>{
        try{
            const {id} = req.params
            const rolusuario = await RolUsuario.findByPk(id)
            if(!rolusuario) {
                const error = new Error('RolUsuario no encontrado')
                res.status(404).json({error:error.message})
                return;
            }
            await rolusuario.destroy()
            res.json('RolUsuario eliminado exitosamente')
        }catch (error){
            res.status(500).json({error: 'hubo un error'})
        }
    }
}