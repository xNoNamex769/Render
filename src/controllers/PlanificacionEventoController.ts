// src/controllers/PlanificacionEventoController.ts
import type { Request, Response } from "express";
import { PlanificacionEvento } from "../models/PlanificacionEvento";
import { GestionEvento } from "../models/GestionEvento";
import { Usuario } from "../models/Usuario";
import { RolUsuario } from "../models/RolUsuario";
import { Op } from "sequelize";
import { PerfilInstructor } from "../models/PerfilInstructor";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export class PlanificacionEventoControllers {
  // 📌 Obtener todos los eventos planificados
  static getPlanificarEventoAll = async (req: Request, res: Response) => {
    try {
      const eventos = await PlanificacionEvento.findAll({
        attributes: [
          "IdPlanificarE",
          "NombreEvento",
          "FechaEvento",
          "LugarDeEvento",
          "ImagenEvento",
          "Recursos",
          "TipoEvento",
          "IdUsuario",
          "IdGestionE",
        ],
        include: [
          {
            model: Usuario,
            attributes: ["IdUsuario", "Nombre", "Apellido", "Correo"],
            include: [
              { model: RolUsuario, attributes: ["NombreRol"] },
              {
                association: "perfilInstructor",
                attributes: ["ubicacion", "profesion", "imagen"],
              },
            ],
          },
          {
            model: GestionEvento,
            attributes: ["Aprobar", "IdGestionE"],
          },
        ],
        order: [["FechaEvento", "ASC"]],
      });

      res.json(
        eventos.map((e) => ({
          ...e.dataValues,
          ImagenUrl: e.ImagenEvento || null,
        }))
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Hubo un error al traer las planificaciones" });
    }
  };

  // 📌 Obtener evento por ID
  static getIdPlanificarEvento = async (req: Request, res: Response) => {
    try {
      const { IdPlanificarE } = req.params;
      const evento = await PlanificacionEvento.findByPk(IdPlanificarE);
      if (!evento) {
        res.status(404).json({ error: "Evento no encontrado" });
        return;
      }
      res.json({
        ...evento.dataValues,
        ImagenUrl: evento.ImagenEvento || null,
      });
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // 📌 Actualizar evento
  static actualizarIdPlanificarEvento = async (req: Request, res: Response) => {
    try {
      const { IdPlanificarE } = req.params;
      const evento = await PlanificacionEvento.findByPk(IdPlanificarE);
      if (!evento) {
        res.status(404).json({ error: "Evento no encontrado" });
        return;
      }

      // Subida a Cloudinary si hay nueva imagen
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        req.body.ImagenEvento = uploadResult.secure_url;
      }

      await evento.update(req.body);

      res.json({
        message: "✅ Evento planificado actualizado correctamente",
        evento: {
          ...evento.dataValues,
          ImagenUrl: evento.ImagenEvento || null,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // 📌 Eliminar evento
  static eliminarIdPlanificarEvento = async (req: Request, res: Response) => {
    try {
      const { IdPlanificarE } = req.params;
      const evento = await PlanificacionEvento.findByPk(IdPlanificarE);
      if (!evento) {
        res.status(404).json({ error: "Evento no encontrado" });
        return;
      }
      await evento.destroy();
      res.json("Evento planificado eliminado correctamente");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // 📌 Crear planificación con imagen en Cloudinary
  static crearPlanificacion = async (req: Request, res: Response) => {
    try {
      const { NombreEvento, FechaEvento, LugarDeEvento, TipoEvento, Recursos } =
        req.body;

      const IdUsuario = req.usuario?.IdUsuario;

      if (!NombreEvento || !FechaEvento || !LugarDeEvento || !IdUsuario) {
        res.status(400).json({ error: "⚠️ Faltan campos requeridos" });
        return;
      }

      // Subir imagen a Cloudinary si existe
      let imagenUrl: string | null = null;
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        imagenUrl = uploadResult.secure_url;
      }

      // 1️⃣ Crear gestión pendiente
      const nuevaGestion = await GestionEvento.create({
        Aprobar: "Pendiente",
        IdUsuario,
      });

      // 2️⃣ Crear planificación con la gestión creada
      const nuevaPlanificacion = await PlanificacionEvento.create({
        NombreEvento,
        FechaEvento,
        LugarDeEvento,
        Recursos: Recursos || null,
        TipoEvento,
        IdUsuario,
        IdGestionE: nuevaGestion.IdGestionE,
        ImagenEvento: imagenUrl,
      });

      res.status(201).json({
        message: "✅ Planificación creada exitosamente con gestión",
        planificacion: {
          ...nuevaPlanificacion.dataValues,
          ImagenUrl: nuevaPlanificacion.ImagenEvento || null,
        },
      });
    } catch (error) {
      console.error("❌ Error al crear planificación:", error);
      res.status(500).json({
        error: "Error del servidor",
        message: (error as Error).message,
      });
    }
  };

  // 📌 Obtener solo mis eventos
  static getMisEventos = async (req: Request, res: Response) => {
    try {
      const IdUsuario = req.usuario?.IdUsuario;
      if (!IdUsuario) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      const eventos = await PlanificacionEvento.findAll({
        where: { IdUsuario },
        attributes: [
          "IdPlanificarE",
          "NombreEvento",
          "FechaEvento",
          "LugarDeEvento",
          "ImagenEvento",
          "Recursos",
          "TipoEvento",
          "IdGestionE",
        ],
        include: [
          {
            model: GestionEvento,
            attributes: ["Aprobar", "IdGestionE", "MotivoRechazo"],
            include: [
              {
                model: Usuario,
                as: "gestionador",
                attributes: ["Nombre", "Apellido", "Correo"],
              },
            ],
          },
          { model: Usuario, attributes: ["IdUsuario", "Nombre", "Apellido", "Correo"] },
        ],
        order: [["FechaEvento", "DESC"]],
      });

      res.json(
        eventos.map((e) => ({
          ...e.dataValues,
          ImagenUrl: e.ImagenEvento || null,
        }))
      );
    } catch (error) {
      console.error("❌ Error al obtener mis eventos:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  };

  // 📌 Crear eventos masivos
  static crearEventosMasivos = async (req: Request, res: Response) => {
    try {
      const IdUsuario = req.usuario?.IdUsuario;
      if (!IdUsuario) {
        res.status(401).json({ error: "Usuario no autenticado" });
        return;
      }

      const eventos = req.body;
      if (!Array.isArray(eventos) || eventos.length === 0) {
        res.status(400).json({ error: "Debes enviar una lista de eventos" });
        return;
      }

      const eventosCreados = [];

      for (const evento of eventos) {
        const {
          NombreEvento,
          FechaEvento,
          LugarDeEvento,
          Recursos,
          TipoEvento,
          ImagenEvento,
          Trimestre,
        } = evento;

        if (!NombreEvento || !FechaEvento || !LugarDeEvento || !TipoEvento) {
          res.status(400).json({ error: "Faltan campos requeridos en uno de los eventos" });
          return;
        }

        // 1️⃣ Crear gestión pendiente
        const nuevaGestion = await GestionEvento.create({
          Aprobar: "Pendiente",
          IdUsuario,
        });

        // 2️⃣ Guardar evento con imagen (se asume ya viene url, no archivo)
        const planificacion = await PlanificacionEvento.create({
          NombreEvento,
          FechaEvento,
          LugarDeEvento,
          Recursos: Recursos || null,
          TipoEvento,
          ImagenEvento: ImagenEvento || null,
          Trimestre: Trimestre || null,
          EstadoCarga: "Masivo",
          IdUsuario,
          IdGestionE: nuevaGestion.IdGestionE,
        });

        eventosCreados.push({
          ...planificacion.dataValues,
          ImagenUrl: planificacion.ImagenEvento || null,
        });
      }

      res.status(201).json({
        message: "✅ Eventos masivos creados correctamente",
        cantidad: eventosCreados.length,
        eventos: eventosCreados,
      });
    } catch (error) {
      console.error("❌ Error al crear eventos masivos:", error);
      res.status(500).json({
        error: "Error al crear eventos masivos",
        message: (error as Error).message,
      });
    }
  };

  // 📌 Obtener eventos por trimestre
  static obtenerEventosPorTrimestre = async (req: Request, res: Response) => {
    const { anio, trimestre } = req.params;
    const trimestreNum = parseInt(trimestre);
    const anioNum = parseInt(anio);

    if (![1, 2, 3, 4].includes(trimestreNum)) {
      res.status(400).json({
        mensaje: "Trimestre inválido. Usa un número del 1 al 4.",
      });
      return;
    }

    const rangos: Record<number, [string, string]> = {
      1: [`${anioNum}-01-01`, `${anioNum}-03-31`],
      2: [`${anioNum}-04-01`, `${anioNum}-06-30`],
      3: [`${anioNum}-07-01`, `${anioNum}-09-30`],
      4: [`${anioNum}-10-01`, `${anioNum}-12-31`],
    };

    const [fechaInicio, fechaFin] = rangos[trimestreNum];

    try {
      const eventos = await PlanificacionEvento.findAll({
        where: { FechaEvento: { [Op.between]: [fechaInicio, fechaFin] } },
      });

      res.status(200).json(
        eventos.map((e) => ({
          ...e.dataValues,
          ImagenUrl: e.ImagenEvento || null,
        }))
      );
    } catch (error) {
      console.error("Error al obtener eventos por trimestre:", error);
      res.status(500).json({ mensaje: "Error interno al buscar eventos" });
    }
  };
}
