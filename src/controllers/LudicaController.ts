import { Request, Response } from "express";
import { Actividad } from "../models/Actividad";
import { Op } from "sequelize";
import { Asistencia } from "../models/Asistencia";
import { Usuario } from "../models/Usuario";
import * as QRCode from "qrcode";
import { enviarNotificacion } from "../services/notificacionesService";
import { Aprendiz } from "../models/Aprendiz";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export class LudicaController {
  static crearLudica = async (req: Request, res: Response) => {
    try {
      const {
        NombreActi,
        Descripcion,
        FechaInicio,
        FechaFin,
        HoraInicio,
        HoraFin,
        TipoLudica,
        Ubicacion,
        IdUsuario,
        HorarioContinuo,
      } = req.body;

      const isEmpty = (val: any) => {
        if (typeof val === "string") return val.trim() === "";
        return val === undefined || val === null;
      };

      if (
        isEmpty(NombreActi) ||
        isEmpty(FechaInicio) ||
        isEmpty(FechaFin) ||
        isEmpty(HoraInicio) ||
        isEmpty(HoraFin) ||
        isEmpty(TipoLudica) ||
        isEmpty(Ubicacion)
      ) {
        res.status(400).json({ error: "⚠️ Faltan campos requeridos" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "⚠️ Debes subir una imagen" });
        return;
      }

      // Subir imagen a Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer);

      // Crear lúdica en DB
      const nuevaLudica = await Actividad.create({
        NombreActi,
        Descripcion: Descripcion || null,
        FechaInicio,
        FechaFin,
        HoraInicio,
        HoraFin,
        TipoLudica,
        Ubicacion,
        Imagen: uploadResult.secure_url, // 👈 guardamos en DB
        IdUsuario: parseInt(IdUsuario),
        HorarioContinuo: HorarioContinuo === "true" || HorarioContinuo === true,
      });

      // Generar payload QR
      const payloadEntrada = {
        IdActividad: nuevaLudica.IdActividad,
        tipo: "entrada",
        nombreActividad: nuevaLudica.NombreActi,
        nombreEvento: "Lúdica individual",
      };
      const payloadSalida = {
        IdActividad: nuevaLudica.IdActividad,
        tipo: "salida",
        nombreActividad: nuevaLudica.NombreActi,
        nombreEvento: "Lúdica individual",
      };

      // Generar códigos QR
      const qrEntrada = await QRCode.toDataURL(JSON.stringify(payloadEntrada));
      const qrSalida = await QRCode.toDataURL(JSON.stringify(payloadSalida));

      nuevaLudica.CodigoQR = qrEntrada;
      nuevaLudica.CodigoQRSalida = qrSalida;
      await nuevaLudica.save();

      // Enviar notificación a aprendices
      const aprendices = await Usuario.findAll({ where: { IdRol: 2 } });
      const idsAprendices = aprendices.map((u) => u.IdUsuario);

      await enviarNotificacion({
        titulo: "Nueva lúdica disponible",
        mensaje: `Participa en la lúdica "${nuevaLudica.NombreActi}".`,
        tipo: "Lúdica",
        idUsuarios: idsAprendices,
        idEvento: null,
      });

      res.status(201).json({
        message: "✅ Lúdica registrada con QR generado",
        ludica: {
          ...nuevaLudica.dataValues,
          ImagenUrl: nuevaLudica.Imagen, // 👈 normalizamos
        },
      });
    } catch (error) {
      console.error("❌ Error al registrar lúdica:", error);
      res.status(500).json({
        error: "Hubo un error al registrar la lúdica",
        message: (error as Error).message,
      });
    }
  };

  static getLudicaDelDia = async (req: Request, res: Response) => {
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const ludica = await Actividad.findOne({
        where: {
          FechaInicio: hoy,
          TipoLudica: { [Op.not]: null },
        },
        order: [["createdAt", "DESC"]],
      });
      if (!ludica) {
        res.status(404).json({ message: "No hay lúdica para hoy" });
        return;
      }
      res.json({
        ...ludica.dataValues,
        ImagenUrl: ludica.Imagen || null,
      });
    } catch (error) {
      console.error("❌ Error al obtener lúdica del día:", error);
      res.status(500).json({ error: "Error al obtener lúdica del día" });
    }
  };

  static getTodasLasLudicas = async (_req: Request, res: Response) => {
    try {
      const actividades = await Actividad.findAll({
        where: { TipoLudica: { [Op.not]: null } },
        order: [["FechaInicio", "DESC"]],
      });
      res.json(
        actividades.map((a) => ({
          ...a.dataValues,
          ImagenUrl: a.Imagen || null,
        }))
      );
    } catch (error) {
      console.error("❌ Error al obtener lúdicas:", error);
      res.status(500).json({ error: "Error al obtener lúdicas" });
    }
  };

  static getLudicasDelInstructor = async (req: Request, res: Response) => {
    try {
      const IdUsuario = req.usuario?.IdUsuario;
      if (!IdUsuario) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }
      const ludicas = await Actividad.findAll({
        where: { TipoLudica: { [Op.not]: null }, IdUsuario },
        order: [
          ["FechaInicio", "DESC"],
          ["HoraInicio", "ASC"],
        ],
      });
      res.json(
        ludicas.map((l) => ({
          ...l.dataValues,
          ImagenUrl: l.Imagen || null,
        }))
      );
    } catch (error) {
      console.error("❌ Error al obtener mis lúdicas:", error);
      res.status(500).json({ error: "Error interno" });
    }
  };

  static getAsistentesPorLudica = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const asistentes = await Asistencia.findAll({
        where: { IdActividad: id },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["Nombre", "Apellido", "Correo"],
            include: [
              {
                model: Aprendiz,
                as: "perfilAprendiz",
                attributes: ["Ficha", "ProgramaFormacion", "Jornada"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.json(asistentes);
    } catch (error) {
      console.error("❌ Error al obtener asistentes:", error);
      res.status(500).json({ error: "Error interno" });
    }
  };

  static registrarAsistenciaDesdeQR = async (req: Request, res: Response) => {
    const { codigoQR } = req.body;
    const IdUsuario = req.usuario?.IdUsuario;
    if (!IdUsuario) {
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    let data;
    try {
      data = JSON.parse(codigoQR);
    } catch (e) {
      res.status(400).json({ error: "QR inválido o corrupto" });
      return;
    }

    const actividad = await Actividad.findByPk(data.IdActividad);
    if (!actividad) {
      res.status(404).json({ error: "Actividad no encontrada" });
      return;
    }

    const esEntrada = data.tipo === "entrada";
    const ahora = new Date();

    let asistencia = await Asistencia.findOne({
      where: { IdActividad: actividad.IdActividad, IdUsuario },
    });

    if (!asistencia) {
      asistencia = await Asistencia.create({
        IdActividad: actividad.IdActividad,
        IdUsuario,
        AsiFecha: ahora,
        tipo: data.tipo,
        AsiEstado: esEntrada ? "Incompleta" : null,
        QREntrada: esEntrada ? ahora : null,
        QRSalida: !esEntrada ? ahora : null,
        IdRegistradorEntrada: esEntrada ? IdUsuario : null,
        IdRegistradorSalida: !esEntrada ? IdUsuario : null,
        AsiHorasAsistidas: 0,
      });
      res.json({
        message: `✅ ${esEntrada ? "Entrada" : "Salida"} registrada correctamente`,
        asistencia,
      });
      return;
    }

    if (esEntrada) {
      if (asistencia.QREntrada) {
        res.status(400).json({ error: "⚠️ Ya registraste entrada" });
        return;
      }
      asistencia.QREntrada = ahora;
      asistencia.IdRegistradorEntrada = IdUsuario;
    } else {
      if (asistencia.QRSalida) {
        res.status(400).json({ error: "⚠️ Ya registraste salida" });
        return;
      }
      if (!asistencia.QREntrada) {
        res.status(400).json({ error: "⚠️ Debes registrar primero la entrada" });
        return;
      }
      asistencia.QRSalida = ahora;
      asistencia.IdRegistradorSalida = IdUsuario;
      const entrada = new Date(asistencia.QREntrada);
      const salida = new Date(ahora);
      const milisegundos = salida.getTime() - entrada.getTime();
      const horas = milisegundos / (1000 * 60 * 60);
      asistencia.AsiHorasAsistidas = parseFloat(horas.toFixed(2));
      asistencia.AsiEstado = "Completa";
    }

    await asistencia.save();
    res.json({
      message: `✅ ${esEntrada ? "Entrada" : "Salida"} registrada correctamente`,
      asistencia,
    });
  };

  static getHorasLudicasPorUsuario = async (req: Request, res: Response) => {
    const { idUsuario } = req.params;
    try {
      const asistencias = await Asistencia.findAll({
        where: { IdUsuario: idUsuario, tipo: "Lúdica", AsiEstado: "Completa" },
      });
      const totalHoras = asistencias.reduce(
        (sum, asistencia) => sum + (asistencia.AsiHorasAsistidas || 0),
        0
      );
      res.json({ totalHoras });
    } catch (error) {
      console.error("❌ Error al calcular horas lúdicas:", error);
      res.status(500).json({ error: "Error al calcular horas" });
    }
  };

  static getResumenInteresPorLudica = async (_req: Request, res: Response) => {
    try {
      const actividades = await Actividad.findAll({
        where: { TipoLudica: { [Op.not]: null } },
        attributes: ["IdActividad", "NombreActi"],
      });

      const resumen = await Promise.all(
        actividades.map(async (actividad) => {
          const totalAsistencias = await Asistencia.count({
            where: { IdActividad: actividad.IdActividad, QREntrada: { [Op.not]: null } },
          });
          const asistenciasCompletas = await Asistencia.count({
            where: { IdActividad: actividad.IdActividad, AsiEstado: "Completa" },
          });
          const horasTotales = await Asistencia.sum("AsiHorasAsistidas", {
            where: { IdActividad: actividad.IdActividad, AsiEstado: "Completa" },
          });
          return {
            actividad: actividad.NombreActi,
            entradas: totalAsistencias,
            completas: asistenciasCompletas,
            horas: parseFloat((horasTotales || 0).toFixed(2)),
          };
        })
      );

      res.json(resumen);
    } catch (error) {
      console.error("❌ Error al obtener resumen de interés:", error);
      res.status(500).json({ error: "Error al obtener resumen" });
    }
  };
}
