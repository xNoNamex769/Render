import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { Evento } from './Evento';
import { Actividad } from './Actividad';
import { Usuario } from './Usuario';
import { SolicitudApoyo } from './SolicitudApoyo';
@Table({ tableName: 'Feedback' })
export class Feedback extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdFeedback: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare ComentarioFeedback: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare FechaEnvio: Date;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare Calificacion: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare IdEvento: number;

  @BelongsTo(() => Evento)
  declare evento: Evento;

  @ForeignKey(() => Actividad)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare IdActividad: number;

  @BelongsTo(() => Actividad)
  declare actividad: Actividad;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number;
@ForeignKey(() => SolicitudApoyo)
@Column({ type: DataType.INTEGER, allowNull: true })
declare IdSolicitud: number;

@BelongsTo(() => SolicitudApoyo)
declare solicitud: SolicitudApoyo;
  @BelongsTo(() => Usuario)
  declare usuario: Usuario;
}
