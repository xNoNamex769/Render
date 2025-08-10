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

@Table({ tableName: 'ComentariosIA', timestamps: true })
export class ComentarioIA extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdComentario: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare Comentario: string;

  @Column({ type: DataType.STRING })
  declare RecomendacionIA: string;
   @Column({ type: DataType.TEXT, allowNull: true })
  declare ComentarioNormalizado: string;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER })
  declare IdUsuario: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER })
  declare IdEvento: number;

  @BelongsTo(() => Evento)
  declare evento: Evento;
}
