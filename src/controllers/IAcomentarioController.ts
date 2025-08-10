import { Request, Response } from "express";
import path from "path";
import { PythonShell, Options as PythonShellOptions } from "python-shell";
import { ComentarioIA } from "../models/ComentarioIA";

//  Normaliza texto: sin tildes, sin símbolos, minúsculas, etc.
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9 ]/g, "") // quitar símbolos raros
    .replace(/\s+/g, " ") // espacios dobles
    .trim()
    .replace(/(.)\1{2,}/g, "$1$1"); // quitar letras repetidas exageradamente
}

export class IAcomentarioController {
  // 🧠 GENERAR COMENTARIO IA
  static generarComentario = async (req: Request, res: Response) => {
    try {
      const { IdEvento, Feedbacks, Asistencias, IdUsuario } = req.body;

      if (!IdEvento || !IdUsuario) {
        res.status(400).json({
          error: "Faltan campos requeridos: IdEvento e IdUsuario.",
        });
      }

      const totalFeedbacks = Feedbacks?.length || 0;
      const totalAsistencias = Asistencias?.length || 0;
      const comentario = `El evento con ID ${IdEvento} recibió ${totalFeedbacks} feedbacks y tuvo ${totalAsistencias} asistencias.`;
      const comentarioNormalizado = normalizarTexto(comentario);

      // Ejecutar script Python
      const rutaScript = path.join(__dirname, "../../IA/predecir.py");

      const options: PythonShellOptions = {
        mode: "text",
        pythonOptions: ["-u"],
        scriptPath: path.dirname(rutaScript),
        args: [comentario],
      };

      const results = await PythonShell.run(path.basename(rutaScript), options);
      let recomendacion = results?.[0] || "Sin respuesta de la IA.";

      // Corrección manual si IA se equivoca
      const comentarioLower = comentario.toLowerCase();

      const frasesNegativas = [
        "no me gustó", "no me gusto", "no fue bueno", "no estuvo bien",
        "pésimo", "horrible", "aburrido", "flojo", "fatal", "malo",
        "0 asistencias", "nadie fue", "no fue nadie", "no hubo feedback"
      ];

      const frasesPositivas = [
        "me gustó", "excelente", "muy bueno", "me encantó",
        "estuvo bien", "interesante", "aprendí mucho", "positivo",
        "buena participación", "buen evento", "asistieron muchos"
      ];

      if (frasesNegativas.some(f => comentarioLower.includes(f)) && recomendacion.toLowerCase() === "positivo") {
        recomendacion = "Negativo";
      }

      if (frasesPositivas.some(f => comentarioLower.includes(f)) && recomendacion.toLowerCase() === "negativo") {
        recomendacion = "Positivo";
      }

      // Verificar duplicado por usuario y evento (normalizado)
      const yaExiste = await ComentarioIA.findOne({
        where: {
          IdEvento,
          IdUsuario,
          ComentarioNormalizado: comentarioNormalizado,
        },
      });

      if (!yaExiste) {
        await ComentarioIA.create({
          Comentario: comentario,
          ComentarioNormalizado: comentarioNormalizado,
          RecomendacionIA: recomendacion,
          IdUsuario,
          IdEvento,
        });
      } else {
        console.log("🟡 Comentario duplicado detectado, no se insertó.");
      }

      res.json({
        comentario,
        recomendacionIA: recomendacion,
      });

    } catch (error) {
      console.error("❌ Error generando comentario IA:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  };

  // 📊 GENERAR RECOMENDACIONES
  static generarRecomendaciones = async (req: Request, res: Response) => {
    try {
      const { IdEvento } = req.params;

      if (!IdEvento) {
        res.status(400).json({ error: "Falta el parámetro IdEvento." });
      }

      const comentarios = await ComentarioIA.findAll({ where: { IdEvento } });

      if (!comentarios.length) {
         res.status(404).json({ mensaje: "No hay comentarios para este evento." });
      }

      const total = comentarios.length;
      const negativos = comentarios.filter(c => c.RecomendacionIA.toLowerCase() === "negativo").length;
      const positivos = comentarios.filter(c => c.RecomendacionIA.toLowerCase() === "positivo").length;
      const repetidos = contarRepetidos(comentarios.map(c => c.ComentarioNormalizado || normalizarTexto(c.Comentario)));

      const recomendaciones: string[] = [];

      if (negativos / total > 0.5) {
        recomendaciones.push("Muchos comentarios negativos. Revisar contenido y logística del evento.");
      }

      if (positivos / total > 0.8) {
        recomendaciones.push("Excelente percepción general. Mantener el enfoque del evento.");
      }

      if (repetidos.length > 0) {
        recomendaciones.push("Los comentarios fueron muy breves o repetitivos.");
      }

      res.json({ IdEvento, recomendaciones });

    } catch (error) {
      console.error("❌ Error generando recomendaciones:", error);
      res.status(500).json({ error: "Error interno al generar recomendaciones." });
    }
  };
}

// 🔁 CONTAR REPETIDOS
function contarRepetidos(lista: string[]) {
  const conteo: Record<string, number> = {};
  lista.forEach(c => {
    const texto = c.trim().toLowerCase();
    conteo[texto] = (conteo[texto] || 0) + 1;
  });
  return Object.entries(conteo).filter(([_, count]) => count > 1);
}
