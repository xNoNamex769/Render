// dialogflowWebhook.ts
import express, { Router, Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";


const dialogflowRouter: Router = express.Router();

// Inicializa el cliente de Dialogflow con tu JSON de servicio
const sessionClient = new SessionsClient({
  keyFilename: "../keys/sixth-autonomy-473016-j7-e0949feeb5db.json", // ruta real de tu JSON
});

// POST /api/dialogflow
dialogflowRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body as { message?: string; sessionId?: string };

    if (!message || !sessionId) {
      res.status(400).json({ error: "Se requiere 'message' y 'sessionId'" });
      return;
    }

    const sessionPath = sessionClient.projectAgentSessionPath(
      "sixth-autonomy-473016-j7", // Project ID de tu JSON
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
    const result = responses[0].queryResult;

    if (!result) {
      res.status(500).json({ error: "No se recibió respuesta de Dialogflow" });
      return;
    }

    res.json({
      sessionId,
      fulfillmentMessages: result.fulfillmentMessages ?? [],
      intent: result.intent?.displayName ?? "Fallback",
      queryText: result.queryText ?? "",
      responseText: result.fulfillmentText ?? "",
    });
  } catch (error) {
    console.error("Error conectando con Dialogflow:", error);
    res.status(500).json({ error: "Error conectando con Dialogflow" });
  }
});

export default dialogflowRouter;
