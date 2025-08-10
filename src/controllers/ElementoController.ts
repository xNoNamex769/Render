import { Request, Response } from "express";
import { Elemento } from "../models/Elemento";
import {  PrestamoElementos } from "../models/PrestamoElementos";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";

const QRCode = require("qrcode");
export class ElementoController {
  static async crearElemento(req: Request, res: Response) {
    try {
      const { Nombre, Descripcion, Cantidad } = req.body;
      const Imagen = req.file?.filename;

      const mimeTypesPermitidos = ["image/jpeg", "image/png", "image/webp"];

      // Validaciones
      if (!Nombre || !Imagen || !Cantidad) {
        res
          .status(400)
          .json({ mensaje: "Nombre, imagen y cantidad son obligatorios" });
        return;
      }

      if (!req.file || !mimeTypesPermitidos.includes(req.file.mimetype)) {
        res
          .status(400)
          .json({
            mensaje: "Tipo de archivo no permitido. Usa JPG, PNG o WEBP.",
          });
        return;
      }

      const cantidadNum = parseInt(Cantidad);
      if (isNaN(cantidadNum) || cantidadNum < 1) {
        res
          .status(400)
          .json({ mensaje: "Cantidad debe ser un número mayor a 0" });
        return;
      }

      // 1. Crear el elemento
      const nuevoElemento = await Elemento.create({
        Nombre,
        Descripcion,
        Imagen,
        CantidadTotal: cantidadNum,
        CantidadDisponible: cantidadNum,
        Disponible: true,
      });

      // 2. Generar QR
      const qrPayload = {
        IdElemento: nuevoElemento.IdElemento,
        Nombre: nuevoElemento.Nombre,
        tipo: "alquiler",
      };

      const qrDir = path.resolve(__dirname, "../../public/qrcodes");

      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
      }

      const qrPath = path.join(qrDir, `${nuevoElemento.IdElemento}.png`);
      console.log("📦 QR generado en:", qrPath); // ← AGREGA ESTA LÍNEA
      await QRCode.toFile(qrPath, JSON.stringify(qrPayload));
      console.log("📦 QR generado en:", qrPath);
      // 3. Respuesta
      res.json({
        mensaje: "Elemento creado exitosamente con QR",
        elemento: nuevoElemento,
        qrUrl: `/qrcodes/${nuevoElemento.IdElemento}.png`,
      });
      return;
    } catch (error) {
      console.error("Error al crear el elemento:", error);
      res.status(500).json({ mensaje: "Error interno al crear el elemento" });
      return;
    }
  }

  static async getCatalogo(req: Request, res: Response) {
    try {
      const elementos = await Elemento.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.json(elementos);
      return;
    } catch (error) {
      console.error("Error al obtener catálogo:", error);
      res.status(500).json({ error: "Error al obtener catálogo" });
      return;
    }
  }

  static async eliminarElemento(req: Request, res: Response) {
    try {
      const { IdAlquiler } = req.params;
      const io = req.app.get("io"); // 👈 Asegúrate de haber hecho `app.set("io", io)` en tu `server.ts`

      // 1. Buscar el elemento en el catálogo
      const elementoCatalogo = await PrestamoElementos.findOne({
        where: {
          IdAlquiler,
          Observaciones: "catalogo",
        },
      });

      if (!elementoCatalogo) {
        res
          .status(404)
          .json({ error: "Elemento no encontrado en el catálogo" });
        return;
      }

      // 2. Verificar si hay alquileres activos
      const alquileresActivos = await PrestamoElementos.findAll({
        where: {
          IdElemento: elementoCatalogo.IdAlquiler,
          Observaciones: { [Op.ne]: "catalogo" },
          CumplioConEntrega: false,
        },
      });

      if (alquileresActivos.length > 0) {
        // 3. Marcar como no disponible
        const elementoReal = await Elemento.findByPk(
          elementoCatalogo.IdAlquiler
        );

        if (elementoReal) {
          elementoReal.Disponible = false;
          await elementoReal.save();
        }

        // 4. Notificar al administrador vía Socket.IO
        if (io) {
          io.emit("notificacion_admin", {
            titulo: "Elemento marcado como no disponible",
            mensaje: `El elemento "${elementoReal?.Nombre}" tiene alquileres pendientes y fue marcado como no disponible.`,
            tipo: "advertencia",
            fecha: new Date(),
          });
        }

        res.status(200).json({
          mensaje:
            "Elemento con alquileres activos. Marcado como no disponible y se notificó al administrador.",
        });
        return;
      }

      // 5. Eliminar el elemento si no hay alquileres pendientes
      await elementoCatalogo.destroy();

      res.json({ mensaje: "Elemento eliminado correctamente del catálogo." });
      return;
    } catch (error) {
      console.error("Error al eliminar elemento:", error);
      res.status(500).json({ error: "Error al eliminar elemento" });
      return;
    }
  }
}
