import { Op } from "sequelize";

import type { Request, Response } from "express";
import { Asistencia } from "../models/Asistencia";
import { Actividad } from "../models/Actividad";
import { calcularHoras } from "../utils/CalcularHoras";
import { RolUsuario } from "../models/RolUsuario";
import { Evento } from "../models/Evento";
import { Usuario } from "../models/Usuario";
import { Aprendiz } from "../models/Aprendiz";

export class AsistenciaControllers {
  static getAsistenciaAll = async (req: Request, res: Response) => {
    try {
      console.log('Desde GET /api/Asistencia');
      const asistencia = await Asistencia.findAll({
        order: [['AsiFecha', 'ASC']],
      });
      res.json(asistencia);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static getIdAsistencia = async (req: Request, res: Response) => {
    try {
      const { AsiId } = req.params;
      const asistencia = await Asistencia.findByPk(AsiId);
      if (!asistencia) {
        res.status(404).json({ error: 'Asistencia no encontrada' });
        return;
      }
      res.json(asistencia);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error al obtener la Asistencia' });
    }
  };

  static crearAsistencia = async (req: Request, res: Response) => {
    try {
      const asistencia = await Asistencia.create(req.body);
      res.status(201).json({
        msg: 'Asistencia creada exitosamente',
        asistencia,
      });
    } catch (error) {
      console.error('Error al crear asistencia:', error);
      res.status(500).json({ error: 'Hubo un error al crear la Asistencia' });
    }
  };

  static actualizarIdAsistencia = async (req: Request, res: Response) => {
    try {
      const { AsiId } = req.params;
      const asistencia = await Asistencia.findByPk(AsiId);
      if (!asistencia) {
        res.status(404).json({ error: 'Asistencia no encontrada' });
        return;
      }
      await asistencia.update(req.body);
      res.json('Asistencia actualizada correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error al actualizar la Asistencia' });
    }
  };

  static eliminarIdAsistencia = async (req: Request, res: Response) => {
    try {
      const { AsiId } = req.params;
      const asistencia = await Asistencia.findByPk(AsiId);
      if (!asistencia) {
        res.status(404).json({ error: 'Asistencia no encontrada' });
        return;
      }
      await asistencia.destroy();
      res.json('Asistencia eliminada correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error al eliminar la Asistencia' });
    }
  };




 




static getHistorialAsistenciaPorUsuario = async (req: Request, res: Response) => {
  const { IdUsuario } = req.params;

  try {
    // 1. Traer todas las actividades con su evento asociado
    const actividades = await Actividad.findAll({
      include: [{ model: Evento }],
      order: [['createdAt', 'ASC']],
    });

    // 2. Mapear el historial actividad por actividad
    const historial = await Promise.all(
      actividades.map(async (actividad) => {
        // Buscar si existe asistencia para esta actividad y usuario
        const asistencia = await Asistencia.findOne({
          where: {
            IdUsuario,
            IdActividad: actividad.IdActividad,
          },
  include: [
  {
    model: Usuario,
    as: 'usuario',
    attributes: ['IdUsuario', 'Nombre'],
    include: [
      {
        model: RolUsuario,
        as: 'rol',
        attributes: ['NombreRol'],
      },
      {
        model: Aprendiz,
        as:"perfilAprendiz",
        attributes: ['Ficha', 'ProgramaFormacion', 'Jornada'],
      },
    ],
  },
  { model: Usuario, as: 'RegistradorEntrada', attributes: ['Nombre'] },
  { model: Usuario, as: 'RegistradorSalida', attributes: ['Nombre'] },
],


        });
        if (!asistencia) return null;
        // Preparar los datos del historial
   const aprendizData = asistencia.usuario?.aprendiz;

console.log({
  nombre: asistencia.usuario?.Nombre,
  rol: asistencia.usuario?.rol?.NombreRol,
  aprendizData,
});


return {
  actividad: actividad.NombreActi,
  fecha: actividad.evento?.FechaInicio
    ? new Date(actividad.evento.FechaInicio).toISOString().split("T")[0]
    : "Sin fecha",
  evento: actividad.evento?.NombreEvento || "Sin evento",

  ficha: aprendizData?.Ficha || "---",
  programa: aprendizData?.ProgramaFormacion || "---",
  jornada: aprendizData?.Jornada || "---",

  entrada: asistencia?.AsiEntrada || false,
  entradaRegistradaPor: asistencia?.RegistradorEntrada?.Nombre || "---",
  entradaHora: asistencia?.AsiHoraEntrada
    ? new Date(asistencia.AsiHoraEntrada).toLocaleString("es-CO")
    : "---",

  salida: asistencia?.QRSalida ? true : false,
  salidaRegistradaPor: asistencia?.RegistradorSalida?.Nombre || "---",
  salidaHora:
    asistencia?.QRSalida && !isNaN(new Date(asistencia.QRSalida).getTime())
      ? new Date(asistencia.QRSalida).toLocaleString("es-CO")
      : "---",

  estado:
    asistencia?.AsiEntrada && asistencia?.QRSalida
      ? "Completa"
      : "Incompleta",
};

      })
    );
    const historialFiltrado = historial.filter((item) => item !== null);

    res.json(historialFiltrado);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ error: "Hubo un error al generar el historial." });
  }
};




static registrarDesdeQR = async (req: Request, res: Response) => {
  try {
    console.log("TOKEN USUARIO:", req.usuario);

    // Validar que el usuario esté autenticado y exista en req.usuario
    const IdUsuario = req.usuario?.IdUsuario;
    if (!IdUsuario) {
     res.status(401).json({ error: "No autenticado" });
     return;
    }

    const { IdActividad, tipo } = req.body;
    // Obtener la actividad
const actividad = await Actividad.findByPk(IdActividad);

if (!actividad) {
  res.status(404).json({ error: "Actividad no encontrada" });
  return;
}

// ⚠️ Validación SOLO para lúdica diaria
if (actividad.TipoLudica === "Recreativa" && actividad.NombreActi === "Lúdica continua") {
  const ahora = new Date();
  const fechaHoy = ahora.toISOString().split("T")[0];

  // Verificar si la actividad es de hoy
  if (actividad.FechaInicio !== fechaHoy) {
    res.status(403).json({ error: "⛔ QR vencido: esta lúdica no es del día de hoy." });
    return;
  }

  // Verificar que la hora esté entre 07:00 y 19:00
  const horaActual = ahora.getHours() + ahora.getMinutes() / 60;
  const horaInicio = 7;  // 07:00
  const horaFin = 19;    // 19:00

  if (horaActual < horaInicio || horaActual >= horaFin) {
    res.status(403).json({ error: "⛔ Fuera del horario de la lúdica (7am a 7pm)." });
    return;
  }
}


    // Validar que lleguen los datos necesarios
    if (!IdActividad || !tipo || (tipo !== "entrada" && tipo !== "salida")) {
    res.status(400).json({ error: "Faltan datos o tipo inválido." });
    return;
    }

    // Validar que el usuario exista en la base de datos
    const usuario = await Usuario.findByPk(IdUsuario);
    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    // Aquí podrías validar que el usuario esté autorizado para esta actividad

    // Buscar si ya hay registro de asistencia para esta actividad y usuario
    let asistencia = await Asistencia.findOne({
      where: { IdUsuario, IdActividad },
    });

    const ahora = new Date();

    if (!asistencia) {
      // No existe, crear nuevo registro según tipo
      asistencia = await Asistencia.create({
        IdUsuario,
        IdActividad,
        tipo,
        AsiFecha: ahora,
        AsiEstado: tipo === "entrada" ? "Incompleta" : null,
        AsiEntrada: tipo === "entrada",
        AsiHoraEntrada: tipo === "entrada" ? ahora : null,
        QREntrada: tipo === "entrada" ? ahora : null,
        QRSalida: tipo === "salida" ? ahora : null,
        IdRegistradorEntrada: tipo === "entrada" ? IdUsuario : null,
        IdRegistradorSalida: tipo === "salida" ? IdUsuario : null,
      });

       res.status(201).json({
        mensaje: `✅ ${tipo === "entrada" ? "Entrada" : "Salida"} registrada para ${usuario.Nombre}`,
        asistencia,
        usuario: {
          IdUsuario: usuario.IdUsuario,
          Nombre: usuario.Nombre,
        },
      });
      return;
    }

    // Ya existe la asistencia, actualizarla según el tipo

    if (tipo === "entrada") {
      if (asistencia.QREntrada) {
         res.status(400).json({ error: "⚠️ Ya existe una entrada registrada para este usuario." });
         return;
      }
      asistencia.QREntrada = ahora;
      asistencia.AsiEntrada = true;
      asistencia.AsiHoraEntrada = ahora;
      asistencia.IdRegistradorEntrada = IdUsuario;
      asistencia.AsiEstado = "Incompleta";

    } else if (tipo === "salida") {
      if (!asistencia.QREntrada) {
         res.status(400).json({ error: "⚠️ Debes registrar entrada antes de la salida." });
         return;
      }
      if (asistencia.QRSalida) {
       res.status(400).json({ error: "⚠️ Ya existe una salida registrada para este usuario." });
       return;
      }
      asistencia.QRSalida = ahora;
      asistencia.IdRegistradorSalida = IdUsuario;

      // Calcular horas asistidas
      const entrada = new Date(asistencia.QREntrada);
      const salida = new Date(asistencia.QRSalida);
      asistencia.AsiHorasAsistidas = calcularHoras(entrada, salida);

      asistencia.AsiEstado = "Completa";
    }

    await asistencia.save();

     res.status(200).json({
      mensaje: `✅ ${tipo === "entrada" ? "Entrada registrada" : "Salida registrada y asistencia completa"}`,
      asistencia,
      usuario: {
        IdUsuario: usuario.IdUsuario,
        Nombre: usuario.Nombre,
      },
      
    });
     return;

  } catch (error) {
    console.error("❌ Error en registrarDesdeQR:", error);
     res.status(500).json({ error: "Error al registrar asistencia desde QR" });
     return;
  }
};

static obtenerAsistenciasPorActividad = async (req: Request, res: Response) => {
  try {
    const { IdActividad } = req.params;

    if (!IdActividad) {
      res.status(400).json({ error: "Falta el IdActividad en la URL." });
      return;
    }

    const asistencias = await Asistencia.findAll({
      where: { IdActividad },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["IdUsuario", "Nombre", "Apellido", "Correo"],
          include: [
            {
              model: RolUsuario,
              as: "rol",
              attributes: ["NombreRol"],
            },
            {
              model: Aprendiz,
              as: "perfilAprendiz",
              attributes: ["Ficha", "ProgramaFormacion", "Jornada"],
            },
          ],
        },
        {
          model: Usuario,
          as: "RegistradorEntrada",
          attributes: ["IdUsuario", "Nombre"],
        },
        {
          model: Usuario,
          as: "RegistradorSalida",
          attributes: ["IdUsuario", "Nombre"],
        },
      ],
      order: [["AsiFecha", "ASC"]],
    });

    res.status(200).json(asistencias);
  } catch (error) {
    console.error("❌ Error al obtener asistencias:", error);
    res.status(500).json({ error: "Error al obtener asistencias por actividad." });
  }
};

static getAsistenciasPorUsuario = async (req: Request, res: Response) => {
  console.log("🚀 Entró a getAsistenciasPorUsuario con id:", req.params.id);
  const { id } = req.params;

  try {
    const asistencias = await Asistencia.findAll({
  where: { IdUsuario: id },
  attributes: [
    "AsiId",
    "AsiFecha",
    "AsiEstado",
    "AsiHorasAsistidas",
    "QREntrada",
    "QRSalida",
    "IdActividad",
    "tipo",
    "IdRegistradorEntrada",
    "IdRegistradorSalida",
    "createdAt",
    "updatedAt"
  ],
  include: [
    {
      model: Actividad,
      as: "actividad",
      attributes: ["NombreActi", "FechaInicio"],
    },
  ],
  order: [["AsiFecha", "DESC"]],
});


    if (!asistencias.length) {
       res.status(404).json({ mensaje: "No hay asistencias registradas" });
       return;
    }

    res.json(asistencias);
  } catch (error) {
    console.error("❌ Error al obtener asistencias:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
static registrarDesdeQREvento = async (req: Request, res: Response) => {
  try {
    const IdUsuario = req.usuario?.IdUsuario;
    const { tipo, accion, IdPlanificarE } = req.body;

    if (!IdUsuario) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    if (!tipo || !accion || !IdPlanificarE) {
      res.status(400).json({ error: "Faltan datos requeridos (tipo, accion o IdPlanificarE)" });
      return;
    }

    const evento = await Evento.findOne({ where: { IdPlanificarE } });
    if (!evento) {
      res.status(404).json({ error: "Evento no encontrado" });
      return;
    }

    let asistencia = await Asistencia.findOne({
      where: { IdUsuario, IdPlanificarE },
    });

    const ahora = new Date();

    if (!asistencia) {
      asistencia = await Asistencia.create({
        IdUsuario,
        IdPlanificarE,
        AsiFecha: ahora,
        AsiEstado: accion === "entrada" ? "Incompleta" : null,
        AsiEntrada: accion === "entrada",
        AsiHoraEntrada: accion === "entrada" ? ahora : null,
        QREntrada: accion === "entrada" ? ahora : null,
        QRSalida: accion === "salida" ? ahora : null,
        IdRegistradorEntrada: accion === "entrada" ? IdUsuario : null,
        IdRegistradorSalida: accion === "salida" ? IdUsuario : null,
      });

      res.status(201).json({
        mensaje: `✅ ${accion === "entrada" ? "Entrada" : "Salida"} registrada correctamente`,
        asistencia,
      });
      return;
    }

    if (accion === "entrada") {
      if (asistencia.QREntrada) {
        res.status(400).json({ error: "⚠️ Ya se registró la entrada" });
        return;
      }
      asistencia.QREntrada = ahora;
      asistencia.AsiEntrada = true;
      asistencia.AsiHoraEntrada = ahora;
      asistencia.IdRegistradorEntrada = IdUsuario;
      asistencia.AsiEstado = "Incompleta";
    } else if (accion === "salida") {
      if (!asistencia.QREntrada) {
        res.status(400).json({ error: "⚠️ Primero debes registrar la entrada" });
        return;
      }
      if (asistencia.QRSalida) {
        res.status(400).json({ error: "⚠️ Ya se registró la salida" });
        return;
      }
      asistencia.QRSalida = ahora;
      asistencia.IdRegistradorSalida = IdUsuario;
      asistencia.AsiHorasAsistidas = calcularHoras(new Date(asistencia.QREntrada), ahora);
      asistencia.AsiEstado = "Completa";
    }

    await asistencia.save();

    res.status(200).json({
      mensaje: `✅ ${accion === "entrada" ? "Entrada" : "Salida"} registrada correctamente`,
      asistencia,
    });
    return;
  } catch (error) {
    console.error("❌ Error en registrarDesdeQREvento:", error);
    res.status(500).json({ error: "Error al registrar asistencia desde QR (evento)" });
    return;
  }
};

static getAsistenciaPorEvento = async (req: Request, res: Response) => {
  try {
    const { idEvento } = req.params;

    // 1. Buscar el evento para extraer su IdPlanificarE
    const evento = await Evento.findByPk(idEvento);
    if (!evento) {
    res.status(404).json({ error: "Evento no encontrado" });
    return;
    }

    // 2. Buscar asistencias usando IdPlanificarE
    const asistencias = await Asistencia.findAll({
      where: { IdPlanificarE: evento.IdPlanificarE }, // 
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["Nombre", "Apellido", "Correo"],
          include: [
            {
              model: RolUsuario,
              as: "rol",
              attributes: ["NombreRol"],
            },
            {
              model: Aprendiz,
              as: "perfilAprendiz",
              attributes: ["Ficha", "ProgramaFormacion", "Jornada"],
            },
          ],
        },
      ],
    });

    if (!asistencias.length) {
     res.status(404).json({ error: "No hay asistencias registradas para este evento" });
     return;
    }

    res.status(200).json(asistencias);
  } catch (error) {
    console.error("❌ Error en getAsistenciaPorEvento:", error);
    res.status(500).json({ error: "Error al obtener asistencias del evento" });
  }
};
}