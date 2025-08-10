import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Usuario } from './Usuario';

@Table({ tableName: 'RolUsuario' })
export class RolUsuario extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdRol: number;

  @Column({
    type: DataType.ENUM('Administrador', 'Aprendiz', 'Instructor'),
    allowNull: false,
  })
  declare NombreRol: string;

  // 👇 Relación con usuarios (un rol puede tener muchos usuarios)
  @HasMany(() => Usuario, { foreignKey: 'IdRol', as: 'usuarios' })
  declare usuarios: Usuario[];
}
