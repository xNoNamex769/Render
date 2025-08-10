import sys
import joblib
import os

# Definir ruta del modelo entrenado
ruta_modelo = os.path.join("IA", "modelos", "modelo_recomendacion.pkl")

if len(sys.argv) < 2:
    print("❌ No se proporcionó comentario.")
    sys.exit(1)

comentario = sys.argv[1].strip().lower()

frases_negativas = [
    "no me gustó", "no me gusto", "no fue bueno", "no estuvo bien", 
    "pésimo", "horrible", "aburrido", "flojo", "fatal", "malo",
    "no me gustó nada", "muy mal organizado", "mala organización", 
    "no aprendí nada", "pérdida de tiempo", "no sirvió", 
    "fue un desastre", "poca asistencia", "no hubo asistencia",
    "0 asistencias", "nadie fue", "no fue nadie", "no hubo feedback"
]

frases_positivas = [
    "me gustó", "excelente", "muy bueno", "me encantó", 
    "estuvo bien", "interesante", "aprendí mucho", "positivo",
    "buena participación", "buen evento", "asistieron muchos", 
    "buena organización", "fue útil", "mejor evento", "muy dinámico"
]

if any(frase in comentario for frase in frases_negativas):
    print("Negativo")
    sys.exit(0)

if any(frase in comentario for frase in frases_positivas):
    print("Positivo")
    sys.exit(0)

try:
    modelo = joblib.load(ruta_modelo)
    prediccion = modelo.predict([comentario])[0]
    print(prediccion.capitalize())
except Exception as e:
    print("❌ Error al cargar o ejecutar el modelo:", e)
    sys.exit(1)
