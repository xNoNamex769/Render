import { Request, Response } from "express";
import { HistorialSolicitud } from "../models/HistorialSolicitud";
import { Usuario } from "../models/Usuario";
import { RolUsuario } from "../models/RolUsuario";

export class HistorialSolicitudController {

  // GET /api/historial/solicitud/:idSolicitud
  static obtenerHistorialPorSolicitud = async (req: Request, res: Response) => {
    try {
      const { idSolicitud } = req.params;

      const historial = await HistorialSolicitud.findAll({
        where: { IdSolicitud: idSolicitud },
        include: [{
          model: Usuario,
          attributes: ['Nombre', 'Correo' ,'Telefono'], 
          include: [{
            model: RolUsuario, // esto conecta correctamente
            attributes: ['NombreRol',], //  aquí está el campo Rol ahora
            as:'rol'
          }]
        }],
        order: [['createdAt', 'ASC']]
      });

      res.json(historial);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({ error: 'Hubo un error al obtener el historial de la solicitud.' });
    }
  };

  // POST /api/historial
  static crearHistorial = async (req: Request, res: Response) => {
    try {
      const nuevoHistorial = await HistorialSolicitud.create(req.body);
      res.status(201).json(nuevoHistorial);
    } catch (error) {
      console.error('Error al crear historial:', error);
      res.status(500).json({ error: 'Error al crear historial.' });
    }
  };
}