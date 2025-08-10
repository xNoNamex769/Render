import { Table, Column, Model, DataType, ForeignKey, BelongsTo ,HasOne} from 'sequelize-typescript';
import { GestionEvento } from './GestionEvento';
import { Usuario } from './Usuario';
import { Evento } from './Evento';
@Table({ tableName: 'planificacionevento' })

export class PlanificacionEvento extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdPlanificarE: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare NombreEvento: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare FechaEvento: Date;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare LugarDeEvento: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare Recursos: string;

  @ForeignKey(() => GestionEvento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdGestionE: number;
@Column({ type: DataType.STRING(100), allowNull: false })
declare TipoEvento: string;
@Column({ type: DataType.STRING(255), allowNull: true })
declare ImagenEvento: string;
@Column({ type: DataType.STRING(10), allowNull: true })
declare Trimestre: string;
@Column({
  type: DataType.ENUM("Manual", "Masivo"),
  allowNull: false,
  defaultValue: "Manual",
})
declare EstadoCarga: "Manual" | "Masivo";

  @BelongsTo(() => GestionEvento)
  declare gestionEvento: GestionEvento;
  @ForeignKey(() => Usuario)
@Column({ type: DataType.INTEGER, allowNull: false })
declare IdUsuario: number;
@HasOne(() => Evento, { foreignKey: 'IdPlanificarE', as: 'evento' })
declare evento: Evento;
@BelongsTo(() => Usuario)
declare usuario: Usuario;

}
