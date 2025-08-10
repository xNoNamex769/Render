import { Request, Response } from "express";
import { Constancia } from "../models/Constancia"; // Asegúrate de importar el modelo Constancia
import { Usuario } from "../models/Usuario";
import { Notificaciones } from "../models/Notificaciones";
import { enviarNotificacion } from "../services/notificacionesService";
import { PrestamoElementos } from "../models/PrestamoElementos";
export class ConstanciaControllers {
    // Obtener todas las constancias ordenadas por `ConstanciaFecha` constancias del usuario 
    static getConstanciaAll = async (req: Request, res: Response) => {
        try {
            console.log('Desde GET /api/Constancia');
            
            const constancias = await Constancia.findAll({
                order: [
                    ['ConstanciaFecha', 'ASC'], // Ordenar por la fecha de la constancia
                ],
            });

            res.json(constancias); // Solo enviamos la respuesta sin usar `return`
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al obtener las constancias' });
        }
    };

    // Obtener constancia por ID
    static getIdConstancia = async (req: Request, res: Response) => {
        try {
            const { ConstanciaId } = req.params; // Desestructuramos el ConstanciaId de los parámetros
            const constancia = await Constancia.findByPk(ConstanciaId);
            if (!constancia) {
                res.status(404).json({ error: 'Constancia no encontrada' });
                return; // Terminamos la ejecución después de enviar la respuesta
            }
            res.json(constancia); // Solo enviamos la respuesta sin usar `return`
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al obtener la constancia' });
        }
    };

    // Crear nueva constancia
    

    // Actualizar constancia por ID
    static actualizarIdConstancia = async (req: Request, res: Response) => {
        try {
            const { ConstanciaId } = req.params; // Desestructuramos el ConstanciaId de los parámetros
            const constancia = await Constancia.findByPk(ConstanciaId);
            if (!constancia) {
                res.status(404).json({ error: 'Constancia no encontrada' });
                return; // Terminamos la ejecución después de enviar la respuesta
            }

            // Actualizar los datos de la constancia
            await constancia.update(req.body);
            res.json('Constancia actualizada correctamente'); // Enviar respuesta
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al actualizar la constancia' });
        }
    };

    // Eliminar constancia por ID
    static eliminarIdConstancia = async (req: Request, res: Response) => {
        try {
            const { ConstanciaId } = req.params; // Desestructuramos el ConstanciaId de los parámetros
            const constancia = await Constancia.findByPk(ConstanciaId);
            if (!constancia) {
                res.status(404).json({ error: 'Constancia no encontrada' });
                return; // Terminamos la ejecución después de enviar la respuesta
            }

            // Eliminar la constancia
            await constancia.destroy();
            res.json('Constancia eliminada correctamente'); // Enviar respuesta
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al eliminar la constancia' });
        }
    };
static async crearConstancia(req: Request, res: Response) {
  try {
    const { IdUsuario, ConstanciaHorasCert } = req.body;

    const usuario = await Usuario.findByPk(IdUsuario);
    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const nuevaConstancia = await Constancia.create({
      ConstanciaHorasCert,
      ConstanciaEstado: "Pendiente",
      ConstanciaFecha: new Date(),
      IdUsuario,
    });

    //  Buscar todos los admins
    const administradores = await Usuario.findAll({
      where: { IdRol: 1 }, //  ID de rol administrador
      attributes: ['IdUsuario'],
    });

    const idAdmins = administradores.map((a) => a.IdUsuario);
    const io = req.app.get("io");

    // 🔔 Notificación a todos los admins
    await enviarNotificacion({
      titulo: "Constancia generada",
      mensaje: `El aprendiz ${usuario.Nombre} ${usuario.Apellido} ha generado una constancia de ${ConstanciaHorasCert} horas lúdicas.`,
      tipo: "Lúdica", // o "Constancia"
      idUsuarios: idAdmins,
      // Puedes agregar RutaDestino o imagenUrl si lo necesitas
    }, io);

    res.status(201).json(nuevaConstancia);
    return;

  } catch (error) {
    console.error(" Error creando constancia:", error);
    res.status(500).json({ error: "Error al crear constancia" });
    return;
  }
}



static async obtenerPorUsuario(req: Request, res: Response) {
  try {
    const { idUsuario } = req.params;

    const constancia = await Constancia.findOne({
      where: { IdUsuario: idUsuario },
      order: [["ConstanciaFecha", "DESC"]],
    });

    if (!constancia) {
      res.status(404).json({ error: "Constancia no encontrada" });
      return;
    }

    res.json(constancia);
  } catch (error) {
    console.error("❌ Error buscando constancia:", error);
    res.status(500).json({ error: "Error al buscar constancia" });
  }
}
static async listarConstancias(req: Request, res: Response) {
  try {
    const constancias = await Constancia.findAll({
      include: [{ model: Usuario, attributes: ["Nombre", "Apellido", "IdentificacionUsuario"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(constancias);
  } catch (error) {
    console.error("❌ Error al listar constancias:", error);
    res.status(500).json({ error: "Error al listar constancias" });
  }
}
//  Aprobar constancia (firma del admin)
static async aprobarConstancia(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Buscar constancia
    const constancia = await Constancia.findByPk(id);
    if (!constancia) {
      res.status(404).json({ error: "Constancia no encontrada" });
      return;
    }

    //  Buscar aprendiz
    const aprendiz = await Usuario.findByPk(constancia.IdUsuario);
    if (!aprendiz) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    // Verificar si tiene préstamos sin devolver
    const prestamosPendientes = await PrestamoElementos.findAll({
      where: {
        IdUsuario: aprendiz.IdUsuario,
        CumplioConEntrega: false,
      },
    });

    if (prestamosPendientes.length > 0) {
      //  Notificación de rechazo
      const noti = await Notificaciones.create({
        Titulo: "Constancia no aprobada",
        Mensaje: "Tu constancia no fue aprobada porque tienes préstamos pendientes de devolución. Regulariza la situación con el coordinador.",
        TipoNotificacion: "Constancia",
        FechaDeEnvio: new Date(),
        IdUsuario: aprendiz.IdUsuario,
        RutaDestino: "/usuario/prestamos",
        imagenUrl: "/icons/warning.png",
      });

      const io = req.app.get("io");
      io.emit("nuevaNotificacion", noti.toJSON());

   res.status(403).json({
  error: "El aprendiz tiene préstamos pendientes",
  bloqueado: true,
  IdUsuario: aprendiz.IdUsuario,
});
      return;
    }

    //  Aprobar constancia
    constancia.ConstanciaEstado = "Aprobado";
    await constancia.save();

    const noti = await Notificaciones.create({
      Titulo: "Constancia aprobada",
      Mensaje: `Tu constancia de ${constancia.ConstanciaHorasCert} horas ha sido aprobada y está lista para descargar.`,
      TipoNotificacion: "Constancia",
      FechaDeEnvio: new Date(),
      IdUsuario: aprendiz.IdUsuario,
      RutaDestino: "/constanciacr",
      imagenUrl: "/icons/aprobado.png",
    });

    const io = req.app.get("io");
    io.emit("nuevaNotificacion", noti.toJSON());

    res.json({ msg: "Constancia aprobada y notificada", constancia });
  } catch (error) {
    console.error("❌ Error aprobando constancia:", error);
    res.status(500).json({ error: "Error al aprobar constancia" });
  }
}

static async listarTodas(req: Request, res: Response) {
  try {
    const constancias = await Constancia.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["IdUsuario", "Nombre", "Apellido", "IdentificacionUsuario"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Añadir flag "tieneDeuda" a cada constancia
  const constanciasConDeuda = [];

for (const c of constancias) {
  const prestamosPendientes = await PrestamoElementos.count({
    where: { IdUsuario: c.IdUsuario, CumplioConEntrega: false },
  });

  const plain = c.get({ plain: true }); //  Convertir a objeto plano
  plain.tieneDeuda = prestamosPendientes > 0; // Agregar campo extra visible
  constanciasConDeuda.push(plain);
}

res.json(constanciasConDeuda); // Enviar los objetos planos con la info

  } catch (error) {
    console.error("❌ Error al listar constancias:", error);
    res.status(500).json({ error: "Error al listar constancias" });
  }
}
}