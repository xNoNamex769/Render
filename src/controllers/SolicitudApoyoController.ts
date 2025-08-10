import { Request, Response } from "express";
import { SolicitudApoyo } from "../models/SolicitudApoyo";
import { Usuario } from "../models/Usuario";
import { RolUsuario } from "../models/RolUsuario";
import { PerfilInstructor } from "../models/PerfilInstructor";
export class SolicitudApoyoController {
  static getAllSolicitudApoyo = async (req: Request, res: Response) => {
    try {
      console.log(" Entrando a getAllSolicitudApoyo...");

      const solicitudesApoyos = await SolicitudApoyo.findAll({
        include: [
          {
            model: Usuario,
            attributes: ["Nombre", "Correo"],
            include: [
              {
                model: RolUsuario,
                attributes: ["NombreRol"],
                as: "rol", // asegúrate de que esté igual que en el modelo
              },
            ],
          },
        ],
      });

      res.json(solicitudesApoyos);
    } catch (error) {
      console.error("❌ Error en getAllSolicitudApoyo:", error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static getSolicitudApoyoId = async (req: Request, res: Response) => {
    try {
      const { IdSolicitud } = req.params;
      const solicitudDelApoyo = await SolicitudApoyo.findOne({
        where: { IdSolicitud },
      });

      if (!solicitudDelApoyo) {
        res.status(404).json({ error: "Solicitud de apoyo no encontrada" });
        return;
      }

      res.json(solicitudDelApoyo);
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

 static CrearSolicitudApoyo = async (req: Request, res: Response) => {
  try {
    const { IdUsuario, TipoAyuda, Descripcion, Estado } = req.body;

    if (!IdUsuario || !TipoAyuda || !Descripcion || !Estado) {
      res.status(400).json({ error: "Datos incompletos" });
      return;
    }

    const solicitudDelApoyo = await SolicitudApoyo.create({
      IdUsuario,
      TipoAyuda,
      Descripcion,
      Estado,
    });

    res.status(201).json(solicitudDelApoyo); 
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    res.status(500).json({ error: "Hubo un error al crear la solicitud de apoyo" });
  }
};


  static actualizarSolicitudAopoyo = async (req: Request, res: Response) => {
    try {
      const { IdSolicitud } = req.params;
      const solicitudDelApoyo = await SolicitudApoyo.findByPk(IdSolicitud);

      if (!solicitudDelApoyo) {
        res.status(404).json({ error: "Solicitud de apoyo no encontrada" });
        return;
      }

      await solicitudDelApoyo.update(req.body);
res.json(solicitudDelApoyo); // devuelve el objeto actualizado

    } catch (error) {
      console.error("Error al actualizar solicitud de apoyo", error);
      res.status(500).json({ error: "Hubo un error al actualizar la solicitud de apoyo" });
    }
  };

  static eliminarSolicitudApoyo = async (req: Request, res: Response) => {
    try {
      const { IdSolicitud } = req.params;
      const solicitudDelApoyo = await SolicitudApoyo.findByPk(IdSolicitud);

      if (!solicitudDelApoyo) {
       res.status(404).json({ error: "Solicitud de apoyo no encontrada" });
       return;
      }

      await solicitudDelApoyo.destroy();
      res.json("Solicitud de apoyo eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la solicitud de apoyo", error);
      res.status(500).json({ error: "Hubo un error al eliminar la solicitud de apoyo" });
    }
  };
// Obtener instructores encargados de un área específica
// static async obtenerEncargadosPorTipoAyuda eliminado. Usar solo getEncargadosPorTipoAyuda
// GET /api/solicitudapoyo/encargados/:tipoAyuda
static async getEncargadosPorTipoAyuda(req: Request, res: Response) {
  const { tipoAyuda } = req.params;

  const tiposValidos = ['psicologica', 'emocional', 'economica'];

  if (!tiposValidos.includes(tipoAyuda.toLowerCase())) {
    res.status(400).json({ message: 'Tipo de ayuda inválido' });
    return;
  }

  try {
    const perfiles = await PerfilInstructor.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['IdUsuario', 'Nombre', 'Telefono', 'Correo']
        }
      ]
    });

    const encargados = perfiles.filter(p => {
      if (!p.profesion) return false;

      const profesion = p.profesion.toLowerCase();
      const tipo = tipoAyuda.toLowerCase();

      if (tipo === 'psicologica') {
        return profesion === 'psicologica' || profesion.includes('psico');
      } else if (tipo === 'emocional') {
        return profesion === 'emocional' || profesion.includes('orientador') || profesion.includes('social');
      } else if (tipo === 'economica') {
        return profesion.includes('economica') || profesion.includes('finan') || profesion.includes('bienestar');
      }

      return false;
    });

    // ✅ Solo una vez se responde
    res.json(encargados);

  } catch (error) {
    console.error("Error al buscar encargados:", error);
    res.status(500).json({ message: "Error al obtener encargados" });
  }
}
}