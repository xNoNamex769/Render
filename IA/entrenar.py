# IA/entrenar.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
import joblib
import os

# Crear datos de ejemplo simulando tus eventos reales
data = {
    "Comentario": [
        "Muy buena actividad, aprendí bastante",
        "No me gustó, muy desorganizado",
        "Excelente comida y organización",
        "No aprendí nada",
        "Me gustó pero faltó tiempo",
        "Demasiado largo y aburrido",
        "Actividad útil y bien explicada",
        "La actividad estuvo excelente, aprendí mucho",
        "Hubo problemas con la logística",
        "Buena dinámica pero mala puntualidad",
        "Todo salió perfecto, gracias",
        "Faltó más interacción",
        "El instructor no fue claro",
        "El evento fue muy corto",
        "Muy motivador y bien estructurado"
    ],
    "Recomendacion": [
        "positivo",
        "mejorar organización",
        "positivo",
        "mejorar contenido",
        "positivo",
        "reducir duración",
        "positivo",
        "positivo",
        "mejorar organización",
        "mejorar puntualidad",
        "positivo",
        "mejorar interacción",
        "mejorar explicación",
        "extender duración",
        "positivo"
    ]
}


df = pd.DataFrame(data)

# Creamos el pipeline con vectorizador y árbol de decisión
modelo = Pipeline([
    ("vectorizer", TfidfVectorizer()),
    ("classifier", DecisionTreeClassifier())
])

# Entrenamos el modelo
X_train, X_test, y_train, y_test = train_test_split(df["Comentario"], df["Recomendacion"], test_size=0.2, random_state=42)
modelo.fit(X_train, y_train)

# Guardamos el modelo
os.makedirs("IA/modelos", exist_ok=True)
joblib.dump(modelo, "IA/modelos/modelo_recomendacion.pkl")

print("✅ Modelo entrenado y guardado correctamente.")
