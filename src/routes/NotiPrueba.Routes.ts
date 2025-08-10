import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const io = req.app.get("io"); // obtener instancia de socket
  const { mensaje, titulo, IdUsuario } = req.body;

  // Emitir notificación (podrías usar `to(IdUsuario)` si luego manejas sockets por usuario)
  io.emit("nuevaNotificacion", {
    mensaje,
    titulo,
    IdUsuario,
  });

  res.json({ ok: true, mensaje: "📡 Notificación enviada con socket.io" });
});

export default router;
