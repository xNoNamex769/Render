import type { Request, Response } from "express";
import { Evento } from "../models/Evento";
import { RelUsuarioEvento } from "../models/RelUsuarioEvento";
import { Usuario } from "../models/Usuario";
import { PlanificacionEvento } from "../models/PlanificacionEvento";
import { PerfilInstructor } from "../models/PerfilInstructor";

export class EventoControllers {

  // Obtener todos los eventos (admin / listado general)
  static getEventoAll = async (req: Request, res: Response) => {
    try {
      const eventos = await Evento.findAll({ 
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: PlanificacionEvento,
            as: "PlanificacionEvento",
            attributes: ['IdPlanificarE', 'ImagenEvento'], // ✅ solo columnas reales
          }
        ]
      });
      // Mapear ImagenUrl
      const resultado = eventos.map((e: any) => ({
        ...e.dataValues,
        PlanificacionEvento: e.PlanificacionEvento
          ? {
              ...e.PlanificacionEvento.dataValues,
              ImagenUrl: e.PlanificacionEvento.ImagenEvento || null,
            }
          : null,
      }));
      res.json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Hubo un error al obtener los eventos' });
    }
  };

  // Obtener evento por Id con planificación y perfil del instructor
  static getIdEvento = async (req: Request, res: Response) => {
    try {
      const { IdEvento } = req.params;

      const evento = await Evento.findByPk(IdEvento, {
        include: [
          {
            model: PlanificacionEvento,
            as: 'PlanificacionEvento',
            attributes: ['IdPlanificarE', 'ImagenEvento'], // ✅ solo columnas reales
            include: [
              {
                model: Usuario,
                attributes: ['Nombre', 'Apellido'],
                include: [
                  {
                    model: PerfilInstructor,
                    as: 'perfilInstructor',
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

      const resultado = {
        ...evento.dataValues,
        PlanificacionEvento: evento.planificacion
          ? {
              ...evento.planificacion.dataValues,
              ImagenUrl: evento.planificacion.ImagenEvento || null,
            }
          : null,
      };

      res.json(resultado);

    } catch (error) {
      console.error("❌ Error al buscar evento:", error);
      res.status(500).json({ error: 'Hubo un error al buscar el evento' });
    }
  };

  // Crear evento
  static crearEvento = async (req: Request, res: Response) => {
    try {
      const evento = new Evento(req.body);
      await evento.save();
      res.status(201).json('Evento creado exitosamente');
    } catch (error) {
      console.error('Error al crear evento:', error);
      res.status(500).json({ error: 'Hubo un error al crear el evento' });
    }
  };

  // Actualizar evento por Id
  static actualizarIdEvento = async (req: Request, res: Response) => {
    try {
      const { IdEvento } = req.params;
      const evento = await Evento.findByPk(IdEvento);
      if (!evento) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }
      await evento.update(req.body);
      res.json({ mensaje: 'Evento actualizado correctamente' });
    } catch (error) {
      console.error('❌ Error al actualizar evento:', error);
      res.status(500).json({ error: 'Hubo un error al actualizar el evento' });
    }
  };

  // Eliminar evento por Id
  static eliminarIdEvento = async (req: Request, res: Response) => {
    try {
      const { IdEvento } = req.params;
      const evento = await Evento.findByPk(IdEvento);
      if (!evento) {
        res.status(404).json({ error: 'Evento no encontrado' });
        return;
      }
      await evento.destroy();
      res.json({ mensaje: 'Evento eliminado correctamente' });
    } catch (error) {
      console.error('❌ Error al eliminar evento:', error);
      res.status(500).json({ error: 'Hubo un error al eliminar el evento' });
    }
  };

  // Obtener eventos públicos
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
            as: 'PlanificacionEvento',
            attributes: ['IdPlanificarE','ImagenEvento'], // ✅ solo columnas reales
            include: [
              {
                model: Usuario,
                attributes: ['Nombre', 'Apellido'],
                include: [
                  {
                    model: PerfilInstructor,
                    attributes: ['imagen'],
                  }
                ]
              }
            ]
          }
        ]
      });

      const resultado = eventos.map((e: any) => ({
        ...e.dataValues,
        PlanificacionEvento: e.PlanificacionEvento
          ? {
              ...e.PlanificacionEvento.dataValues,
              ImagenUrl: e.PlanificacionEvento.ImagenEvento || null,
            }
          : null,
      }));

      res.json(resultado);
    } catch (error) {
      console.error("❌ Error al obtener eventos públicos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // Obtener eventos de un usuario específico
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

  // Obtener mis eventos (autenticado)
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

}
