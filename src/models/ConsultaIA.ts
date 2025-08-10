import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Usuario } from './Usuario';

@Table({ tableName: 'consultaia' })
export class ConsultaIA extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdConsultaIA: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare Pregunta: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare Respuesta: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare Fecha: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare Descripcion: string;

  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number;
}
