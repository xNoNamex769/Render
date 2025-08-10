import { Table, Column, Model, DataType, ForeignKey, BelongsTo ,HasMany} from 'sequelize-typescript';
import { Usuario } from './Usuario';

import { Feedback } from './Feedback';

@Table({ tableName: 'SolicitudApoyo' })
export class SolicitudApoyo extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdSolicitud: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare Descripcion: string;

  @Column({ type: DataType.STRING(100) })
  declare ContactoEmergencia: string;

  @Column({ type: DataType.ENUM("Psicologica", "Emocional", "Economica", "Otra"), allowNull: false })
  declare TipoAyuda: string;

  @Column({ type: DataType.ENUM("Pendiente", "En Proceso", "Atendido", "Finalizado") })
  declare Estado: string;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  @HasMany(() => Feedback)
  declare feedbacks: Feedback[];
}
