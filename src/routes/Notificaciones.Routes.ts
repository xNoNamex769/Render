import { Router } from "express";
import { io } from "../socket"
import { NotificacionController } from "../controllers/NotificacionesController";
import { authenticate } from "../middleware/auth"; // ajusta
const router = Router();
router.post("/test-socket", authenticate, (req, res) => {
  const { titulo, mensaje } = req.body;
  const io = req.app.get("io");

  const usuario = req.usuario;

  if (!usuario) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  io.emit("nuevaNotificacion", {
    Titulo: titulo || "🔔 Noti de prueba",
    Mensaje: mensaje || "Esta es una prueba con Socket.IO",
    IdUsuario: usuario.IdUsuario
  });

  res.json({ ok: true, mensaje: "📡 Notificación enviada con socket.io" });
});

router.post("/", NotificacionController.crear);
router.get("/:idUsuario", NotificacionController.listarPorUsuario);
router.put("/confirmar/:id", NotificacionController.confirmar);

export default router;
