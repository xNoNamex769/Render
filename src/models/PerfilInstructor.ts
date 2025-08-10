import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Usuario } from './Usuario';

@Table({
  tableName: 'PerfilInstructor',
  timestamps: false,
})
export class PerfilInstructor extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare UsuarioId: number;

  @BelongsTo(() => Usuario, { foreignKey: 'UsuarioId', as: 'usuario' })
  declare usuario: Usuario;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare profesion: string;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare ubicacion: string;
@Column({ type: DataType.TEXT, allowNull: true })
declare imagenUbicacion: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare imagen: string; // base64 o url
}
