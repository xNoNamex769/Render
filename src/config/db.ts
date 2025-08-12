import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

import { Usuario } from '../models/Usuario';
import { Actividad } from '../models/Actividad';
import { RolUsuario } from '../models/RolUsuario';
import { Aprendiz } from '../models/Aprendiz';
import { PrestamoElementos } from '../models/PrestamoElementos';
import { Asistencia } from '../models/Asistencia';
import { Constancia } from '../models/Constancia';
import { ConsultaIA } from '../models/ConsultaIA';
import { RelUsuarioEvento } from '../models/RelUsuarioEvento';
import { RelUsuarioFeedback } from '../models/RelUsuarioFeedback';
import { SolicitudApoyo } from '../models/SolicitudApoyo';
import { Feedback } from '../models/Feedback';
import { Notificaciones } from '../models/Notificaciones';
import { PlanificacionEvento } from '../models/PlanificacionEvento';
import { Evento } from '../models/Evento';
import { PerfilInstructor } from '../models/PerfilInstructor';
import { EventoActividad } from '../models/EventoActividad';
import { ReaccionEvento } from '../models/ReaccionEvento';
import { ResumenEventoIA } from '../models/ResumenEventoIA';
import { ComentarioIA } from '../models/ComentarioIA';
import { ConfirmacionAsistencia } from '../models/ConfirmacionAsistencia';
import { Elemento } from '../models/Elemento';
import { GestionEvento } from '../models/GestionEvento';
import { HistorialSolicitud } from '../models/HistorialSolicitud';






//ola

dotenv.config();

export const db = new Sequelize({
  database: process.env.DB_NAME as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string, 10),
  dialect: 'mysql',
  timezone: '-05:00',

  models: [Usuario, Actividad, RolUsuario, Aprendiz, PrestamoElementos, Asistencia, Constancia, ConsultaIA, RelUsuarioEvento, RelUsuarioFeedback, SolicitudApoyo, Feedback, Notificaciones, PlanificacionEvento, Evento, PerfilInstructor, EventoActividad, ReaccionEvento, ResumenEventoIA, ComentarioIA, ConfirmacionAsistencia, Elemento, GestionEvento, HistorialSolicitud],

  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
  }
});