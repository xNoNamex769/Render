import express from "express";
import QRCode from "qrcode";
import { PrestamoElementos } from "../models/PrestamoElementos";

const router = express.Router();

router.get("/:idAlquiler", async (req, res) => {
  const { idAlquiler } = req.params;

  try {
    const alquiler = await PrestamoElementos.findByPk(idAlquiler);

    if (!alquiler) {
      res.status(404).json({ error: "Elemento de alquiler no encontrado" });
      return;
    }

    const qrPayload = {
      IdElemento: alquiler.IdAlquiler,
      tipo: "alquiler",
      nombreElemento: alquiler.NombreElemento,
      nombreAprendiz: "Aprendiz Test",
      codigo: `ALQ-${Date.now()}`,
    };

    console.log("📦 Payload generado para QR:", qrPayload);

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
    const img = Buffer.from(qrDataUrl.split(",")[1], "base64");

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": img.length,
    });
    res.end(img);
    return;
  } catch (err) {
    console.error("❌ Error generando QR:", err);
    res.status(500).json({ error: "Error generando QR" });
    return;
  }
});

export default router;
