import { Request, Response } from 'express';
import { ReaccionEvento } from '../models/ReaccionEvento';
import { Usuario } from '../models/Usuario';

export class ReaccionEventoController {
  // 👉 Registrar o actualizar una reacción
  static registrarReaccion = async (req: Request, res: Response) => {
const { IdEvento, Tipo } = req.body;
const IdUsuario = req.usuario?.IdUsuario; // 👈 desde el token decodificado

if (!IdUsuario) {
  res.status(401).json({ error: "No autorizado. Usuario no identificado." });
  return;
}


    if (!['like', 'dislike'].includes(Tipo)) {
      res.status(400).json({ error: "Tipo debe ser 'like' o 'dislike'" });
      return;
    }

    try {
      const [reaccion, creada] = await ReaccionEvento.findOrCreate({
        where: { IdUsuario, IdEvento },
        defaults: { Tipo },
      });

      if (!creada) {
        await reaccion.update({ Tipo });
        res.json({ mensaje: "Reacción actualizada" });
        return;
      }

      res.status(201).json({ mensaje: "Reacción registrada" });
    } catch (error) {
      console.error("❌ Error al registrar reacción:", error);
      res.status(500).json({ error: "Error al registrar la reacción" });
    }
  };

  // 👉 Obtener conteo y detalles por evento
  static obtenerReaccionesPorEvento = async (req: Request, res: Response) => {
    const { idEvento } = req.params;

    try {
      const likes = await ReaccionEvento.count({
        where: { IdEvento: idEvento, Tipo: 'like' },
      });

      const dislikes = await ReaccionEvento.count({
        where: { IdEvento: idEvento, Tipo: 'dislike' },
      });

      const detalles = await ReaccionEvento.findAll({
        where: { IdEvento: idEvento },
        include: [
          {
            model: Usuario,
            attributes: ['IdUsuario', 'Nombre', 'Apellido'],
          },
        ],
      });

      res.json({ likes, dislikes, detalles });
    } catch (error) {
      console.error("❌ Error al obtener reacciones:", error);
      res.status(500).json({ error: 'Error al obtener reacciones' });
    }
  };

  // 👉 Obtener lista de usuarios que reaccionaron
  static obtenerDetallesReacciones = async (req: Request, res: Response) => {
    const { idEvento } = req.params;

    try {
      const reacciones = await ReaccionEvento.findAll({
        where: { IdEvento: idEvento },
        include: [
          {
            model: Usuario,
            attributes: ['IdUsuario', 'Nombre', 'Apellido'],
          },
        ],
      });

      res.json(reacciones);
    } catch (error) {
      console.error("❌ Error al obtener detalles de reacciones:", error);
      res.status(500).json({ message: "Error al obtener detalles" });
    }
  };

// 👉 Obtener la reacción del usuario autenticado para un evento
static obtenerReaccionDeUsuario = async (req: Request, res: Response) => {
  const IdUsuario = req.usuario?.IdUsuario;
  const { idEvento } = req.params;

  if (!IdUsuario) {
  res.status(401).json({ error: 'No autorizado' });
  return;
  }

  try {
    const reaccion = await ReaccionEvento.findOne({
      where: { IdEvento: idEvento, IdUsuario },
    });

    if (!reaccion) {
       res.json({ Tipo: null }); // No ha reaccionado aún
       return;
    }

    res.json({ Tipo: reaccion.Tipo }); // like o dislike
  } catch (error) {
    console.error("❌ Error al obtener reacción del usuario:", error);
    res.status(500).json({ error: 'Error al obtener reacción del usuario' });
  }
};
}