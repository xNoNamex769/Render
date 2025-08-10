import type { Request, Response } from "express";
import { GestionEvento } from "../models/GestionEvento";
import { PlanificacionEvento } from "../models/PlanificacionEvento";
import { Evento } from "../models/Evento";
import { Usuario } from "../models/Usuario";
import * as QRCode from "qrcode";

//esto esta bien 
export class GestionEventoController {
    static getAll = async (req : Request, res : Response) => {
        try {   
            const GestionesEventos = await GestionEvento.findAll({
                order : [
                    ["createdAt" ,  "ASC"]
                ]
            })
            res.json(GestionesEventos)

        } catch (error) {
            res.status(500).json({error : "Hubo un error "})
        }
    }

    static getGestionEventoId = async (req : Request, res : Response) => {
        try {
            const {id} = req.params
            const Gestion = await GestionEvento.findByPk(id)
            if (!Gestion) {
                res.status(404).json({error: "Gestion de Evento no encontrada."})
            }
            res.json(Gestion)
        } catch (error) {
            res.status(500).json({error : "Hubo un error."})
        }
    }

    static crearGestioEvento = async (req : Request, res : Response) => {
        try {
            const gestionEvento = new GestionEvento(req.body)
            await gestionEvento.save()
            res.status(201).json("Gestion de Evento creada correctamente")
        }
        catch (error) {
            res.status(500).json("Error al crear nueva gestion de evento")
        }
    }

    static actualizarGestionEventoId = async (req : Request, res : Response) => {
        try {
            const {id} = req.params
            const GestionActualizar = await GestionEvento.findByPk(id)
            if (!GestionActualizar) {
                res.status(404).json({error : "Gestion de Evento no encontrada."})
            }

            await GestionActualizar?.update(req.body)
            res.json("Gestion de Evento actualizada correctamente.")

        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }
    }

    static eliminarGestionEventoId = async (req : Request, res : Response) => {
        try {
            const {id} = req.params
            const GestionBorrar = await GestionEvento.findByPk(id)
            if (!GestionBorrar) {
                res.status(404).json({error : "Gestion de Evento no encontrada."})
                return
            }

            await GestionBorrar?.destroy()
            res.json("Gestion de Evento eliminada correctamente.")

        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }
    }

static aprobarGestionEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const idGestion = parseInt(req.params.id);
    console.log("📌 ID de gestión recibido:", idGestion);
    const IdUsuario = req.usuario?.IdUsuario;

    if (!IdUsuario) {
      res.status(401).json({ error: "Usuario no autenticado" });
      return;
    }

    const gestion = await GestionEvento.findOne({ where: { IdGestionE: idGestion } });
    if (!gestion) {
      res.status(404).json({ error: "No se encontró la gestión" });
      return;
    }

    // Marcar como aprobada
    gestion.Aprobar = "Aprobado";
    await gestion.save();

    // Buscar planificación asociada
    const planificacion = await PlanificacionEvento.findOne({ where: { IdGestionE: idGestion } });
    if (!planificacion) {
      res.status(404).json({ error: "No se encontró planificación asociada" });
      return;
    }

    // ✅ Validar si ya existe evento creado para esta planificación
    const eventoExistente = await Evento.findOne({
      where: { IdPlanificarE: planificacion.IdPlanificarE }
    });

    if (eventoExistente) {
       res.status(400).json({ error: "Este plan ya tiene un evento aprobado." });
       return;
    }

    // Generar QR payloads
    const payloadEntrada = {
      tipo: "evento",
      accion: "entrada",
      IdPlanificarE: planificacion.IdPlanificarE,
      nombreEvento: planificacion.NombreEvento
    };

    const payloadSalida = {
      tipo: "evento",
      accion: "salida",
      IdPlanificarE: planificacion.IdPlanificarE,
      nombreEvento: planificacion.NombreEvento
    };

    const qrEntrada = await QRCode.toDataURL(JSON.stringify(payloadEntrada));
    const qrSalida = await QRCode.toDataURL(JSON.stringify(payloadSalida));

    // Crear evento
    const evento = await Evento.create({
      NombreEvento: planificacion.NombreEvento,
      FechaInicio: planificacion.FechaEvento,
      FechaFin: planificacion.FechaEvento,
      HoraInicio: "08:00",
      HoraFin: "17:00",
      UbicacionEvento: planificacion.LugarDeEvento,
      IdPlanificarE: planificacion.IdPlanificarE,
      DescripcionEvento: `Evento aprobado automáticamente`,
      QREntrada: qrEntrada,
      QRSalida: qrSalida,
      IdUsuario: planificacion.IdUsuario, //
      ImagenEvento: planificacion.ImagenEvento

    });

    res.status(200).json({
      message: "✅ Evento creado y aprobado con QRs",
      evento
    });

  } catch (error) {
    console.error("❌ Error al aprobar gestión:", error);
    res.status(500).json({ error: "Error del servidor", message: (error as Error).message });
  }
};
static rechazarEvento = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    const gestion = await GestionEvento.findByPk(id);
    if (!gestion) {
      res.status(404).json({ error: "Evento no encontrado" });
      return;
    }

    if (!req.usuario) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    gestion.Aprobar = "Rechazado";
    gestion.MotivoRechazo = motivo;
    gestion.IdUsuario = req.usuario.IdUsuario;

    await gestion.save();

    // Consultar la gestión actualizada incluyendo el usuario que la gestionó
    const gestionConUsuario = await GestionEvento.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "gestionador", // el alias que tienes en el modelo
          attributes: ["IdUsuario", "Nombre", "Apellido", "Correo"],
        },
      ],
    });

    res.json({ message: "Evento rechazado correctamente", gestion: gestionConUsuario });
  } catch (error) {
    console.error("Error al rechazar evento:", error);
    res.status(500).json({ error: "Error al rechazar el evento" });
  }
};
}