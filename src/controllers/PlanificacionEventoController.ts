import type { Request, Response } from "express";
import { PlanificacionEvento } from "../models/PlanificacionEvento"; // Importa el modelo adecuado
import { GestionEvento } from "../models/GestionEvento";
import { Usuario } from "../models/Usuario";
import { RolUsuario } from "../models/RolUsuario";
import { Op } from "sequelize";
import { PerfilInstructor } from "../models/PerfilInstructor";
import { error } from "console";
// esto esta bien , falta es traer al usuario quiem hizo esta peticion 
export class PlanificacionEventoControllers {


  static getPlanificarEventoAll = async (req: Request, res: Response) => {
  try {
    const eventos = await PlanificacionEvento.findAll({
        attributes: [
    'IdPlanificarE',
    'NombreEvento',
    'FechaEvento',
    'LugarDeEvento',
    'ImagenEvento', // 👈 Asegúrate de incluir esto
    'Recursos',
    'TipoEvento',
    'IdUsuario',
    'IdGestionE'
  ],
      include: [
        {
          model: Usuario,
          attributes: ['IdUsuario', 'Nombre', 'Apellido', 'Correo'],
          include: [
            {
              model: RolUsuario,
              attributes: ['NombreRol']
            },
            {
              association: 'perfilInstructor', 
              attributes: ['ubicacion', 'profesion','imagen'] 
            }
          ]
        },
        {
          model: GestionEvento,
          attributes: ['Aprobar' , 'IdGestionE']
        }
      ],
      order: [['FechaEvento', 'ASC']]
    });

    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al traer las planificaciones' });
  }
};

    static getIdPlanificarEvento = async (req: Request, res: Response) => {
        try {
            const { IdPlanificarE } = req.params;
            const evento = await PlanificacionEvento.findByPk(IdPlanificarE);
            if (!evento) {
                const error = new Error('Evento no encontrado');
                res.status(404).json({ error: error.message });
                return;
            }
            res.json(evento); 
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    
  
    
    static actualizarIdPlanificarEvento = async (req: Request, res: Response) => {
        try {
            const { IdPlanificarE } = req.params;
            const evento = await PlanificacionEvento.findByPk(IdPlanificarE);
            if (!evento) {
                const error = new Error('Evento no encontrado');
                res.status(404).json({ error: error.message });
                return;
            }
            await evento.update(req.body); 
            res.json('Evento planificado actualizado correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    
    static eliminarIdPlanificarEvento = async (req: Request, res: Response) => {
        try {
            const { IdPlanificarE } = req.params;
            const evento = await PlanificacionEvento.findByPk(IdPlanificarE);
            if (!evento) {
                const error = new Error('Evento no encontrado');
                res.status(404).json({ error: error.message });
                return;
            }
            await evento.destroy(); 
            res.json('Evento planificado eliminado correctamente');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    };



 

static crearPlanificacion = async (req: Request, res: Response) => {
  try {
   console.log("Archivo recibido multer:", req.file);
    const {
      NombreEvento,
      FechaEvento,
      LugarDeEvento,
      TipoEvento,
      
      Recursos
    } = req.body;

    const IdUsuario = req.usuario?.IdUsuario;
        const imagenEvento = req.file ? `uploads/${req.file.filename}` : null;

    // Validar campos requeridos
    if (!NombreEvento || !FechaEvento || !LugarDeEvento || !IdUsuario) {
      const error = new Error("Faltan campos requeridos");
      res.status(400).json({ error: error.message });
      return;
    }

    // ✅ Primero crear gestión (autoincrementable)
    const nuevaGestion = await GestionEvento.create({
      Aprobar: "Pendiente" ,
      IdUsuario: IdUsuario,  // o el valor por defecto que uses
    });

    // ✅ Luego crear planificación con el IdGestionE generado
    const nuevaPlanificacion = await PlanificacionEvento.create({
      NombreEvento,
      FechaEvento,
      LugarDeEvento,
      Recursos: Recursos || null,
      TipoEvento,
      IdUsuario,
      IdGestionE: nuevaGestion.IdGestionE,
      ImagenEvento: req.file?.filename || null //  Aquí lo corriges
    });

    res.status(201).json({
      message: "✅ Planificación creada exitosamente con gestión",
      planificacion: nuevaPlanificacion
    });
    return;

  } catch (error) {
    console.error("❌ Error al crear planificación:", error);
    res.status(500).json({
      error: "Error del servidor",
      message: (error as Error).message
    });
    return;
  }
};
// Asegúrate de tener esta línea arriba



static getMisEventos = async (req: Request, res: Response) => {
  try {
    const IdUsuario = req.usuario?.IdUsuario;

    if (!IdUsuario) {
      res.status(401).json({ error: "Usuario no autenticado" });
      return
    }
const eventos = await PlanificacionEvento.findAll({
  where: { IdUsuario },
  attributes: [
    'IdPlanificarE',
    'NombreEvento',
    'FechaEvento',
    'LugarDeEvento',
    'ImagenEvento',
    'Recursos',
    'TipoEvento',
    'IdGestionE'
  ],
  include: [
    {
      model: GestionEvento,
      attributes: ['Aprobar', 'IdGestionE', 'MotivoRechazo'],
      include: [
        {
          model: Usuario,
          as: "gestionador", // Esto debe coincidir con el alias que pusiste en el modelo GestionEvento
          attributes: ['Nombre', 'Apellido', 'Correo']
        }
      ]
    },
    {
      model: Usuario,
      attributes: ['IdUsuario', 'Nombre', 'Apellido', 'Correo']
    }
  ],
  order: [['FechaEvento', 'DESC']]
});

    res.json(eventos);
  } catch (error) {
    console.error("❌ Error al obtener mis eventos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
static crearEventosMasivos = async (req: Request, res: Response) => {
  try {
    const IdUsuario = req.usuario?.IdUsuario;

    if (!IdUsuario) {
     res.status(401).json({ error: "Usuario no autenticado" });
     return;
    }

    const eventos = req.body;

    if (!Array.isArray(eventos) || eventos.length === 0) {
      res.status(400).json({ error: "Debes enviar una lista de eventos" });
      return;
    }

    const eventosCreados = [];

    for (const evento of eventos) {
      const {
        NombreEvento,
        FechaEvento,
        LugarDeEvento,
        Recursos,
        TipoEvento,
        ImagenEvento,
        Trimestre
      } = evento;

      if (!NombreEvento || !FechaEvento || !LugarDeEvento || !TipoEvento) {
       res.status(400).json({ error: "Faltan campos requeridos en uno de los eventos" });
       return;
      }

      // 1. Crear la gestión pendiente
      const nuevaGestion = await GestionEvento.create({
        Aprobar: "Pendiente",
        IdUsuario: IdUsuario
      });

      // 2. Crear planificación del evento
      const planificacion = await PlanificacionEvento.create({
        NombreEvento,
        FechaEvento,
        LugarDeEvento,
        Recursos: Recursos || null,
        TipoEvento,
        ImagenEvento: ImagenEvento || null,
        Trimestre: Trimestre || null,
        EstadoCarga: "Masivo",
        IdUsuario,
        IdGestionE: nuevaGestion.IdGestionE
      });

      eventosCreados.push(planificacion);
    }

     res.status(201).json({
      message: "✅ Eventos masivos creados correctamente",
      cantidad: eventosCreados.length,
      eventos: eventosCreados
    });
return
  } catch (error) {
    console.error("❌ Error al crear eventos masivos:", error);
   res.status(500).json({
      error: "Error al crear eventos masivos",
      message: (error as Error).message
    });
    return;
  }
};
static  obtenerEventosPorTrimestre =async  (req: Request, res: Response) => {
  const { anio, trimestre } = req.params;

  const trimestreNum = parseInt(trimestre);
  const anioNum = parseInt(anio);

  if (![1, 2, 3, 4].includes(trimestreNum)) {
    res.status(400).json({ mensaje: "Trimestre inválido. Usa un número del 1 al 4." });
    return;
  }

  const rangos:Record<number,[string,string]> = {
    1: [`${anio}-01-01`, `${anio}-03-31`],
    2: [`${anio}-04-01`, `${anio}-06-30`],
    3: [`${anio}-07-01`, `${anio}-09-30`],
    4: [`${anio}-10-01`, `${anio}-12-31`],
  };

  const [fechaInicio, fechaFin] = rangos[trimestreNum];

  try {
    const eventos = await PlanificacionEvento.findAll({
      where: {
        FechaEvento: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

console.log("Eventos encontrados:", eventos);
    res.status(200).json(eventos);
    return;
  } catch (error) {
    console.error("Error al obtener eventos por trimestre:", error);
   res.status(500).json({ mensaje: "Error interno al buscar eventos" });
   return;
  }
};
}