import express from "express";
import colors from "colors";
import cors from "cors";
import morgan from "morgan";
import { db } from "./config/db";
import ActividadRouter from "./routes/Actividad.Routes";
import AlquilerElementosRouter from "./routes/AlquilerElementos.Routes";
import AsistenciaRouter from "./routes/Asistencia.Routes";
import ConstanciaRouter from "./routes/Constancia.Routes";
import ConsultaIARouter from "./routes/ConsultaIA.Routes";
import EventoRouter from "./routes/Evento.Routes";
import GestionEventoRouter from "./routes/GestionEvento.Routes";
import RelUsuarioFeedbackRouter from "./routes/RelUsuarioFeedback.Routes";
import RolUsuarioRouter from "./routes/RolUsuario.Routes";
import UsuarioRouter from "./routes/Usuario.Routes";
import FeedbackRouter from "./routes/Feedback.Routes";
import NotificacionesRouter from "./routes/Notificaciones.Routes";
import PlanificacionEventoRouter from "./routes/PlanificacionEvento.Routes";
import RelUsuarioEventoRouter from "./routes/RelUsuarioEvento.Routes";
import SolicitudApoyoRouter from "./routes/SolicitudApoyo.Routes";
import AnalisisIARouter from "./routes/AnalisisIA.Routes";
import HistorialSolicitudRouter from "./routes/HistorialSolicitud.Routes";
import analizarComentarioIARouter from "./routes/AnalizarComentarioIA.Routes";
import path from "path";
import NotiPruebaRouter from "./routes/NotiPrueba.Routes";
import ResumenEventoIARouter from "./routes/ResumenEventoIA.Routes";
import tokenTestRouter from "./routes/TokenTestRouter";
import ElementoRouter from "./routes/Elemento.Routes";
import qrcode from "./routes/qrcode";
import LudicaRouter from "./routes/Ludica.Routes";
import { iniciarLudicaDiaria } from "./cron/LudicaJob";
import { revisarAsistenciasIncompletas } from "./cron/RevisarAsistenciasIncompletas";
import PerfilInstructorRouter from "./routes/PerfilInstructor.Routes";
import aprendizRoutes from "./routes/Aprendiz.routes";
import EventoActividadRoutes from "./routes/EventoActividad.Routes";
import ReaccionEventoRouter from './routes/ReaccionEvento.Routes';
import dialogflowRouter from "./routes/dialogflowWebhook";
import EmailRoutes from "./routes/Email.Routes"



async function connectDB() {
  try {
    await db.authenticate();
    console.log(
      colors.blue.bold("Conexión exitosa a la Base de datos echo por Alex")
    );

    
    try {
      const [results, metadata] = await db.query("SELECT * FROM asistencia");
      console.log("Datos de ejemplo:", results);
    } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
    }
  } catch (error) {
    console.error("Error al conectar a la BD:", error);
    console.log(colors.red.bold("Falló la conexión a la BD"));
  }
}

connectDB();

const app = express();

app.set('trust proxy', 1);


app.use(cors());
app.use(morgan("dev"));

const rutaPublic = path.resolve(__dirname, "../public");
app.use(express.static(rutaPublic));

app.use("/qrcodes", express.static(path.join(__dirname, "../public/qrcodes")));
//acepta peticiones hasta de 10mb
app.use(express.json({ limit: "10mb" }));


app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json());
app.use("/api/dialogflow", dialogflowRouter);
app.use("/api/enviarcorreo", EmailRoutes);
app.use("/api/actividad", ActividadRouter);
app.use("/api/alquilerelementos", AlquilerElementosRouter);
app.use("/api/asistencia", AsistenciaRouter);
app.use("/api/constancia", ConstanciaRouter);
app.use('/api/reacciones', ReaccionEventoRouter);
app.use("/api/consultaia", ConsultaIARouter);
app.use("/api/evento", EventoRouter);
app.use("/api/gestionevento", GestionEventoRouter);
app.use("/api/relusuariofeedback", RelUsuarioFeedbackRouter);
app.use("/api/rolusuario", RolUsuarioRouter);
app.use("/api/usuario", UsuarioRouter);
app.use("/api/feedback", FeedbackRouter);
app.use("/api/notificaciones", NotificacionesRouter);
app.use("/api/test-token", tokenTestRouter);
app.use("/api/planificacionevento", PlanificacionEventoRouter);
app.use("/api/relusuarioevento", RelUsuarioEventoRouter);
app.use("/api/solicitudapoyo", SolicitudApoyoRouter);
app.use("/api/historial", HistorialSolicitudRouter);
app.use("/api/elemento", ElementoRouter);

app.use("/api/eventoactividad", EventoActividadRoutes);

app.use("/api/aprendices", aprendizRoutes);
app.use("/api/qrcode", qrcode);
app.use("/api/ludica", LudicaRouter);

app.use("/api/prueba-socket", NotiPruebaRouter);
iniciarLudicaDiaria();
revisarAsistenciasIncompletas();
app.use("/api/perfil-instructor", PerfilInstructorRouter);

app.use("/api/analisisia", AnalisisIARouter);
app.use("/api/resumenia", ResumenEventoIARouter);
app.use("/api/comentario", analizarComentarioIARouter);
export default app;
