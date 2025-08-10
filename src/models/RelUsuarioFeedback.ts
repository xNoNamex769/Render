import { Table, Column, Model, ForeignKey, DataType, PrimaryKey } from 'sequelize-typescript';
import { Usuario } from './Usuario';
import { Feedback } from './Feedback';

@Table({ tableName: 'RelUsuarioFeedback',timestamps:true })
export class RelUsuarioFeedback extends Model {
  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: false  , primaryKey:true})
  declare IdUsuario: number;

  @ForeignKey(() => Feedback)
  @Column({ type: DataType.INTEGER, allowNull: false , primaryKey:true })
  declare IdFeedback: number;

  @Column({ type: DataType.DATEONLY, allowNull: true ,  })
  declare FechaRelUsuaFeed: Date;
}
