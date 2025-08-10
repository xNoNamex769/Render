import { Request, Response } from "express";
import { RelUsuarioEvento } from "../models/RelUsuarioEvento"; 
import { Usuario } from "../models/Usuario";
import { Evento } from "../models/Evento";
//relacion del usuario con el evento creado 
export class RelUsuarioEventoControllers {

    static getRelUsuarioEventoAll = async (req: Request, res: Response) => {
        try {
            console.log('Desde GET /api/relusuarioevento');

            
            const relUsuarioEvento = await RelUsuarioEvento.findAll({
                order: [
                    ['Idusuario', 'ASC'], // Ordenar por el campo id
                ],
            });

            res.json(relUsuarioEvento); 
        } catch (error) {
            console.error(error); 
            res.status(500).json({ error: 'Hubo un error' }); 
        }
    };

    static getIdRelUsuarioEvento = async (req: Request, res: Response) => {
        try {
            const { IdUsuario } = req.params; 
            const relUsuarioEvento = await RelUsuarioEvento.findByPk(IdUsuario);

            if (!relUsuarioEvento) {
                const error = new Error('Relación no encontrada');
                console.log(error)
                res.status(404).json({ error: error.message });
                return;
            }

            res.json(relUsuarioEvento); 
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    static crearRelUsuarioEvento = async (req: Request, res: Response) => {
        try {
            const relUsuarioEvento = new RelUsuarioEvento(req.body);
            await relUsuarioEvento.save();
            res.status(201).json('Relación creada exitosamente');
        } catch (error) {
            console.error('Error al crear relación:', error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    static actualizarIdRelUsuarioEvento = async (req: Request, res: Response) => {
        try {
            const { IdUsuario } = req.params; 
            const relUsuarioEvento = await RelUsuarioEvento.findByPk(IdUsuario);

            if (!relUsuarioEvento) {
                const error = new Error('Relación no encontrada');
                res.status(404).json({ error: error.message });
                return;
            }

            await relUsuarioEvento.update(req.body); 
            res.json('Relación actualizada correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    static eliminarIdRelUsuarioEvento = async (req: Request, res: Response) => {
        try {
            const { Idusuario } = req.params;
            const relUsuarioEvento = await RelUsuarioEvento.findByPk(Idusuario);

            if (!relUsuarioEvento) {
                const error = new Error('Relación no encontrada');
                res.status(404).json({ error: error.message });
                return;
            }

            await relUsuarioEvento.destroy(); 
            res.json('Relación eliminada correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

static confirmarAsistencia = async (req: Request, res: Response) => {
  console.log("✅ Datos recibidos en backend:", req.body);

  const { IdUsuario, IdEvento } = req.body;

  try {
    // Verifica que el usuario exista
    const usuario = await Usuario.findByPk(IdUsuario);
    if (!usuario) {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
      return;
    }

    // Verifica que el evento exista
    const evento = await Evento.findByPk(IdEvento);
    if (!evento) {
      res.status(404).json({ mensaje: "Evento no encontrado" });
      return;
    }

    // Busca si ya existe la relación usuario-evento
    let relacion = await RelUsuarioEvento.findOne({
      where: { IdUsuario, IdEvento }
    });

    if (relacion) {
      if (relacion.ConfirmoAsistencia) {
        res.status(400).json({ mensaje: "Ya confirmaste asistencia previamente." });
        return;
      }

      // Actualiza si existe pero no estaba confirmado aún
      await relacion.update({ ConfirmoAsistencia: true });
    } else {
      // Crea la relación si no existía
      relacion = await RelUsuarioEvento.create({
        IdUsuario,
        IdEvento,
        ConfirmoAsistencia: true
      });
    }

    console.log("✅ Asistencia confirmada y guardada");
    res.status(200).json({ mensaje: "Asistencia confirmada correctamente" });
    return;

  } catch (error) {
    console.error("❌ Error al confirmar asistencia:", error);
   res.status(500).json({ mensaje: "Error al confirmar asistencia" });
   return;
  }
};


static obtenerAsistentesPorEvento = async (req: Request, res: Response) => {
  try {
    const { idEvento } = req.params;

    const asistentes = await RelUsuarioEvento.findAll({
      where: { IdEvento: idEvento },
      include: [
        {
          model: Usuario,
          attributes: ['IdUsuario', 'Nombre', 'Apellido', 'Correo'],
        },
      ],
    });

    if (!asistentes || asistentes.length === 0) {
      res.status(404).json({ message: 'No hay asistentes para este evento.' });
      return;
    }

    const listaUsuarios = asistentes.map(a => a.Usuario);
    res.json(listaUsuarios);

  } catch (error) {
    console.error("Error al obtener asistentes:", error);
    res.status(500).json({ error: 'Error del servidor al obtener asistentes' });
  }
};
static async obtenerAsistentesConfirmados(req: Request, res: Response) {
    const { idEvento } = req.params;

    try {
      const asistentes = await RelUsuarioEvento.findAll({
        where: {
          IdEvento: idEvento,
          ConfirmoAsistencia: true,
        },
        include: [
          {
            model: Usuario,
            attributes: ["IdUsuario", "Nombre", "Apellido", "Correo"],
          },
        ],
      });

      res.status(200).json(asistentes);
    } catch (error) {
      console.error("❌ Error al obtener asistentes confirmados:", error);
      res.status(500).json({ mensaje: "Error al obtener asistentes" });
    }
  }
}