import { Request, Response } from 'express';
import { generarResumenEventoIA } from '../services/generarResumenEventoIA';

export class ResumenEventoIAController {
  static generar = async (req: Request, res: Response): Promise<void> => {
    const { IdActividad, IdEvento } = req.body;

    try {
      if (!IdActividad || !IdEvento) {
        res.status(400).json({ error: 'Faltan parámetros: IdActividad o IdEvento' });
        return;
      }

      const resultado = await generarResumenEventoIA(IdActividad, IdEvento);
      res.json(resultado);
    } catch (error) {
      console.error('Error al generar el resumen:', error);
      res.status(500).json({ error: 'Error interno al generar el resumen' });
    }
  };
}
