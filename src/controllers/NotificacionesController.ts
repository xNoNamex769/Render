import { Request, Response } from "express";
import { Notificaciones } from "../models/Notificaciones";
import { enviarNotificacion } from "../services/notificacionesService"; 
import { validateIdRolUsuarioYaExiste } from "../middleware/RolUsuario";


export class NotificacionController {
  static async crear(req: Request, res: Response) {
    try {
      const {
        Titulo,
        Mensaje,
        TipoNotificacion,
        IdEvento,
        idUsuarios,
        RutaDestino,
        imagenUrl,
      } = req.body;

      if (!idUsuarios || !Array.isArray(idUsuarios) || idUsuarios.length === 0) {
      res.status(400).json({ error: "Debe enviar idUsuarios como array" });
      return;
      }

      // Obtener el socket io desde app
      const io = req.app.get("io");

      // Llamar a la función que crea y emite notificaciones individualmente
      await enviarNotificacion(
        {
          titulo: Titulo,
          mensaje: Mensaje,
          tipo: TipoNotificacion,
          idUsuarios,
          idEvento: IdEvento ?? null,
          RutaDestino,
          imagenUrl,
        },
        io
      );

     res.status(201).json({ msg: "Notificaciones enviadas y creadas con éxito" })
     return;
    } catch (error) {
      console.error("❌ Error al crear notificación:", error);
      res.status(500).json({ error: "Error al crear notificación" });
      return;
    }
  }


  // ✅ Obtener todas las notificaciones de un usuario
 static async listarPorUsuario(req: Request, res: Response) {
  try {
    const { idUsuario } = req.params;

    const notificaciones = await Notificaciones.findAll({
      where: { IdUsuario: idUsuario },
      order: [["createdAt", "DESC"]],
      attributes: [
        "IdNotificacion",
        "Titulo",
        "Mensaje",
        "TipoNotificacion",
        "FechaDeEnvio",
        "Confirmado",
        "RutaDestino",   // ✅ importante
        "imagenUrl"      // ✅ importante
      ],
    });

    res.json(notificaciones);
  } catch (error) {
    console.error("❌ Error al listar notificaciones:", error);
    res.status(500).json({ error: "Error al listar notificaciones" });
  }
}


  // ✅ Marcar como confirmada
 // ✅ Marcar como confirmada
static async confirmar(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const noti = await Notificaciones.findByPk(id);
    if (!noti) {
    res.status(404).json({ error: "No encontrada" });
    return;
    }

    noti.Confirmado = true;
    await noti.save();

    res.json({ msg: "Notificación confirmada ✅" });
  } catch (error) {
    console.error("❌ Error al confirmar:", error);
    res.status(500).json({ error: "Error al confirmar" });
  }
}
}
