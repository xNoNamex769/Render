import { Request, Response } from 'express';
import { ComentarioIA } from '../models/ComentarioIA';
import { db } from '../config/db';

export const obtenerAnalisisUnificado = async (req: Request, res: Response) => {
  try {
    const [resumenEventos]: any[] = await db.query(`SELECT * FROM ResumenEventoIA`);
    const comentariosIA = await ComentarioIA.findAll();

    const analisis = resumenEventos.map((evento: any) => {
     const comentariosEvento = comentariosIA
  .filter((c) => c.IdEvento === evento.IdEvento)
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // si tienes timestamps


      // Reglas básicas
      let recomendaciones = [];

      if (evento.TotalConfirmados > 10 && evento.TotalAsistieron / evento.TotalConfirmados < 0.6) {
        recomendaciones.push('Alta tasa de inasistencia. Considera enviar recordatorios.');
      }

      if (evento.FeedbackPromedioLargo < 20) {
        recomendaciones.push('Los comentarios fueron muy breves.');
      }

      if (evento.Recursos?.toLowerCase().includes('comida') && evento.TotalInasistencias > 2) {
        recomendaciones.push('Se podrían haber desperdiciado recursos como comida.');
      }

      return {
        IdEvento: evento.IdEvento,
        NombreEvento: evento.NombreEvento,
        Asistieron: evento.TotalAsistieron,
        Confirmados: evento.TotalConfirmados,
        FeedbackPromedioLargo: evento.FeedbackPromedioLargo,
        ComentariosIA: comentariosEvento.map(c => ({
          Comentario: c.Comentario,
          RecomendacionIA: c.RecomendacionIA,
        })),
        Recomendaciones: recomendaciones,
      };
    });

    res.json(analisis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generando análisis unificado de IA' });
  }
};
