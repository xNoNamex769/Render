import { Request, Response } from "express";
import * as xlsx from "xlsx";
import { Usuario } from "../models/Usuario";
import { Aprendiz } from "../models/Aprendiz";
import { RolUsuario } from "../models/RolUsuario";
import { hashPassword } from "../utils/auth";
import { AprendizExcelRow } from "../types/AprendizExcelRow";

export class AprendizController {
 static subirDesdeExcel = async (req: Request, res: Response) => {
  const fs = require('fs/promises')
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se subió ningún archivo' })
      return
    }

    // ---------- leer workbook y sheet ----------
    const workbook = xlsx.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    // ---------- leer todas las filas como arrays para detectar encabezado ----------
    const rawRows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' })

    const normalizeCell = (v: any) =>
      v
        .toString()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_\-\s]+/g, ' ')
        .toLowerCase()

    // keywords para reconocer fila encabezado
    const headerKeywords = [
      'identificacion',
      'documento',
      'id',
      'cedula',
      'correo',
      'email',
      'e mail',
      'nombre',
      'nombres',
      'apellido',
      'apellidos',
      'ficha',
      'programa',
      'jornada',
    ]

    // detectar fila de encabezado (miramos primeras 10 filas)
    let headerRowIndex = -1
    for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
      const row = rawRows[r] ?? []
      const normalizedCells = row.map(normalizeCell)
      const matches = normalizedCells.filter((c: string) =>
        headerKeywords.some((kw) => c.includes(kw))
      )
      if (matches.length >= 2) {
        headerRowIndex = r
        break
      }
    }

    // fallback: primera fila con >=2 celdas no vacías
    if (headerRowIndex === -1) {
      for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
        const row = rawRows[r] ?? []
        const nonEmptyCount = row.filter((c: any) => c !== '' && c !== null && c !== undefined).length
        if (nonEmptyCount >= 2) {
          headerRowIndex = r
          break
        }
      }
    }

    if (headerRowIndex === -1) headerRowIndex = 0

    console.log('Detected header row index:', headerRowIndex, 'header cells:', rawRows[headerRowIndex])

    // construir header limpio (ej: 'identificacion', 'correo', 'nombre', ...)
    const headerRow = rawRows[headerRowIndex].map((c: any) =>
      normalizeCell(c).replace(/\s+/g, '_')
    )

    // construir dataRaw a partir de filas luego del headerRow
    const dataRaw: any[] = []
    for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
      const row = rawRows[r]
      if (!row || row.every((cell: any) => cell === '' || cell === null || cell === undefined)) continue
      const obj: any = {}
      for (let c = 0; c < headerRow.length; c++) {
        const key = headerRow[c] || `col_${c}`
        obj[key] = (row[c] ?? '').toString()
      }
      dataRaw.push(obj)
    }

    // ---------- mapa de sinónimos -> claves canónicas ----------
    const headerMap: Record<string, string> = {
      identificacionusuario: 'IdentificacionUsuario',
      identificacion: 'IdentificacionUsuario',
      id: 'IdentificacionUsuario',
      documento: 'IdentificacionUsuario',
      numero: 'IdentificacionUsuario',
      cedula: 'IdentificacionUsuario',
      cedula_de_ciudadania: 'IdentificacionUsuario',

      correo: 'Correo',
      email: 'Correo',
      'e_mail': 'Correo',
      'correo_electronico': 'Correo',
      'correo_electronico_': 'Correo',
      'correo_electrónico': 'Correo',

      nombre: 'Nombre',
      nombres: 'Nombre',

      apellido: 'Apellido',
      apellidos: 'Apellido',

      telefono: 'Telefono',
      celular: 'Telefono',
      tel: 'Telefono',
      'telefono_movil': 'Telefono',

      contrasena: 'Contrasena',
      contraseña: 'Contrasena',
      password: 'Contrasena',

      ficha: 'Ficha',
      'ficha_caracterizacion': 'Ficha',
      'ficha_de_caracterizacion': 'Ficha',

      programa: 'ProgramaFormacion',
      'programa_formacion': 'ProgramaFormacion',
      'programa_de_formacion': 'ProgramaFormacion',

      jornada: 'Jornada',
    }

    const normalizeKey = (k: string) =>
      k
        .toString()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_\-\s]+/g, ' ')
        .toLowerCase()

    // transformar dataRaw (keys normalizeadas) a data con claves canónicas
    const data = dataRaw.map((row: any) => {
      const nr: any = {}
      for (const origKey of Object.keys(row)) {
        const nk = normalizeKey(origKey).replace(/\s+/g, '_')
        const mapped = headerMap[nk.replace(/_/g, '')] || headerMap[nk] || headerMap[nk.replace(/_/g, ' ')]
        // intenta varias variantes: sin guiones, con guiones, con espacios
        if (mapped) {
          nr[mapped] = row[origKey]
        } else {
          // no mapeado: guardamos algo util por si acaso
          nr[nk] = row[origKey]
        }
      }
      return nr
    })

    // logear cabeceras originales para debug
    if (dataRaw.length > 0) {
      console.log('Cabeceras detectadas (raw object keys):', Object.keys(dataRaw[0]))
    }

    // ---------- reporte ----------
    const report = {
      total: data.length,
      inserted: 0,
      skippedExisting: 0,
      skippedMissing: 0,
      errors: [] as { row: number; reason: string }[],
      processed: [] as Array<{
        IdentificacionUsuario: string
        Correo: string
        Nombre: string
        Apellido: string
        status: 'inserted' | 'skipped' | 'error'
        motivo?: string
      }>,
    }

    // ---------- procesar filas ----------
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      try {
        // sacar valores usando claves canónicas (o fallback)
        const IdentificacionUsuario =
          (row.IdentificacionUsuario ?? row.identificacion ?? row.id ?? row.documento ?? '').toString().trim()
        const Nombre = (row.Nombre ?? row.nombre ?? row.Nombres ?? '').toString().trim()
        const Apellido = (row.Apellido ?? row.apellidos ?? '').toString().trim()
        const Correo = (row.Correo ?? row.email ?? row['correo'] ?? '').toString().trim().toLowerCase()
        const Telefono = (row.Telefono ?? row.celular ?? row.tel ?? '').toString().trim()
        const ContrasenaRaw = (row.Contrasena ?? row.password ?? row.contraseña ?? '').toString()
        const Ficha = (row.Ficha ?? row.ficha ?? row['ficha_de_caracterizacion'] ?? '').toString().trim()
        const ProgramaFormacion = (row.ProgramaFormacion ?? row.programa ?? '').toString().trim()
        const Jornada = (row.Jornada ?? row.jornada ?? '').toString().trim()

        // Si no hay correo y no hay identificación, saltamos
        if (!Correo && !IdentificacionUsuario) {
          report.skippedMissing++
          report.processed.push({
            IdentificacionUsuario,
            Correo,
            Nombre,
            Apellido,
            status: 'skipped',
            motivo: 'Falta correo e identificación',
          })
          if (report.skippedMissing === 1) {
            console.warn('Primera fila sin ID/Correo detectada (raw row):', dataRaw[i])
          }
          continue
        }

        // Comprobar existencia
        const yaPorCorreo = Correo ? await Usuario.findOne({ where: { Correo } }) : null
        const yaPorId = IdentificacionUsuario ? await Usuario.findOne({ where: { IdentificacionUsuario } }) : null

        if (yaPorCorreo || yaPorId) {
          report.skippedExisting++
          report.processed.push({
            IdentificacionUsuario,
            Correo,
            Nombre,
            Apellido,
            status: 'skipped',
            motivo: 'Ya existe usuario con ese correo o identificación',
          })
          continue
        }

        // contraseña por defecto
        const contrasenaLimpia =
          typeof ContrasenaRaw === 'string' && ContrasenaRaw.trim() !== '' ? ContrasenaRaw.trim() : '123456'
        const hashed = await hashPassword(contrasenaLimpia)

        // crear Usuario
        const usuario = await Usuario.create({
          IdentificacionUsuario,
          Nombre,
          Apellido,
          Correo,
          Telefono,
          Contrasena: hashed,
          FechaRegistro: new Date(),
          token: '',
          IdRol: 2,
          confirmed: true,
        })
        console.log('Usuario creado (IdUsuario):', usuario?.IdUsuario, 'Correo:', Correo)

        // crear rol
        const rol = await RolUsuario.create({
          IdUsuario: usuario.IdUsuario,
          NombreRol: 'Aprendiz',
        })
        console.log('RolUsuario creado (IdRol):', rol?.IdRol, 'para usuario:', usuario?.IdUsuario)

        // crear aprendiz
        const aprendiz = await Aprendiz.create({
          IdUsuario: usuario.IdUsuario,
          IdRolUsuario: rol.IdRol,
          Ficha,
          ProgramaFormacion,
          Jornada,
        })
        console.log('Aprendiz creado (IdUsuario en Aprendiz):', aprendiz?.IdUsuario)

        report.inserted++
        report.processed.push({
          IdentificacionUsuario,
          Correo,
          Nombre,
          Apellido,
          status: 'inserted',
          motivo: 'Insertado',
        })
      } catch (rowErr: any) {
        report.errors.push({ row: i + 1, reason: rowErr.message || String(rowErr) })
        report.processed.push({
          IdentificacionUsuario: (data[i]?.IdentificacionUsuario ?? '').toString(),
          Correo: (data[i]?.Correo ?? '').toString(),
          Nombre: (data[i]?.Nombre ?? '').toString(),
          Apellido: (data[i]?.Apellido ?? '').toString(),
          status: 'error',
          motivo: rowErr.message || 'Error procesando fila',
        })
      }
    }

    // intentar borrar archivo temporal
    try {
      await fs.unlink(req.file.path)
    } catch (e) {
      console.warn('No se pudo borrar archivo temporal:', e)
    }

    res.json({ mensaje: '✅ Datos importados (parcial/total)', reporte: report })
    return
  } catch (error: any) {
    console.error(' Error al importar Excel:', error)
    try {
      if (req?.file?.path) {
        const fs = require('fs/promises')
        await fs.unlink(req.file.path).catch(() => {})
      }
    } catch {}
    res.status(500).json({ error: 'Error al importar datos', details: error.message || error })
    return
  }
}


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