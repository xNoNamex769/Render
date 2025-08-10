import type { Request, Response } from "express";
import {  PrestamoElementos } from "../models/PrestamoElementos";
import { Usuario } from "../models/Usuario";
import { Elemento } from "../models/Elemento";
import { Op } from "sequelize";
const QRCode = require("qrcode"); // FUNCIONA bien con CommonJS
import path from "path";
import fs from "fs";
import { enviarNotificacionGeneral } from "../services/notificaciongeneral";
export class CatalogoController {
  static subirElemento = async (req: Request, res: Response) => {
    try {
      const {
        Nombre,
        Descripcion = "Elemento agregado desde catálogo",
        Cantidad,
      } = req.body;
      const Imagen = req.file?.filename;

      if (!Nombre || !Imagen || !Cantidad) {
        res
          .status(400)
          .json({ error: "Nombre, imagen y cantidad son requeridos" });
        return;
      }

      const cantidadNum = parseInt(Cantidad, 10);
      if (isNaN(cantidadNum) || cantidadNum < 1) {
        res
          .status(400)
          .json({ error: "Cantidad debe ser un número válido mayor que 0" });
        return;
      }

      // 1️⃣ Crear el Elemento base
      const nuevoElemento = await Elemento.create({
        Nombre,
        Descripcion,
        Imagen,
        CantidadTotal: cantidadNum,
        CantidadDisponible: cantidadNum,
        Disponible: true,
      });

      // 2️⃣ Generar contenido QR como JSON
      const contenidoQR = JSON.stringify({
        tipo: "alquiler",
        IdElemento: nuevoElemento.IdElemento,
        nombreElemento: nuevoElemento.Nombre,
        nombreAprendiz: "Aprendiz desconocido", // Puedes reemplazar por el real si lo tienes
        codigo: `ALQ-${Date.now()}`,
      });

      // 3️⃣ Generar imagen del QR y guardarla
      const qrPath = path.resolve(__dirname, "../../public/qrcodes");
      if (!fs.existsSync(qrPath)) {
        fs.mkdirSync(qrPath, { recursive: true });
      }

      const rutaQR = path.join(qrPath, `${nuevoElemento.IdElemento}.png`);
      await QRCode.toFile(rutaQR, contenidoQR, {
        errorCorrectionLevel: "H",
        width: 300,
      });

      // 4️⃣ Crear el registro de catálogo
      const nuevoAlquiler = await PrestamoElementos.create({
        IdElemento: nuevoElemento.IdElemento,
        NombreElemento: Nombre,
        Imagen,
        CantidadDisponible: cantidadNum,
        Observaciones: "catalogo",
        FechaSolicitud: new Date(),
        FechaDevolucion: new Date(),
        RegistradoPor: "sistema",
        IdUsuario: null,
      });

      // 5️⃣ Notificar a aprendices
      const aprendices = await Usuario.findAll({ where: { IdRol: 2 } });
      const idsAprendices = aprendices.map((u) => u.IdUsuario);

      await enviarNotificacionGeneral({
        titulo: "Nuevo elemento en catálogo",
        mensaje: `Se ha agregado un nuevo elemento al catálogo: "${Nombre}"`,
        tipo: "Catalogo",
        idUsuarios: idsAprendices,
        imagenUrl: `http://localhost:3001/uploads/${Imagen}`,
        RutaDestino: "alquilerap",
      });

      res.status(201).json({
        mensaje: "Elemento creado con QR y notificación enviada ✅",
        elemento: nuevoElemento,
        alquiler: nuevoAlquiler,
      });
    } catch (error) {
      console.error("❌ Error al subir elemento:", error);
      res.status(500).json({ error: "Error interno al subir el elemento" });
    }
  };

  static getCatalogo = async (_req: Request, res: Response) => {
    try {
      const elementos = await PrestamoElementos.findAll({
        where: {
          Observaciones: "catalogo",
          IdElemento: { [Op.ne]: 0 }, // 🔥 Excluye los inválidos
        },
        include: [
          {
            model: Elemento,
            attributes: ["IdElemento", "Nombre", "Imagen"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json(elementos);
    } catch (error) {
      console.error("Error al obtener catálogo:", error);
      res.status(500).json({ error: "Error al obtener los elementos" });
    }
  };
  static actualizarImagen = async (req: Request, res: Response) => {
    try {
      const { IdAlquiler } = req.params;
      const alquiler = await PrestamoElementos.findByPk(IdAlquiler);
      if (!alquiler) {
        res.status(404).json({ error: "Elemento no encontrado" });
        return;
      }

      if (req.file) {
        alquiler.Imagen = req.file.filename;
        await alquiler.save();
        res.json({ mensaje: "Imagen actualizada correctamente", alquiler });
        return;
      } else {
        res.status(400).json({ error: "No se recibió imagen" });
        return;
      }
    } catch (error) {
      console.error("Error al actualizar imagen:", error);
      res.status(500).json({ error: "Error interno al actualizar imagen" });
    }
  };

  static eliminarElemento = async (req: Request, res: Response) => {
    try {
      const { IdAlquiler } = req.params;
      const alquiler = await PrestamoElementos.findByPk(IdAlquiler);
      if (!alquiler) {
        res.status(404).json({ error: "Elemento no encontrado" });
        return;
      }

      await alquiler.destroy();
      res.json({ mensaje: "Elemento eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar elemento:", error);
      res.status(500).json({ error: "Error al eliminar el elemento" });
    }
  };
}
