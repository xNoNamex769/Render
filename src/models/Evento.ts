import { Table, Column, Model, DataType, ForeignKey, HasMany ,BelongsTo} from 'sequelize-typescript';
import { PlanificacionEvento } from './PlanificacionEvento';
import { Actividad } from './Actividad';
import { Notificaciones } from './Notificaciones';
import { RelUsuarioEvento } from './RelUsuarioEvento';
import { Usuario } from './Usuario';
@Table({ tableName: 'Evento', timestamps: true }) // Habilitar timestamps
export class Evento extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdEvento: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare NombreEvento: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare FechaInicio: Date;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare FechaFin: Date;

  @Column({ type: DataType.TIME, allowNull: false })
  declare HoraFin: string;

  @Column({ type: DataType.TIME, allowNull: false })
  declare HoraInicio: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare UbicacionEvento: string;

  @ForeignKey(() => PlanificacionEvento)
 @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
declare IdPlanificarE: number;


  @Column({ type: DataType.TEXT, allowNull: true })
  declare DescripcionEvento: string;

  @HasMany(() => Actividad,{
    onUpdate:'CASCADE',
    onDelete:'CASCADE'
  })
  declare actividades: Actividad[];
@Column({ type: DataType.TEXT, allowNull: true })
declare QREntrada: string;

@Column({ type: DataType.TEXT, allowNull: true })
declare QRSalida: string;

  @HasMany(() => Notificaciones)
  declare notificaciones: Notificaciones[];

  @HasMany(() => RelUsuarioEvento)
  declare relUsuarioEventos: RelUsuarioEvento[];
  
@ForeignKey(() => Usuario)
@Column({ type: DataType.INTEGER, allowNull: true })
declare IdUsuario: number;
@BelongsTo(() => PlanificacionEvento, { foreignKey: 'IdPlanificarE', as: 'PlanificacionEvento' })
declare planificacion: PlanificacionEvento;

@BelongsTo(() => Usuario, { foreignKey: "IdUsuario" })
declare creador: Usuario;
}
