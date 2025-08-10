import { Table, Column, Model, DataType, HasMany ,BelongsTo,ForeignKey} from 'sequelize-typescript';
import { PlanificacionEvento } from './PlanificacionEvento';
import { Usuario } from './Usuario';
@Table({ tableName: 'GestionEvento' })
export class GestionEvento extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdGestionE: number;

  @Column({ type: DataType.ENUM("Aprobado", "Pendiente", "Rechazado"), allowNull: false })
  declare Aprobar: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare MotivoRechazo?: string;

  @HasMany(() => PlanificacionEvento)
  declare planificaciones: PlanificacionEvento[];
  @ForeignKey(() => Usuario)
@Column({ type: DataType.INTEGER, allowNull: false })
declare IdUsuario: number;


@BelongsTo(() => Usuario, { as: "gestionador" })
declare gestionador: Usuario;
}
