import cron from "node-cron";
import { Op } from "sequelize";
import { Asistencia } from "../models/Asistencia";
import { enviarNotificacion } from "../services/notificacionesService";

export const revisarAsistenciasIncompletas = () => {
  cron.schedule("10 19 * * *", async () => {
    try {
      const fechaHoy = new Date().toISOString().split("T")[0];

      const asistenciasIncompletas = await Asistencia.findAll({
        where: {
          AsiEstado: { [Op.ne]: 'Completa' },
          QRSalida: null,
          QREntrada: { [Op.ne]: null },
          AsiFecha: {
            [Op.gte]: new Date(`${fechaHoy}T00:00:00`),
            [Op.lte]: new Date(`${fechaHoy}T23:59:59`)
          }
        }
      });

      const idsNotificados: number[] = [];

      for (const asistencia of asistenciasIncompletas) {
        asistencia.AsiEstado = "Incompleta";
        asistencia.AsiHorasAsistidas = 0;
        await asistencia.save();
        idsNotificados.push(asistencia.IdUsuario);
      }

      if (idsNotificados.length > 0) {
        await enviarNotificacion({
          titulo: "⚠️ Asistencia incompleta",
          mensaje: "No registraste tu salida en la lúdica del día. Tu asistencia ha sido marcada como incompleta.",
          tipo: "Asistencia",
          idUsuarios: idsNotificados
        });
      }

      console.log(`📌 Asistencias incompletas revisadas y notificados: ${idsNotificados.length}`);
    } catch (error) {
      console.error("❌ Error al revisar asistencias incompletas:", error);
    }
  });
};
