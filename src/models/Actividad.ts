import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { Evento } from './Evento';
import { Asistencia } from './Asistencia';
import { Usuario } from './Usuario'; //  puto en que lo lea / jajajhsaskla el modelo de usuario

@Table({
  tableName: 'Actividad',
  timestamps: true,
})
export class Actividad extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdActividad: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare NombreActi: string;

 @Column({ type: DataType.DATEONLY, allowNull: false })
declare FechaInicio: string;

@Column({ type: DataType.DATEONLY, allowNull: false })
declare FechaFin: string;


  @Column({ type: DataType.TIME, allowNull: false })
  declare HoraInicio: string;

  @Column({ type: DataType.TIME, allowNull: false })
  declare HoraFin: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare TipoLudica: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare Descripcion: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare Imagen: string;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare Ubicacion: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare CodigoQR: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare CodigoQRSalida: string;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare IdEvento: number;

  @BelongsTo(() => Evento)
  declare evento: Evento;

  @HasMany(() => Asistencia)
  declare asistencias: Asistencia[];

  //  NUEVO: Relación con Usuario (creador)
  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare IdUsuario: number;
@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
declare HorarioContinuo: boolean;
  @BelongsTo(() => Usuario)
declare usuario: Usuario;
}
