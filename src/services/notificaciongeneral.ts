import { Notificaciones } from '../models/Notificaciones';
import type { Server as IOServer } from 'socket.io';

interface NotificacionGeneralData {
  titulo: string;
  mensaje: string;
  tipo: 'Elemento' | 'Anuncio' | 'Catalogo';
  idUsuarios: number[];
  RutaDestino?: string; // nuevo campo
  imagenUrl?: string;   // nuevo campo
}

export async function enviarNotificacionGeneral(data: NotificacionGeneralData, io?: IOServer) {
  const fechaHoy = new Date();

  for (const idUsuario of data.idUsuarios) {
   await Notificaciones.create({
  Titulo: data.titulo,
  Mensaje: data.mensaje,
  TipoNotificacion: data.tipo,
  FechaDeEnvio: fechaHoy,
  IdEvento: null,
  IdUsuario: idUsuario,
  Confirmado: false,
  RutaDestino: data.RutaDestino || null,
  imagenUrl: data.imagenUrl || null,
});
    // ✅ Emitir datos al frontend con imagen y ruta
    if (io) {
      io.to(`usuario_${idUsuario}`).emit('nuevaNotificacion', {
        titulo: data.titulo,
        mensaje: data.mensaje,
        tipo: data.tipo,
        fecha: fechaHoy,
        IdUsuario: idUsuario,
        imagenUrl: data.imagenUrl ?? null,      // ✅ importante
        RutaDestino: data.RutaDestino ?? null   // ✅ importante
      });
    }
  }
}
