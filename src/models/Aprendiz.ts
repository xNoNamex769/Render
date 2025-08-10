import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey } from 'sequelize-typescript';
import { Usuario } from './Usuario';
import { RolUsuario } from './RolUsuario';

@Table({ tableName: 'Aprendiz' })
export class Aprendiz extends Model {
  @PrimaryKey
  @ForeignKey(() => Usuario)
  @Column
  declare IdUsuario: number;

  @ForeignKey(() => RolUsuario)
  @Column
  declare IdRolUsuario: number;

  @Column({ type: DataType.STRING })
  declare Ficha: string;

  @Column({ type: DataType.STRING })
  declare Jornada: string;

  @Column({ type: DataType.STRING })
  declare ProgramaFormacion: string;

@BelongsTo(() => Usuario, { as: 'usuario' })
declare usuario: Usuario;

@BelongsTo(() => RolUsuario, { as: 'rolUsuario' }) //  alias necesario aquí
declare rolUsuario: RolUsuario;

}
