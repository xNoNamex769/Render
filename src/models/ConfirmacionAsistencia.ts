import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Usuario } from './Usuario';
import { Evento } from './Evento';

@Table({ tableName: 'ConfirmacionAsistencia', timestamps: true })
export class ConfirmacionAsistencia extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdConfirmacion: number;
@Column({ type: DataType.BOOLEAN, defaultValue: false })
declare Confirmado: boolean;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdEvento: number;

  @BelongsTo(() => Evento)
  declare evento: Evento;

  @Column({
    type: DataType.ENUM('Asistiré', 'No asistiré', 'Tal vez'),
    allowNull: false,
  })
  declare Confirmacion: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare FechaConfirmacion: Date;
}
