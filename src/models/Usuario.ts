import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasOne,
} from "sequelize-typescript";

import { RolUsuario } from "./RolUsuario";
import { Aprendiz } from "./Aprendiz"; // IMPORTANTEeeeeee me olvido: Importa Aprendiz aquí

import {  PrestamoElementos } from "./PrestamoElementos";
import { Asistencia } from "./Asistencia";
import { Constancia } from "./Constancia";
import { ConsultaIA } from "./ConsultaIA";
import { RelUsuarioEvento } from "./RelUsuarioEvento";
import { RelUsuarioFeedback } from "./RelUsuarioFeedback";
import { SolicitudApoyo } from "./SolicitudApoyo";
import { Actividad } from "./Actividad";
import { PerfilInstructor } from "./PerfilInstructor";

@Table({ tableName: "Usuario" })
export class Usuario extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare IdUsuario: number;

  @ForeignKey(() => RolUsuario)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdRol: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(50) })
  declare IdentificacionUsuario: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(100) })
  declare Nombre: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(100) })
  declare Apellido: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255) })
  declare Correo: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(20) })
  declare Telefono: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255) })
  declare Contrasena: string;

  @AllowNull(false)
  @Column({ type: DataType.DATEONLY })
  declare FechaRegistro: Date;

  @Column({ type: DataType.STRING(6), allowNull: true })
  declare token: string | null;

  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  declare confirmed: boolean;
@Column({ type: DataType.STRING, allowNull: true })
declare FotoPerfil: string | null;

  //  Asociación correcta con RolUsuario
  @BelongsTo(() => RolUsuario, { foreignKey: "IdRol", as: "rol" })
  declare rol: RolUsuario;

  // Asociación con Aprendiz directamente desde Usuario
  @HasOne(() => Aprendiz, { foreignKey: "IdUsuario",as:"perfilAprendiz" })
  declare aprendiz?: Aprendiz;

  // Relaciones adicionales
  @HasMany(() => PrestamoElementos)
  declare alquilerElementos: PrestamoElementos[];

  @HasMany(() => Asistencia)
  declare asistencias: Asistencia[];

  @HasMany(() => Constancia)
  declare constancias: Constancia[];

  @HasMany(() => ConsultaIA)
  declare consultasIA: ConsultaIA[];

  @HasMany(() => RelUsuarioEvento, { foreignKey: "IdUsuario" })
  declare relUsuarioEventos: RelUsuarioEvento[];

  @HasMany(() => RelUsuarioFeedback)
  declare relUsuarioFeedbacks: RelUsuarioFeedback[];
  @HasMany(() => Actividad, { foreignKey: "IdUsuario" })
  declare actividades: Actividad[];
  @HasOne(() => PerfilInstructor, { foreignKey: "UsuarioId", as: "perfilInstructor" })
  declare perfilInstructor: PerfilInstructor;

  @HasMany(() => SolicitudApoyo)
  declare solicitudesApoyo: SolicitudApoyo[];
}
