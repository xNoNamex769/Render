import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo
} from 'sequelize-typescript';
import { Actividad } from './Actividad';
import { Evento } from './Evento';

@Table({ tableName: 'ResumenEventoIA', timestamps: true })
export class ResumenEventoIA extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => Actividad)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdActividad: number;

  @BelongsTo(() => Actividad)
  declare Actividad: Actividad;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdEvento: number;

  @BelongsTo(() => Evento)
  declare Evento: Evento;

  @Column(DataType.INTEGER)
  declare totalInscritos: number;

  @Column(DataType.INTEGER)
  declare totalAsistentes: number;

  @Column(DataType.FLOAT)
  declare porcentajeParticipacion: number;

  @Column(DataType.STRING)
  declare fichaMayorParticipacion: string;

  @Column(DataType.STRING)
  declare jornadaDestacada: string;

  @Column(DataType.TEXT)
  declare resumenIA: string;
}
