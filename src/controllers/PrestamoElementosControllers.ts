import type { Request, Response } from "express";
import {  PrestamoElementos } from "../models/PrestamoElementos";
import { Usuario } from "../models/Usuario";
import { Elemento } from "../models/Elemento";
import { Aprendiz } from "../models/Aprendiz";
export class PrestamoElementosControllers {
  static getPrestamoElementosAll = async (req: Request, res: Response) => {
    try {
      const alquileres = await PrestamoElementos.findAll({
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["IdUsuario", "Nombre", "Correo"],
            include: [
              {
                model: Aprendiz,
                as: "perfilAprendiz",
                attributes: ["Ficha", "Jornada", "ProgramaFormacion"],
              },
            ],
          },
          {
            model: Elemento,
            as: "elemento",
            attributes: ["IdElemento", "Nombre", "Imagen"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json(alquileres);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Hubo un error al obtener los alquileres" });
    }
  };

  static getIdAlquiler = async (req: Request, res: Response) => {
    try {
      const { IdAlquiler } = req.params;
      const alquiler = await PrestamoElementos.findByPk(IdAlquiler, {
        include: [Usuario], // Trae datos del usuario
      });
      if (!alquiler) {
        res.status(404).json({ error: "Alquiler no encontrado" });
        return;
      }
      res.json(alquiler);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al obtener el alquiler" });
    }
  };

  static crearAlquiler = async (req: Request, res: Response) => {
    try {
      const {
        NombreElemento,
        FechaSolicitud,
        FechaDevolucion,
        RegistradoPor,
        Observaciones,
        IdUsuario,
        IdElemento,
      } = req.body;

      // Validación básica
      if (!IdElemento || !IdUsuario) {
        res.status(400).json({ error: "Faltan datos obligatorios." });
        return;
      }

      const nuevo = await PrestamoElementos.create({
        NombreElemento,
        FechaSolicitud,
        FechaDevolucion,
        RegistradoPor,
        Observaciones,
        IdUsuario,
        IdElemento,
      });

      res
        .status(201)
        .json({
          mensaje: "Alquiler registrado correctamente",
          alquiler: nuevo,
        });
    } catch (error) {
      console.error("Error al registrar alquiler:", error);
      res.status(500).json({ error: "Error interno al registrar el alquiler" });
    }
  };

  static actualizarIdAlquiler = async (req: Request, res: Response) => {
    try {
      const { IdAlquiler } = req.params;
      const alquiler = await PrestamoElementos.findByPk(IdAlquiler);
      if (!alquiler) {
        res.status(404).json({ error: "Alquiler no encontrado" });
        return;
      }
      await alquiler.update(req.body);
      res.json("Alquiler actualizado correctamente");
    } catch (error) {
      res
        .status(500)
        .json({ error: "Hubo un error al Actualizar el Alquiler" });
    }
  };

  static eliminarIdAlquiler = async (req: Request, res: Response) => {
    try {
      const { IdAlquiler } = req.params;
      const alquiler = await PrestamoElementos.findByPk(IdAlquiler);
      if (!alquiler) {
        res.status(404).json({ error: "Alquiler no encontrado" });
        return;
      }
      await alquiler.destroy();
      res.json("Alquiler eliminado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al Eliminar el Alquiler" });
    }
  };
  static registrarDesdeQR = async (req: Request, res: Response) => {
    try {
      const {
        IdElemento,
        nombreElemento,
        nombreAprendiz,
        fechaDevolucion,
        observaciones,
        codigo,
      } = req.body;
      const IdUsuario = (req as any).usuario?.IdUsuario || 0;

      const usuario = await Usuario.findByPk(IdUsuario);
      const nombreRegistrador = usuario
        ? usuario.Nombre
        : `Usuario ID ${IdUsuario}`;

      // Buscar elemento catálogo por IdElemento, no por IdAlquiler
      const elementoCatalogo = await PrestamoElementos.findOne({
        where: {
          Observaciones: "catalogo",
          IdElemento: IdElemento,
        },
      });

      if (!elementoCatalogo) {
        res
          .status(404)
          .json({ error: "Elemento no encontrado en el catálogo" });
        return;
      }

      if (
        !elementoCatalogo.CantidadDisponible ||
        elementoCatalogo.CantidadDisponible <= 0
      ) {
        res
          .status(400)
          .json({ error: "No hay unidades disponibles de este elemento" });
        return;
      }

      const nuevoAlquiler = await PrestamoElementos.create({
        NombreElemento: nombreElemento,
        FechaSolicitud: new Date(),
        FechaDevolucion: fechaDevolucion,
        RegistradoPor: nombreRegistrador,
        Observaciones: observaciones,
        IdUsuario,
        Imagen: elementoCatalogo.Imagen,
        IdElemento: IdElemento,
      });

      elementoCatalogo.CantidadDisponible -= 1;
      await elementoCatalogo.save();

      res.status(201).json({
        mensaje: "Alquiler registrado exitosamente desde QR.",
        alquiler: nuevoAlquiler,
      });
    } catch (error) {
      console.error("❌ Error al registrar alquiler desde QR:", error);
      res
        .status(500)
        .json({ error: "Error interno al registrar alquiler desde QR." });
    }
  };
  // Nuevo método: obtener alquileres filtrados por IdUsuario prestaran atencion zungas
  static getAlquileresPorUsuario = async (req: Request, res: Response) => {
    try {
      const { IdUsuario } = req.params;
      const alquileres = await PrestamoElementos.findAll({
        where: { IdUsuario },
        include: [Usuario], // Trae datos del usuario
      });
      res.json(alquileres);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al obtener alquileres por usuario" });
    }
  };

  static devolverElemento = async (req: Request, res: Response) => {
    try {
      const { IdAlquiler } = req.params;

      const alquiler = await PrestamoElementos.findByPk(IdAlquiler);

      if (!alquiler) {
        res.status(404).json({ error: "Alquiler no encontrado" });
        return;
      }

      if (!alquiler.IdElemento) {
        res
          .status(400)
          .json({
            error: "Este alquiler no tiene un elemento asociado para devolver",
          });
        return;
      }

      const elementoCatalogo = await PrestamoElementos.findOne({
        where: {
          Observaciones: "catalogo",
          IdAlquiler: alquiler.IdElemento,
        },
      });

      //  1. Aumentar stock si se encontró el catálogo
      if (elementoCatalogo) {
        elementoCatalogo.CantidadDisponible =
          (elementoCatalogo.CantidadDisponible || 0) + 1;
        await elementoCatalogo.save();
      }

      //  2. Marcar como entregado correctamente
      alquiler.CumplioConEntrega = true;
      await alquiler.save();

      res.json({
        mensaje:
          "Elemento devuelto correctamente, stock actualizado y entrega confirmada ✅",
      });
      return;
    } catch (error) {
      console.error("Error al devolver elemento:", error);
      res.status(500).json({ error: "Error interno al devolver elemento" });
      return;
    }
  };

  static marcarComoCumplido = async (req: Request, res: Response) => {
    try {
      const { IdAlquiler } = req.params;

      const alquiler = await PrestamoElementos.findByPk(IdAlquiler);
      if (!alquiler) {
        res.status(404).json({ error: "Alquiler no encontrado" });
        return;
      }

      alquiler.CumplioConEntrega = true;
      await alquiler.save();

      res.json({ mensaje: "Alquiler marcado como cumplido correctamente." });
      return;
    } catch (error) {
      console.error("Error al marcar como cumplido:", error);
      res
        .status(500)
        .json({ error: "Error al actualizar el estado del alquiler." });
      return;
    }
  };
}
