import { Request, Response } from "express";
import * as xlsx from "xlsx";
import { Usuario } from "../models/Usuario";
import { Aprendiz } from "../models/Aprendiz";
import { RolUsuario } from "../models/RolUsuario";
import { hashPassword } from "../utils/auth";
import { AprendizExcelRow } from "../types/AprendizExcelRow";

export class AprendizController {
  static subirDesdeExcel = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No se subió ningún archivo" });
        return;
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
     const data: AprendizExcelRow[] = xlsx.utils.sheet_to_json<AprendizExcelRow>(
  workbook.Sheets[sheetName]
);


      for (const row of data) {
        const {
          IdentificacionUsuario,
          Nombre,
          Apellido,
          Correo,
          Telefono,
          Contrasena,
          Ficha,
          ProgramaFormacion,
          Jornada,
        } = row;

        const yaExiste = await Usuario.findOne({ where: { Correo } });
        if (yaExiste) continue;

      const contrasenaLimpia = typeof row.Contrasena === "string" && row.Contrasena.trim() !== ""
  ? row.Contrasena
  : "123456";

const hashed = await hashPassword(contrasenaLimpia);


        const usuario = await Usuario.create({
          IdentificacionUsuario,
          Nombre,
          Apellido,
          Correo,
          Telefono,
          Contrasena: hashed,
          FechaRegistro: new Date(),
          token: "",
          IdRol: 2,
          confirmed: true,
        });

        const rol = await RolUsuario.create({
          IdUsuario: usuario.IdUsuario,
          NombreRol: "Aprendiz",
        });

        await Aprendiz.create({
          IdUsuario: usuario.IdUsuario,
          IdRolUsuario: rol.IdRol,
          Ficha,
          ProgramaFormacion,
          Jornada,
        });
      }

      res.json({ mensaje: "✅ Datos importados correctamente" });
    } catch (error) {
      console.error(" Error al importar Excel:", error);
      res.status(500).json({ error: "Error al importar datos" });
    }
  };

static listarAprendices = async (req: Request, res: Response) => {
  try {
    const aprendices = await Aprendiz.findAll({
      attributes: ['Ficha', 'ProgramaFormacion', 'Jornada'], // Estos campos son del aprendiz directamente
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ['Nombre', 'Apellido', 'Correo', 'Telefono', 'IdentificacionUsuario'],
        },
        {
          model: RolUsuario,
          as: "rolUsuario", 
          attributes: ['NombreRol'],
        },
      ],
    });

    res.json(aprendices);
  } catch (error) {
    console.error("Error al obtener aprendices:", error);
    res.status(500).json({ error: "Error al obtener aprendices" });
  }
};
}