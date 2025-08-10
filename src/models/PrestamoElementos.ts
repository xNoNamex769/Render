import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Usuario } from './Usuario';
import { Elemento } from './Elemento';

@Table({
  tableName: 'PrestamoElementos',
  timestamps: true,
})
export class  PrestamoElementos extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdAlquiler: number;
@Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 1 })
declare CantidadDisponible: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare NombreElemento: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare FechaSolicitud: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare FechaDevolucion: Date;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare RegistradoPor: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare Observaciones: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare Imagen: string;

  // Relación con Usuario
  @ForeignKey(() => Usuario)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare IdUsuario: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  // Relación con Elemento
  @ForeignKey(() => Elemento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare IdElemento: number;
@Column({ type: DataType.BOOLEAN, defaultValue: false })
declare CumplioConEntrega: boolean;

  @BelongsTo(() => Elemento)
  declare elemento: Elemento;
}
