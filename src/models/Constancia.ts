import { Table, Column, Model, DataType, ForeignKey,BelongsTo } from 'sequelize-typescript';
import { Usuario } from './Usuario';

@Table({ tableName: 'Constancia'  , timestamps:true})
export class Constancia extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare ConstanciaId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare ConstanciaHorasCert: number;

  @Column({ type: DataType.ENUM("Aprobado", "Pendiente"), allowNull: false })
  declare ConstanciaEstado: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare ConstanciaFecha: Date;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number;
    @BelongsTo(() => Usuario)
  declare usuario: Usuario;
}
