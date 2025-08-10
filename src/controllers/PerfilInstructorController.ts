import { Request, Response } from 'express';
import { Usuario } from '../models/Usuario';
import { PerfilInstructor } from '../models/PerfilInstructor';
import { RolUsuario } from '../models/RolUsuario';

export class PerfilInstructorController {

  // Crear perfil
static async crearPerfil(req: Request, res: Response) {
  const { UsuarioId, profesion, ubicacion, imagen } = req.body;

  if (!UsuarioId) {
  res.status(400).json({ error: 'UsuarioId es obligatorio' });
  return;
  }
  
  // Puedes validar que profesión y ubicación no estén vacíos si quieres
  // pero si quieres permitir campos vacíos, no pongas validación estricta
  
  try {
    const nuevoPerfil = await PerfilInstructor.create({
      UsuarioId,
      profesion,  // puede ser string vacío ''
      ubicacion,
      imagen,
    });

    res.status(201).json(nuevoPerfil);
  } catch (error) {
    console.error('❌ Error al crear perfil instructor:', error);
    res.status(500).json({ error: 'No se pudo crear el perfil' });
  }
}




 static async listarInstructores(req: Request, res: Response) {
  try {
    const instructores = await Usuario.findAll({
      where: { IdRol: 3 },
      attributes: ['IdUsuario', 'Nombre', 'Correo', 'Telefono'],
      include: [
        {
          model: PerfilInstructor,
          as:'perfilInstructor',
          attributes: ['profesion', 'ubicacion', 'imagen'],
        },
        {
          model: RolUsuario,
          as:'rol',
          attributes: ['NombreRol'],
        },
      ],
    });

    const resultado = instructores.map(instructor => {
      const perfil = instructor.perfilInstructor;
      const rol = instructor.rol;

      return {
        UsuarioId: instructor.IdUsuario,
        nombre: instructor.Nombre,
        correo: instructor.Correo,
        telefono: instructor.Telefono,
        profesion: perfil?.profesion,   // aquí sin el || ''
        ubicacion: perfil?.ubicacion,   // aquí sin el || ''
        imagen: perfil?.imagen,         // aquí sin el || ''
        rol: rol?.NombreRol || ''
      };
    });

    res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener instructores:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}


static async obtenerPorUsuarioId(req: Request, res: Response) {
  const { UsuarioId } = req.params;

  try {
    const perfil = await PerfilInstructor.findOne({ where: { UsuarioId } });

    if (!perfil) {
    res.status(404).json({ mensaje: 'Perfil no encontrado' });
    return;
    }

     res.json(perfil);
     return;
  } catch (error) {
    console.error("❌ Error al buscar perfil:", error);
    res.status(500).json({ error: 'Error al buscar el perfil' });
    return;
  }
}

static async actualizarPerfil(req: Request, res: Response) {
  const { UsuarioId } = req.params;
  const { profesion, ubicacion, imagen } = req.body;

  try {
    const perfil = await PerfilInstructor.findOne({ where: { UsuarioId } });

    if (!perfil) {
       res.status(404).json({ mensaje: 'Perfil no encontrado' });
       return;
    }

    perfil.profesion = profesion;
    perfil.ubicacion = ubicacion;
    perfil.imagen = imagen;

    await perfil.save();

    res.json({ mensaje: 'Perfil actualizado correctamente', perfil });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
}
}