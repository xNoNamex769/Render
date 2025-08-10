import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { Usuario } from './Usuario';
import { Evento } from './Evento';

@Table({
  tableName: 'RelUsuarioEvento',
  timestamps: true,
})
export class RelUsuarioEvento extends Model<RelUsuarioEvento, {
  IdUsuario: number;
  IdEvento: number;
  ConfirmoAsistencia?: boolean;
  Asistio?: boolean;
  Penalizacion?: number;
}>
{
  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true })
  declare IdUsuario: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true })
  declare IdEvento: number;
  // El usuario confirmó que asistiría
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare ConfirmoAsistencia: boolean;

  // El usuario asistió efectivamente
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare Asistio: boolean;

  // Penalización por no asistir (esto lo puedes usar para lógica adicional)
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare Penalizacion: number;

  @BelongsTo(() => Usuario, { foreignKey: 'IdUsuario', as: 'Usuario' })
declare Usuario: Usuario;

@BelongsTo(() => Evento, { foreignKey: 'IdEvento', as: 'Evento' })
declare Evento: Evento;

}
