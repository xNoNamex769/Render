import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Unique,
} from 'sequelize-typescript';
import { Usuario } from './Usuario';
import { Evento } from './Evento';

@Table({ tableName: 'ReaccionEvento', timestamps: true })
export class ReaccionEvento extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdReaccion: number;

  @ForeignKey(() => Usuario)
  @Unique('reaccion_unica')
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  @ForeignKey(() => Evento)
  @Unique('reaccion_unica')
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdEvento: number;

  @BelongsTo(() => Evento)
  declare evento: Evento;

  @Column({ type: DataType.ENUM('like', 'dislike'), allowNull: false })
  declare Tipo: 'like' | 'dislike';

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare FechaReaccion: Date;
}
