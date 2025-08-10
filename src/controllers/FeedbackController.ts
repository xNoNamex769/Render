import type { Request, Response } from "express";
import { Feedback } from "../models/Feedback";
import { Usuario } from "../models/Usuario";
import { Aprendiz } from "../models/Aprendiz";
import { Actividad } from "../models/Actividad";
import { SolicitudApoyo } from "../models/SolicitudApoyo";
//usuarips que han cmentado el feddback del evento x , ya sea por id o por nombre
export class FeedbackController {

 static getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['Nombre', 'Apellido', 'Correo'],
        },
        {
          model: Actividad,
          attributes: ['NombreActi'],
        },
        {
          model: SolicitudApoyo,
          attributes: ['TipoAyuda'],
        },
      ],
      order: [['FechaEnvio', 'DESC']],
    });

    res.json(feedbacks);
  } catch (error) {
    console.error('Error al obtener feedbacks:', error);
    res.status(500).json({ error: 'Hubo un error al obtener los feedbacks' });
  }
};


    static getFeedbackById = async (req: Request, res: Response) => {
        try {
            const { IdFeedback } = req.params;
            const feedback = await Feedback.findByPk(IdFeedback);

            if (!feedback) {
                res.status(404).json({ error: 'Feedback no encontrado' });
                return;
            }

            res.json(feedback);
        } catch (error) {
            console.error('Error al obtener feedback:', error);
            res.status(500).json({ error: 'Hubo un error al buscar el feedback' });
        }
    };

    static crearFeedback = async (req: Request, res: Response) => {
        try {
            const feedback = new Feedback(req.body);
            await feedback.save();
            res.status(201).json('Feedback creado exitosamente');
        } catch (error) {
            console.error('Error al crear feedback:', error);
            res.status(500).json({ error: 'Hubo un error al crear el feedback' });
        }
    };

    static actualizarFeedbackById = async (req: Request, res: Response) => {
        try {
            const { IdFeedback } = req.params;
            const feedback = await Feedback.findByPk(IdFeedback);

            if (!feedback) {
                res.status(404).json({ error: 'Feedback no encontrado' });
                return;
            }

            await feedback.update(req.body);
            res.json('Feedback actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar feedback:', error);
            res.status(500).json({ error: 'Hubo un error al actualizar el feedback' });
        }
    };

    static eliminarFeedbackById = async (req: Request, res: Response) => {
        try {
            const { IdFeedback } = req.params;
            const feedback = await Feedback.findByPk(IdFeedback);

            if (!feedback) {
            res.status(404).json({ error: 'Feedback no encontrado' });
            return;
            }

            await feedback.destroy();
            res.json('Feedback eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar feedback:', error);
            res.status(500).json({ error: 'Hubo un error al eliminar el feedback' });
        }
    };


    ////empezamos
static crearFeedbackActividad = async (req: Request, res: Response) => {
  try {
    const usuario = req.usuario; // viene desde el middleware auth

    if (!usuario) {
       res.status(401).json({ error: 'No autorizado' });
       return;
    }

    const { ComentarioFeedback, Calificacion, IdActividad } = req.body;
    const { IdUsuario } = usuario; // ✅ lo estás sacando correctamente

    // Validación básica de los datos recibidos
    if (!ComentarioFeedback || Calificacion === undefined || !IdActividad) {
     res.status(400).json({ error: 'Faltan campos obligatorios' });
     return;
    }

    const feedback = await Feedback.create({
      ComentarioFeedback,
      Calificacion,
      FechaEnvio: new Date(),
      IdActividad,
      IdUsuario,
    });

    res.status(201).json({ message: ' Feedback creado', feedback });
  } catch (error) {
    console.error(' Error creando feedback de actividad:', error);
    res.status(500).json({ error: 'Hubo un error al crear feedback para actividad' });
  }
};


static getFeedbacksByActividad = async (req: Request, res: Response) => {
  const { IdActividad } = req.params;

  try {
    const feedbacks = await Feedback.findAll({
      where: { IdActividad },
      include: [
        {
          association: Feedback.associations.usuario,
          attributes: ["Nombre", "Apellido", "Correo","FotoPerfil"],
        },
      ],
      order: [["FechaEnvio", "DESC"]],
    });

    res.json(feedbacks);
  } catch (error) {
    console.error("Error al obtener feedbacks por actividad:", error);
    res.status(500).json({ error: "Error al obtener los feedbacks." });
  }
};


static getFeedbacksDeMisActividades = async (req: Request, res: Response) => {
    try {
        const { IdUsuario } = req.params;

        // 1. Buscar actividades que este usuario ha creado
        const actividades = await Actividad.findAll({ where: { IdUsuario } });

        const idsActividades = actividades.map(a => a.IdActividad);

        if (idsActividades.length === 0) {
      res.json([]); // El usuario no ha creado actividades aún
      return;
        }

        // 2. Buscar feedbacks ligados a esas actividades
        const feedbacks = await Feedback.findAll({
            where: { IdActividad: idsActividades },
            include: [Usuario, Actividad],
            order: [['FechaEnvio', 'DESC']]
        });

        res.json(feedbacks);
    } catch (error) {
        console.error('❌ Error obteniendo "mis feedbacks":', error);
        res.status(500).json({ error: 'Error al obtener feedbacks de tus actividades' });
    }
};
 // Crear feedback
  static async crearFeedbackSolicitud(req: Request, res: Response) {
    try {
      const { Comentario, Calificacion, IdUsuario, IdSolicitud } = req.body;

      const nuevoFeedback = await Feedback.create({
        ComentarioFeedback: Comentario,
        Calificacion,
        IdUsuario,
        IdSolicitud,
        FechaEnvio: new Date()
      });

      res.status(201).json(nuevoFeedback);
    } catch (error) {
      console.error("Error al crear feedback:", error);
      res.status(500).json({ error: "Error al crear el feedback" });
    }
  }

  // Obtener feedback por IdSolicitud
  static async obtenerPorSolicitud(req: Request, res: Response) {
    try {
      const { IdSolicitud } = req.params;

      const feedback = await Feedback.findOne({
        where: { IdSolicitud: IdSolicitud },
        include: [Usuario]
      });

      if (!feedback) {
       res.status(404).json({ message: "No hay feedback para esta solicitud" });
       return;
      }

      res.json(feedback);
    } catch (error) {
      console.error("Error al obtener feedback:", error);
      res.status(500).json({ error: "Error al obtener feedback" });
    }
  }
static getPromedioPorTipoAyuda = async (req: Request, res: Response) => {
  try {
    const [results] = await Feedback.sequelize?.query(`
      SELECT sa.TipoAyuda, ROUND(AVG(f.Calificacion), 2) AS Promedio
      FROM Feedback f
      JOIN SolicitudApoyo sa ON f.IdSolicitud = sa.IdSolicitud
      WHERE f.IdSolicitud IS NOT NULL
      GROUP BY sa.TipoAyuda
    `) || [];

    res.json(results);
  } catch (error) {
    console.error("Error en promedio por tipo de ayuda:", error);
    res.status(500).json({ error: "Error al obtener promedios" });
  }
};
static getFeedbacksByEvento = async (req: Request, res: Response) => {
  try {
    const { IdEvento } = req.params;

    const feedbacks = await Feedback.findAll({
      where: { IdEvento },
      include: [
        {
          model: Usuario,
          attributes: ['IdUsuario', 'Nombre', 'Apellido']
        }
      ],
      order: [['FechaEnvio', 'DESC']]
    });

    res.json(feedbacks);
  } catch (error) {
    console.error("❌ Error al obtener feedbacks por evento:", error);
    res.status(500).json({ error: "Error al obtener feedbacks del evento" });
  }
};
static crearFeedbackEvento = async (req: Request, res: Response) => {
  try {
    const usuario = req.usuario; // viene del middleware authFeedback

    if (!usuario) {
     res.status(401).json({ error: 'No autorizado' });
     return;
    }

    const { ComentarioFeedback, Calificacion, IdEvento } = req.body;
    const { IdUsuario } = usuario;

    if (!ComentarioFeedback || Calificacion === undefined || !IdEvento) {
     res.status(400).json({ error: 'Faltan campos obligatorios' });
     return;
    }

    const nuevoFeedback = await Feedback.create({
      ComentarioFeedback,
      Calificacion,
      IdEvento,
      IdUsuario,
      FechaEnvio: new Date(),
    });

    res.status(201).json({ message: 'Feedback para evento creado correctamente', feedback: nuevoFeedback });
  } catch (error) {
    console.error("❌ Error al crear feedback para evento:", error);
    res.status(500).json({ error: "Error al crear feedback para evento" });
  }
};
}