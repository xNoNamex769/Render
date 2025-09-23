import express, { Request, Response } from "express";
import { Actividad } from "../models/Actividad"; // tu modelo Sequelize

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const intent = req.body.queryResult.intent.displayName;

  let respuesta = "No entendí bien tu pregunta 😅";

  // Intent: actividades generales
  if (intent === "Disponibilidad") {
    const actividades = await Actividad.findAll();

    if (actividades.length > 0) {
      respuesta =
        "Estas son las actividades disponibles:\n\n" +
        actividades
          .map(
            (a) =>
              `- ${a.NombreActi}  
📅 ${a.FechaInicio} a ${a.FechaFin}  
⏰ ${a.HoraInicio} - ${a.HoraFin}  
📍 ${a.Ubicacion ?? "Por definir"}`
          )
          .join("\n\n");
    } else {
      respuesta = "Por ahora no hay actividades registradas.";
    }
  }

  // Intent: pestañas de navegación
  if (intent === "info_pestañas") {
    respuesta = `Nuestra plataforma tiene estas pestañas:\n
- Actividades: consulta e inscríbete en actividades lúdicas.\n
- Eventos: revisa eventos próximos.\n
- Perfil: administra tu información personal.\n
- Notificaciones: recibe avisos importantes.`;
  }

  // Intent: objetivo de la plataforma
  if (intent === "info_objetivo") {
    respuesta =
      "Esta plataforma fue creada para centralizar la información de actividades y eventos del SENA, ayudando a los aprendices a organizar su tiempo y participar más fácilmente.";
  }

  // 👇 Aquí usamos fulfillmentMessages en lugar de solo fulfillmentText
  res.json({
    fulfillmentMessages: [
      {
        text: {
          text: [respuesta],
        },
      },
    ],
  });
});

export default router;
