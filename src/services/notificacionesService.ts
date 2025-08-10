import { Notificaciones } from '../models/Notificaciones';
import type { Server as IOServer } from 'socket.io';

interface NotificacionData {
  titulo: string;
  mensaje: string;
  tipo: 'Evento' | 'Actividad' | 'Anuncio' | 'Solicitud' | 'Respuesta' | 'Catalogo' |'Lúdica' |'Asistencia';
  idUsuarios: number[];
  RutaDestino?: string |null; // nuevo campo
  idEvento?: number |null;
   imagenUrl?: string | null;    
}

// ahora recibe io como parámetro
export async function enviarNotificacion(data: NotificacionData, io?: IOServer) {
  const fechaHoy = new Date();

  for (const idUsuario of data.idUsuarios) {
    await Notificaciones.create({
      Titulo: data.titulo,
      Mensaje: data.mensaje,
      TipoNotificacion: data.tipo,
      FechaDeEnvio: fechaHoy,
      IdEvento: data.idEvento ?? null,
      IdUsuario: idUsuario,
      Confirmado: false,
    });

    // ✅ Emitir al usuario (si se pasó io y estás usando rooms por usuario)
    if (io) {
      io.to(`usuario_${idUsuario}`).emit('nuevaNotificacion', {
        titulo: data.titulo,
        mensaje: data.mensaje,
        tipo: data.tipo,
        fecha: fechaHoy,
        IdUsuario: idUsuario,
      });
    }
  }
}
