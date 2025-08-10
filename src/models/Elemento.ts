import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import {   PrestamoElementos } from "./PrestamoElementos";

@Table({
  tableName: "Elemento",
  timestamps: true,
})
export class Elemento extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdElemento: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare Nombre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare Descripcion: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare Imagen: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare Disponible: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare CantidadTotal: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare CantidadDisponible: number;

  @HasMany(() => PrestamoElementos)
  declare alquileres: PrestamoElementos[];
}
