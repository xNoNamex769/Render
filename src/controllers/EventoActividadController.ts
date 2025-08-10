import { Request, Response } from "express";
import { EventoActividad } from "../models/EventoActividad";
import { PlanificacionEvento } from "../models/PlanificacionEvento";
import { Actividad } from "../models/Actividad";

export class EventoActividadController {
  static asociarActividades = async (req: Request, res: Response) => {
    try {
      const { IdPlanificarE, actividades } = req.body;

      if (!IdPlanificarE || !Array.isArray(actividades) || actividades.length === 0) {
        const error = new Error("Faltan datos: debe enviar IdPlanificarE y un array de actividades");
        res.status(400).json({ error: error.message });
        return;
      }

      const evento = await PlanificacionEvento.findByPk(IdPlanificarE);
      if (!evento) {
        const error = new Error("Evento no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      // Validar si las actividades existen
      for (const id of actividades) {
        const existe = await Actividad.findByPk(id);
        if (!existe) {
          const error = new Error(`Actividad con ID ${id} no existe`);
          res.status(404).json({ error: error.message });
          return;
        }
      }

      // Asociar actividades al evento
      const asociaciones = await Promise.all(
        actividades.map(id =>
          EventoActividad.create({ IdPlanificarE, IdActividad: id })
        )
      );

      res.status(201).json({
        message: "✅ Actividades asociadas exitosamente",
        asociaciones
      });
      return;

    } catch (error) {
      console.error("❌ Error al asociar actividades:", error);
      res.status(500).json({
        error: "Error del servidor",
        message: (error as Error).message
      });
      return;
    }
  };
}
