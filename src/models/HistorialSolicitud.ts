import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SolicitudApoyo } from './SolicitudApoyo';
import { Usuario } from './Usuario';

@Table({ tableName: 'HistorialSolicitud' })
export class HistorialSolicitud extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdHistorial: number;

  @ForeignKey(() => SolicitudApoyo)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdSolicitud: number;

  @BelongsTo(() => SolicitudApoyo)
  declare solicitud: SolicitudApoyo;

  @Column({ type: DataType.ENUM('Pendiente', 'En Proceso', 'Atendido', 'Finalizado'), allowNull: false })
  declare EstadoNuevo: string;

  @Column({ type: DataType.TEXT })
  declare Comentario: string;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number; // El usuario que hizo el cambio

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;
}
