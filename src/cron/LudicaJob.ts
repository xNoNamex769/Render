import cron from "node-cron";
import { Actividad } from "../models/Actividad";
import { Usuario } from "../models/Usuario";
import { enviarNotificacion } from "../services/notificacionesService";
import { randomUUID } from "crypto"; // 👈 importa esto

const ID_CREADOR = 3; // instructor fijo o admin que "crea" la lúdica

export const iniciarLudicaDiaria = () => {
  cron.schedule("59 6 * * *", async () => {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0];

    // Validar si ya hay una lúdica para hoy
    const existente = await Actividad.findOne({
      where: {
        NombreActi: "Lúdica continua",
        FechaInicio: fechaHoy,
      },
    });

    if (existente) {
      console.log("✅ Ya existe una lúdica para hoy:", fechaHoy);
      return;
    }

    const codigoQR = randomUUID(); // 👈 genera un UUID único para el QR

    // Crear nueva lúdica
    const nueva = await Actividad.create({
      NombreActi: "Lúdica continua",
      Descripcion: "Espacio diario de recreación de 7am a 7pm.",
      FechaInicio: fechaHoy,
      FechaFin: fechaHoy,
      HoraInicio: "07:00:00",
      HoraFin: "19:00:00",
      TipoLudica: "Recreativa",
      Ubicacion: "Zona común",
      Imagen: "cuadrado.jpg",
      CodigoQR: codigoQR, // 👈 lo guardas aquí
      IdUsuario: ID_CREADOR,
    });

    console.log("🎉 Lúdica del día creada automáticamente:", fechaHoy);

    // Notificar a todos los aprendices
    const aprendices = await Usuario.findAll({ where: { IdRol: 2 } });
    const ids = aprendices.map((u) => u.IdUsuario);

    await enviarNotificacion({
      titulo: "🎈 Lúdica del día disponible",
      mensaje: "Ya puedes participar en la lúdica del día de hoy. ¡No faltes!",
      tipo: "Lúdica",
      idUsuarios: ids,
      idEvento: null,
    });

    console.log("📢 Notificación enviada a aprendices");
  });
};
