import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Evento } from './Evento';
import { Usuario } from './Usuario';

@Table({
  tableName: 'Notificaciones',
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
})
export class Notificaciones extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdNotificacion: number;

  // NUEVO: Título de la notificación
  @Column({ type: DataType.STRING(100), allowNull: false })
  declare Titulo: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare Mensaje: string;

  // CAMBIADO: Nombre actualizado del campo ENUM
  @Column({
    type: DataType.ENUM('Evento', 'Actividad', 'Anuncio', 'Solicitud', 'Respuesta', 'Lúdica'),
    allowNull: false,
  })
  declare TipoNotificacion: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare FechaDeEnvio: Date;

 @ForeignKey(() => Evento)
@Column({ type: DataType.INTEGER, allowNull: true }) // antes decía false ❌
declare IdEvento: number | null;
@Column({ type: DataType.STRING, allowNull: true })
declare RutaDestino: string | null;
@Column({ type: DataType.STRING, allowNull: true })
declare imagenUrl: string | null;
  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number;

  // NUEVO: Confirmación de recepción (como "visto" o asistencia)
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare Confirmado: boolean;
}
