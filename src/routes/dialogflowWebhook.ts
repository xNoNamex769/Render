import express, { Router, Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";

const dialogflowRouter: Router = express.Router();

const sessionClient = new SessionsClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!),
});

dialogflowRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body as { message?: string; sessionId?: string };

    if (!message || !sessionId) {
      res.status(400).json({ error: "Se requiere 'message' y 'sessionId'" });
      return;
    }

    const lower = message.toLowerCase();

    if (lower.includes("hora") || lower.includes("tiempo")) {
      const horaColombia = new Intl.DateTimeFormat("es-CO", {
        timeZone: "America/Bogota",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());

      res.json({
        sessionId,
        intent: "HoraActual",
        queryText: message,
        responseText: `🕒 La hora actual en Colombia es ${horaColombia}.`,
      });
      return;
    }

  

    const sessionPath = sessionClient.projectAgentSessionPath(
      "sixth-autonomy-473016-j7", // 🔹 Tu Project ID
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "es-CO",
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0]?.queryResult;

    if (!result) {
      res.status(500).json({ error: "No se recibió respuesta de Dialogflow" });
      return;
    }

    res.json({
      sessionId,
      intent: result.intent?.displayName ?? "Fallback",
      queryText: result.queryText ?? "",
      responseText: result.fulfillmentText ?? "No tengo una respuesta para eso 😅",
      fulfillmentMessages: result.fulfillmentMessages ?? [],
    });
  } catch (error) {
    console.error("❌ Error conectando con Dialogflow:", error);
    res.status(500).json({ error: "Error conectando con Dialogflow" });
  }
});

export default dialogflowRouter;
