import { Router } from 'express';
import { RelUsuarioEventoControllers } from '../controllers/RelUsuarioEventoController';
import {validateIdRelUsuarioEvento,validateRelUsuarioEventoBody,validateRelUsuarioEventoYaExiste,} from '../middleware/RelUsuarioEvento';
import { handleInputErrors } from '../middleware/validation';
import { verificarToken } from '../middleware/VerificarToken';
import { RelUsuarioEvento } from '../models/RelUsuarioEvento';
import { Usuario } from '../models/Usuario';
import { Evento } from '../models/Evento';
const router = Router();


router.get('/', RelUsuarioEventoControllers.getRelUsuarioEventoAll);


router.get(
  '/:IdUsuario',
  validateIdRelUsuarioEvento,
  handleInputErrors,
  RelUsuarioEventoControllers.getIdRelUsuarioEvento
);


router.post(
  '/',
  validateRelUsuarioEventoYaExiste,
  validateRelUsuarioEventoBody,
  handleInputErrors,
  RelUsuarioEventoControllers.crearRelUsuarioEvento
);


router.put(
  '/:id',
  validateIdRelUsuarioEvento,
  validateRelUsuarioEventoBody,
  handleInputErrors,
  RelUsuarioEventoControllers.actualizarIdRelUsuarioEvento
);


router.delete(
  '/:id',
  validateIdRelUsuarioEvento,
  handleInputErrors,
  RelUsuarioEventoControllers.eliminarIdRelUsuarioEvento
);
router.post('/confirmar-asistencia',verificarToken,RelUsuarioEventoControllers.confirmarAsistencia);

router.get("/asistentes/:idEvento", async (req, res) => {
  const { idEvento } = req.params;

  try {
    const asistentes = await RelUsuarioEvento.findAll({
      where: {
        IdEvento: idEvento,
        ConfirmoAsistencia: true,
      },
      include: [{ model: Usuario }], // para incluir info del usuario
    });

    res.json(asistentes);
  } catch (error) {
    console.error("Error al traer asistentes:", error);
    res.status(500).json({ error: "Error al obtener asistentes" });
  }
});
router.get("/asistencias-confirmadas/:idInstructor", async (req, res) => {
  const { idInstructor } = req.params;

  try {
    const eventos = await Evento.findAll({
      where: { IdUsuario: idInstructor },
      include: [{
        model: RelUsuarioEvento,
        where: { ConfirmoAsistencia: true },
        include: [Usuario]
      }]
    });

    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener confirmaciones." });
  }
});
export default router;
