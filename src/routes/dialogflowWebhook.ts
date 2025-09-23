import express, { Request, Response } from "express";
import { Actividad } from "../models/Actividad"; 
import { Evento } from "../models/Evento";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const intent = req.body.queryResult.intent.displayName;

  let respuesta = "No entendí bien tu pregunta 😅";
  let fulfillmentMessages: any[] = [];

  // Intent: actividades generales
  if (intent === "Disponibilidad") {
    const actividades = await Actividad.findAll();

    if (actividades.length > 0) {
      respuesta =
        "Estas son las actividades disponibles:";
      fulfillmentMessages.push({
        text: { text: [respuesta] },
      });

      // Convertir cada actividad en tarjeta
      actividades.forEach((a) => {
        fulfillmentMessages.push({
          card: {
            title: a.NombreActi,
            subtitle: `📅 ${a.FechaInicio} a ${a.FechaFin}\n⏰ ${a.HoraInicio} - ${a.HoraFin}\n📍 ${a.Ubicacion ?? "Por definir"}`,
            imageUri: a.Imagen ?? "https://i.ibb.co/0jX0s0L/default-event.png",
            buttons: [
              {
                text: "Ver detalles",
                postback: "https://miapp.com/actividades/" + a.IdActividad,
              },
            ],
          },
        });
      });
    } else {
      respuesta = "Por ahora no hay actividades registradas.";
      fulfillmentMessages.push({ text: { text: [respuesta] } });
    }
  }

  // Intent: eventos generales
  if (intent === "DisponibilidadEventos") {
    const eventos = await Evento.findAll();

    if (eventos.length > 0) {
      respuesta = "Estos son los eventos disponibles:";
      fulfillmentMessages.push({
        text: { text: [respuesta] },
      });

      // Convertir cada evento en tarjeta
      eventos.forEach((e) => {
        fulfillmentMessages.push({
          card: {
            title: e.NombreEvento,
            subtitle: `📅 ${e.FechaInicio} a ${e.FechaFin}\n⏰ ${e.HoraInicio} - ${e.HoraFin}\n📍 ${e.UbicacionEvento}\nℹ️ ${e.DescripcionEvento ?? "Sin descripción"}`,
            imageUri: "https://i.ibb.co/0jX0s0L/default-event.png", // puedes guardar imágenes en la BD si quieres
            buttons: [
              {
                text: "Inscribirme",
                postback: "https://miapp.com/eventos/" + e.IdEvento,
              },
            ],
          },
        });
      });
    } else {
      respuesta = "Por ahora no hay eventos registrados.";
      fulfillmentMessages.push({ text: { text: [respuesta] } });
    }
  }

  // Otros intents
  if (intent === "info_pestañas") {
    respuesta = `Nuestra plataforma tiene estas pestañas:\n
- Actividades: consulta e inscríbete en actividades lúdicas.\n
- Eventos: revisa eventos próximos.\n
- Perfil: administra tu información personal.\n
- Notificaciones: recibe avisos importantes.`;
    fulfillmentMessages.push({ text: { text: [respuesta] } });
  }

  if (intent === "info_objetivo") {
    respuesta =
      "Esta plataforma fue creada para centralizar la información de actividades y eventos del SENA, ayudando a los aprendices a organizar su tiempo y participar más fácilmente.";
    fulfillmentMessages.push({ text: { text: [respuesta] } });
  }

  // Respuesta final
  res.json({ fulfillmentMessages });
});

export default router;
