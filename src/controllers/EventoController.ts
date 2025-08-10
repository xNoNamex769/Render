import type { Request, Response } from "express";
import { Evento } from "../models/Evento";
import { RelUsuarioEvento } from "../models/RelUsuarioEvento";
import { Usuario } from "../models/Usuario";
import { PlanificacionEvento } from "../models/PlanificacionEvento";
import { PerfilInstructor } from "../models/PerfilInstructor";
// quien creo el evento: un usuario , y a los eventos asistidos de ese usuario
export class EventoControllers {
    static getEventoAll = async (req: Request, res: Response) => {
        try {
            console.log('Desde GET/api/evento');

            const eventos = await Evento.findAll({ 
                order: [
                    ['createdAt', 'ASC'],
                ], 
            });
            res.json(eventos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al obtener los eventos' });
        }
    };
static getIdEvento = async (req: Request, res: Response) => {
  try {
    const { IdEvento } = req.params;

    const evento = await Evento.findByPk(IdEvento, {
      include: [
        {
          model: PlanificacionEvento,
          as: 'PlanificacionEvento',
          attributes: ['IdPlanificarE', 'ImagenEvento'],
          include: [
            {
              model: Usuario,
              attributes: ['Nombre', 'Apellido'],
              include: [
                {
                  model: PerfilInstructor,
                  as: 'perfilInstructor', // ¡ESTO es lo que te falta!
                  attributes: ['imagen'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!evento) {
       res.status(404).json({ error: 'Evento no encontrado' });
       return;
    }

    res.json(evento);
  } catch (error) {
    console.error("❌ Error al buscar evento:", error);
    res.status(500).json({ error: 'Hubo un error al buscar el evento' });
  }
};

    
    static crearEvento = async (req: Request, res: Response) => {
        try {
            const evento = new Evento(req.body)
            await evento.save()
            res.status(201).json('Evento creado Exitosamente');
        } catch (error) {
            console.error('Error al crear evento:', error);
            res.status(500).json({ error: 'Hubo un error al crear el evento' });
        }
    };

    static actualizarIdEvento = async (req: Request, res: Response) => {
        try {
            const { IdEvento } = req.params;
            const evento = await Evento.findByPk(IdEvento);
            if (!evento) {
                const error =new Error('Evento no encontrado')
                res.status(404).json({ error:error.message });
                return;
            }
            await evento.update(req.body);
            res.json({ mensaje: 'Evento actualizado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al actualizar el evento' });
        }
    };

    static eliminarIdEvento = async (req: Request, res: Response) => {
        try {
            const { IdEvento } = req.params;
            const evento = await Evento.findByPk(IdEvento);
            if (!evento) {
                const error =new Error('Evento no encontrado')
                res.status(404).json({ error: 'Evento no encontrado' });
                return;
            }
            await evento.destroy();
            res.json({ mensaje: 'Evento eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al eliminar el evento' });
        }
    };



  static async obtenerEventosPorUsuario(req: Request, res: Response) {
    try {
      const idUsuario = parseInt(req.params.id);

      if (isNaN(idUsuario)) {
      res.status(400).json({ error: "ID de usuario inválido" });
      return;
      }

      const eventos = await Evento.findAll({
        include: [
          {
            model: RelUsuarioEvento,
            where: { IdUsuario: idUsuario },
            required: true,
            include: [
              {
                model: Usuario,
                attributes: ["Nombre", "Apellido", "Correo"],
              },
            ],
          },
        ],
      });

      if (eventos.length === 0) {
        res.status(404).json({ error: "No se encontraron eventos para el usuario" });
        return;
      }

      res.json(eventos);
    } catch (error) {
      console.error("❌ Error al obtener eventos del usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
static async obtenerMisEventos(req: Request, res: Response) {
  try {
    const IdUsuario = req.usuario?.IdUsuario;

    if (!IdUsuario) {
     res.status(401).json({ error: 'Usuario no autenticado' });
     return;
    }

    const eventos = await Evento.findAll({
      where: { IdUsuario },
      include: [
        {
          model: RelUsuarioEvento,
          include: [{ model: Usuario }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(eventos);
  } catch (error) {
    console.error('❌ Error obteniendo mis eventos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
  static async obtenerEventosPublicos(req: Request, res: Response) {
    try {
      const eventos = await Evento.findAll({
        order: [['FechaInicio', 'DESC']],
        attributes: [
          'IdEvento',
          'NombreEvento',
          'FechaInicio',
          'FechaFin',
          'HoraInicio',
          'HoraFin',
          'UbicacionEvento',
          'DescripcionEvento',
          'createdAt'
        ],
        
        include: [
          {
            model: PlanificacionEvento,
            as:'PlanificacionEvento',
            attributes: ['IdPlanificarE','ImagenEvento'], // puedes agregar más si necesitas
            include: [
              {
                model: Usuario,
                attributes: ['Nombre', 'Apellido'],
                include:[
                  {
              model: PerfilInstructor,
               attributes: ['imagen'],
              }]
              }
            ]
          }
        ]
      });

      res.json(eventos);
    } catch (error) {
      console.error("❌ Error al obtener eventos públicos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
